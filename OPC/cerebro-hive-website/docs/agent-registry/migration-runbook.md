# Agent Registry migration runbook

This runbook cuts the existing canonical `Agent` / `AgentVersion` stack over to the governed registry. It does not create a second source of truth and never renumbers existing versions.

## 1. Preflight

1. Deploy the expand migration `20260811120000_agent_registry_expand` with registry writes disabled.
2. Confirm backups and a tested point-in-time restore are available.
3. Record row counts for `Agent`, `AgentVersion`, and executions referencing versions.
4. Confirm the legacy runtime currently resolves the greatest per-agent `version`; if production differs, change the backfill resolver before proceeding.

```sql
SELECT COUNT(*) FROM "Agent";
SELECT COUNT(*) FROM "AgentVersion";
SELECT "agentId", COUNT(*), MAX("version") FROM "AgentVersion" GROUP BY "agentId";
```

## 2. Dry run and review disposition

Run without `--apply`; save the JSON output as the before manifest.

```powershell
pnpm --filter @cerebro/db registry:backfill -- --batch-size=100
```

Every inactive legacy agent with an existing version is classified `SUSPENDED` and listed in `reviewRequired`. An Owner must explicitly accept that disposition before cutover. Agents without versions become `DRAFT` and retain a mutable draft only.

## 3. Apply

```powershell
pnpm --filter @cerebro/db registry:backfill -- --apply --batch-size=100
```

The runner uses ordered UUID keyset batches and is idempotent. Preserve its JSON result as the after manifest. Rerun it; the second result must report `changed: 0`.

## 4. Verify

All queries must return zero rows.

```sql
SELECT a.id FROM "Agent" a
LEFT JOIN LATERAL (
  SELECT av.id FROM "AgentVersion" av WHERE av."agentId" = a.id ORDER BY av.version DESC LIMIT 1
) legacy ON true
WHERE a."activeVersionId" IS DISTINCT FROM legacy.id;

SELECT id FROM "Agent" WHERE "lifecycleStatus" IS NULL;
SELECT id FROM "AgentVersion"
WHERE "workspaceId" IS NULL OR definition IS NULL OR "definitionHash" IS NULL
   OR "publishedAt" IS NULL OR "publicationSource" IS NULL;

SELECT ae.id FROM "AgentExecution" ae
LEFT JOIN "AgentVersion" av ON av.id = ae."agentVersionId"
WHERE ae."agentVersionId" IS NOT NULL AND av.id IS NULL;
```

Exercise one existing execution by its unchanged `AgentVersion.id`. Monitor `agent_registry_legacy_version_fallback`; it must trend to zero.

## 5. Constrain and cut over

1. Apply `20260811130000_agent_registry_constraints`.
2. Enable registry writes and the evolved `/api/v1/agents` handlers.
3. Set `AGENT_REGISTRY_LEGACY_VERSION_FALLBACK=false` only after fallback telemetry is zero for the agreed observation window.
4. Verify create → autosave → publish → sandbox → certify → production through Studio.

The constraint migration installs the `AgentVersion` update guard. From that point, no production application path may update a published version; publication inserts a new row.

## 6. Rollback

Before the constraint migration, disable registry writes and roll application traffic back; additive columns and drafts may remain. After constraints are applied, prefer forward repair. If an emergency rollback is authorized, first disable registry publication, drop only the named immutable trigger/constraint additions, and restore the prior application version. Never delete or renumber `AgentVersion` rows, and never rewrite execution references.
