/**
 * Single client for the CerebroHive platform API.
 *
 * This module replaces nineteen near-identical copies of `API` / `KEY` /
 * `api()` / `checkOnline()` that were duplicated under `app/platform/<product>/lib.ts`.
 * Each copy had drifted (different header casing, different error handling, some
 * omitting the `Authorization` header entirely), so behaviour depended on which
 * product page you happened to be on. There is now one implementation.
 *
 * ## Security note — read before changing `KEY`
 *
 * `NEXT_PUBLIC_PLATFORM_DEMO_KEY` is inlined into the client bundle by Next.js.
 * Anything placed there is public. It exists because the site supports
 * `STATIC_EXPORT=true` (GitHub Pages), where there is no server able to hold a
 * secret and no route handler able to proxy the call.
 *
 * Therefore:
 *   - This value MUST be a scoped, read-only, rate-limited demo credential.
 *   - It MUST NOT be a tenant, admin, or service key.
 *   - It MUST be rotatable without a code change.
 *
 * When the site is served in SSR mode (the default, `output: "standalone"`),
 * prefer routing through a same-origin backend-for-frontend so no credential
 * reaches the browser at all. Set `NEXT_PUBLIC_PLATFORM_API_URL` to a
 * same-origin path such as `/api/v1` and leave the demo key unset; the
 * `Authorization` header is then omitted and the origin attaches the real
 * credential server-side.
 */

/** Base URL for the platform API. A relative value (e.g. `/api/v1`) means same-origin. */
export const API =
  process.env.NEXT_PUBLIC_PLATFORM_API_URL || "http://localhost:8090";

/**
 * Public demo credential. Empty in any deployment that proxies through a
 * same-origin BFF — which is the preferred configuration.
 */
export const KEY = process.env.NEXT_PUBLIC_PLATFORM_DEMO_KEY || "";

/** True when `API` is same-origin, in which case no bearer token is attached. */
const IS_SAME_ORIGIN = API.startsWith("/");

if (
  process.env.NODE_ENV !== "production" &&
  KEY &&
  !IS_SAME_ORIGIN &&
  !/^(demo|pk_demo|public)[_-]/i.test(KEY)
) {
  // Loud in development, silent in production builds.
  console.warn(
    "[platform-api] NEXT_PUBLIC_PLATFORM_DEMO_KEY is shipped to the browser and is " +
      "publicly readable. It does not look like a scoped demo key. Use a read-only " +
      "demo credential, or proxy through a same-origin BFF and unset this variable.",
  );
}

/** Error carrying the HTTP status, so callers can branch on 401/404/429 rather than parse strings. */
export class PlatformApiError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(message: string, status: number, path: string) {
    super(message);
    this.name = "PlatformApiError";
    this.status = status;
    this.path = path;
  }
}

function buildHeaders(init?: RequestInit): HeadersInit {
  const headers: Record<string, string> = {};

  // Only declare a JSON body when there actually is one — sending
  // `Content-Type: application/json` on a GET trips some API gateways.
  if (init?.body) headers["content-type"] = "application/json";

  // Never attach the public demo key to a same-origin request; the origin
  // supplies the real credential itself.
  if (KEY && !IS_SAME_ORIGIN) headers["authorization"] = `Bearer ${KEY}`;

  return { ...headers, ...(init?.headers as Record<string, string> | undefined) };
}

/**
 * Perform a request against the platform API.
 *
 * @throws {PlatformApiError} on any non-2xx response.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, { ...init, headers: buildHeaders(init) });

  if (!res.ok) {
    // Prefer the API's structured error envelope; fall back to text, then status.
    const body: unknown = await res.clone().json().catch(() => null);
    const structured =
      body && typeof body === "object"
        ? (body as { error?: { message?: string }; message?: string }).error?.message ??
          (body as { message?: string }).message
        : undefined;
    const message = structured ?? (await res.text().catch(() => "")) ?? "";

    throw new PlatformApiError(
      message.trim() || `HTTP ${res.status} ${res.statusText}`.trim(),
      res.status,
      path,
    );
  }

  // 204 No Content and empty bodies must not blow up JSON.parse.
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/**
 * Liveness probe used by product pages to render an online/offline indicator.
 *
 * Every copy of this that lived under `app/platform/*` had a bug: most ignored
 * the response status (so a 500 from `/health` still reported "online") and
 * several had no timeout, leaving the indicator stuck on "Checking platform…"
 * until the browser's default timeout elapsed.
 */
export async function checkOnline(timeoutMs = 3000): Promise<boolean> {
  try {
    const res = await fetch(`${API}/health`, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
