/**
 * Same-origin / allowlisted-origin verification for Route Handlers.
 *
 * Next.js Server Actions already get built-in Origin-header verification from
 * the framework itself. Plain Route Handlers (app/api/**\/route.ts) do not —
 * they'll happily execute a cross-site POST from any page on the internet that
 * points a <form> or fetch() at them. This is the CSRF-equivalent control for
 * those routes: reject any mutating request whose Origin/Referer doesn't match
 * this deployment, before it ever touches validation or the database.
 */

function getAllowedOrigins(): string[] {
  const configured = process.env.ALLOWED_ORIGINS;
  if (configured) {
    return configured.split(",").map((o) => o.trim()).filter(Boolean);
  }
  // Reasonable default for local dev; production deployments should set
  // ALLOWED_ORIGINS explicitly (see .env.example).
  return ["http://localhost:3000"];
}

export function isTrustedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const allowed = getAllowedOrigins();

  if (origin) {
    return allowed.includes(origin);
  }

  // Some same-origin requests (e.g. certain server-to-server calls, curl without
  // an Origin header) won't send Origin at all. Fall back to Referer, and if
  // neither is present, treat it as untrusted rather than assuming same-origin —
  // a same-origin browser POST always sends one of the two.
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return allowed.includes(refererOrigin);
    } catch {
      return false;
    }
  }

  return false;
}
