# Execution Plane

Long-running work must not block HTTP.

```text
UI → API → PlatformJob (QUEUED)
         → Worker
         → Sandbox / Container
         → JobLog stream
         → UI
```

States: `QUEUED | PREPARING | RUNNING | WAITING_FOR_INPUT | SUCCEEDED | FAILED | CANCELLED | TIMED_OUT`.

## Current honesty

| Path | Status |
|---|---|
| Prisma `PlatformJob` / `PlatformJobLog` | Schema added Day 1 |
| Forge codegen SSE | FUNCTIONAL_BETA |
| platform-api runtime execute | In-memory, Agent-only |
| Talent execution | Refuses; not implemented |
| Temporal workflow execute | DB row only |

Do not display SUCCEEDED unless a worker recorded it.
