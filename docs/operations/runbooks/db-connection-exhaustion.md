# Runbook: Database Connection Exhaustion

**Alert:** `CerebroDBConnectionPoolExhausted`  
**Severity:** Warning (> 80% pool used) → Critical (> 95% pool used)  
**Oncall team:** Platform SRE / Database  
**Escalation:** `#sre-incidents` → PagerDuty P1 (connections > 95% causes request failures)

---

## What is happening

The PostgreSQL connection pool (PgBouncer) is near or at capacity. New requests requiring a DB connection will either queue (adding latency) or fail immediately with `"connection pool is full"`. This manifests as 500 errors in forge-api and other services.

---

## Immediate response (< 5 min)

1. **Check current connection count.**
   ```bash
   kubectl exec -n cerebro-prod deploy/pgbouncer -- \
     psql -p 6432 pgbouncer -c "SHOW POOLS;" | grep -v "^$\|---\|pool_mode"
   ```

   Key columns: `cl_active` (clients using a server conn), `cl_waiting` (queued), `sv_idle` (free server conns).

2. **Check Postgres directly.**
   ```bash
   kubectl exec -n cerebro-prod deploy/forge-api -- \
     psql $DATABASE_URL -c "
       SELECT count(*), state, wait_event_type, wait_event
       FROM pg_stat_activity
       WHERE datname = 'cerebrohive'
       GROUP BY state, wait_event_type, wait_event
       ORDER BY count DESC;
     "
   ```

3. **Find which app is holding the most connections.**
   ```bash
   kubectl exec -n cerebro-prod deploy/forge-api -- \
     psql $DATABASE_URL -c "
       SELECT application_name, count(*), state
       FROM pg_stat_activity
       WHERE datname = 'cerebrohive'
       GROUP BY application_name, state
       ORDER BY count DESC LIMIT 20;
     "
   ```

---

## Diagnosis

### Long-running transactions holding connections

```sql
SELECT pid, now() - pg_stat_activity.query_start AS duration,
       query, state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '30 seconds'
  AND state != 'idle'
ORDER BY duration DESC;
```

Kill a long-running query:
```sql
SELECT pg_terminate_backend(<pid>);
```

### Connection leaks (idle connections not being returned to pool)

Idle connections that are open but not in active use indicate a leak:
```sql
SELECT count(*), state FROM pg_stat_activity
WHERE datname = 'cerebrohive'
GROUP BY state;
-- idle count >> expected = leak
```

Identify the leaking service → restart its pods to force connection cleanup:
```bash
kubectl rollout restart deployment/<service-name> -n cerebro-prod
```

### Sudden connection spike (traffic event)

If all services are healthy but total connections spiked, a traffic surge is exhausting the pool:

1. Increase PgBouncer `max_client_conn` temporarily:
   ```bash
   kubectl exec -n cerebro-prod deploy/pgbouncer -- \
     psql -p 6432 pgbouncer -c "SET max_client_conn=500;"
   ```
   ⚠️ This is a temporary fix — also increase Postgres `max_connections` in RDS/CloudSQL console.

2. Scale down the heaviest connection consumer if possible.

---

## Permanent fixes

| Cause | Fix |
|-------|-----|
| Connection leak | Fix app code to always release connections, use `finally` blocks |
| Pool too small for traffic | Increase `pool_size` in PgBouncer config, or add a read replica |
| Long transactions | Enforce statement timeout: `SET statement_timeout = '30s'` |
| Missing indexes causing slow queries | `EXPLAIN ANALYZE` → add index → monitor |
| Single large batch job | Move batch work to dedicated pool / off-peak schedule |

---

## Resolution checklist

- [ ] Connection pool usage below 50% for 5 minutes
- [ ] No `cl_waiting` clients in PgBouncer SHOW POOLS
- [ ] Error rate returned to baseline
- [ ] Root cause (leak / spike / long query) identified
- [ ] Fix deployed or ticket filed with P1 priority
- [ ] `pg_stat_statements` reset and re-baselining scheduled
