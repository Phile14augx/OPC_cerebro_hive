import { NextResponse } from "next/server";
import { isTrustedOrigin } from "./origin";
import { rateLimit, getClientIp, rateLimitResponseHeaders } from "./rateLimit";

export interface GuardOptions {
  /** Unique per-route name, used as the rate-limit bucket prefix. */
  routeName: string;
  limit: number;
  windowMs: number;
  maxBodyBytes?: number;
}

export type GuardResult = { ok: true } | { ok: false; response: NextResponse };

/**
 * Full guard for state-changing requests (POST/PUT/PATCH/DELETE): verifies the
 * request came from this site (CSRF-equivalent origin check), enforces a
 * per-IP rate limit, and rejects oversized bodies before they're parsed.
 * Apply this before touching request.json() or the database.
 */
export async function guardMutatingRequest(request: Request, opts: GuardOptions): Promise<GuardResult> {
  if (!isTrustedOrigin(request)) {
    return { ok: false, response: NextResponse.json({ error: "Forbidden — cross-origin request rejected" }, { status: 403 }) };
  }

  const contentLength = request.headers.get("content-length");
  const maxBytes = opts.maxBodyBytes ?? 100_000; // 100KB is generous for these JSON payloads
  if (contentLength && Number(contentLength) > maxBytes) {
    return { ok: false, response: NextResponse.json({ error: "Payload too large" }, { status: 413 }) };
  }

  const ip = getClientIp(request);
  const result = rateLimit(`${opts.routeName}:${ip}`, opts.limit, opts.windowMs);
  if (!result.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many requests — please slow down" },
        { status: 429, headers: rateLimitResponseHeaders(result) }
      ),
    };
  }

  return { ok: true };
}

/**
 * Lighter guard for read-only (GET) endpoints: rate limiting only, no origin
 * check (reads aren't a CSRF vector — there's no state change to forge).
 * These endpoints currently return demo/seed data with no authentication;
 * see the security roadmap for the plan to add real auth before any of this
 * carries real customer data.
 */
export async function guardReadRequest(request: Request, opts: GuardOptions): Promise<GuardResult> {
  const ip = getClientIp(request);
  const result = rateLimit(`${opts.routeName}:${ip}`, opts.limit, opts.windowMs);
  if (!result.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many requests — please slow down" },
        { status: 429, headers: rateLimitResponseHeaders(result) }
      ),
    };
  }
  return { ok: true };
}

/** Safely parse a JSON body, returning a 400 GuardResult on malformed JSON. */
export async function parseJsonBody(request: Request): Promise<{ ok: true; body: unknown } | { ok: false; response: NextResponse }> {
  try {
    const body = await request.json();
    return { ok: true, body };
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }) };
  }
}
