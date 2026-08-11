# Company Operating System: Foundation and Brain

## Environments

Studio uses `NEXT_PUBLIC_API_URL` as the Platform API origin. When it is absent, the client defaults to `http://localhost:4000`. The Studio development server used by Playwright is `http://localhost:3401`.

`/app/brain` is live mode by default. Use `/app/brain?mode=demo` only for the visibly labelled (`DEMO DATA`) deterministic demonstration graph. Demo mode is enabled only when `CEREBRO_COMPANY_OS_DEMO=enabled` is set on the Platform API; it is not a substitute for authenticated live data and must not be enabled in production.

## Authentication and workspace boundary

All live Company OS requests require the current authenticated session. The browser client sends credentialed requests; service callers must provide the existing `Authorization: Bearer <token>` and workspace/tenant context headers accepted by the Platform API. The API authorizes every graph snapshot, entity detail, command, and event independently. Do not infer permission from a previously fetched node, and do not replay an identifier across workspaces.

Missing or insufficient credentials produce the permission state. A cross-workspace request must be rejected rather than returning an empty or partially leaked graph.

## Graph and inspector contracts

`GET /api/operating-system/graph?mode=live|demo` returns an authorization-filtered `OperatingGraphSnapshot` inside `{ data }`. It contains the graph revision plus tenant-scoped nodes and semantic edges. The client obtains inspector data through `GET /api/operating-system/entities/:type/:id`; detail is fetched only for a selected node and is discarded when selection changes.

Live responses may be empty. Studio renders the explicit empty state in that case, not demo data. A transient graph failure renders the error state with retry; an authorization failure renders the permission state.

## Event stream and recovery

`GET /api/operating-system/events` is an authorized SSE endpoint on the same `NEXT_PUBLIC_API_URL` origin as graph and detail requests. Studio requests it with `Accept: text/event-stream`, browser credentials, and the shared `Authorization`, `X-Workspace-ID`, and `X-Trace-ID` context. Each event carries an SSE `id`; the client saves that value as its cursor and reconnects with `?cursor=<encoded-id>` so it can resume after the last projected event.

The stream retries with bounded backoff. If reconnection remains unavailable after three attempts, Studio invalidates and refetches the graph snapshot every 15 seconds until the stream resumes. Event payloads are projected into the cached graph; invalid projections never grant access or bypass a later snapshot refresh.

## Validation notes

Visual automation sets Playwright reduced-motion preference only. It does not remove graph nodes, edges, the inspector, or other dynamic DOM from the page. The foundation gate covers demo search, focus/selection, inspector accessibility, responsive screenshots, and deterministic pan/zoom responsiveness.

The focused Company OS compiler and browser gates isolate this slice from legacy Studio route-signature and optional-dependency failures. Those existing full-Studio failures remain release work; they are not treated as a passing substitute for the written full gate and no production fallback is added to conceal them.
