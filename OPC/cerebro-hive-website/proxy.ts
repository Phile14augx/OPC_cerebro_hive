import { NextRequest, NextResponse } from "next/server";

/**
 * Edge middleware: security headers + a strict, nonce-based Content-Security-Policy
 * applied to every response. This is the website's equivalent of the header layer
 * described in the enterprise security architecture (Section 6 / Section 5 CSP) —
 * scoped to what's actually enforceable from a single Next.js app without a
 * front-door WAF (Cloudflare Enterprise etc. is a separate, infrastructure-level
 * decision — see the security roadmap doc).
 *
 * Nonce pattern follows Next.js's documented approach: a fresh nonce is minted per
 * request, forwarded to the app via a request header (so Server Components can read
 * it and put it on any inline <script> they render), and referenced in the CSP sent
 * back to the browser. No 'unsafe-inline' for scripts.
 */

const isProd = process.env.NODE_ENV === "production";

// Populate with any additional origins the app legitimately needs to call from
// the browser (e.g. the AgentOS backend for the live-runtime page). Kept as an
// explicit allowlist rather than '*'.
const AGENTOS_API_ORIGIN = process.env.NEXT_PUBLIC_AGENTOS_API_URL || "http://localhost:8088";

function buildCsp(nonce: string): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": isProd
      ? ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"]
      : ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", "'unsafe-eval'"], // unsafe-eval only for Next.js dev HMR
    "style-src": ["'self'", "'unsafe-inline'"], // Tailwind's JIT + Next font optimization inject inline styles
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", AGENTOS_API_ORIGIN, isProd ? "" : "ws:"].filter(Boolean),
    "worker-src": ["'self'", "blob:"],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'none'"],
    "object-src": ["'none'"],
    "form-action": ["'self'"],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=()"
  );
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Origin-Agent-Cluster", "?1");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  // HSTS only makes sense once the site is actually served over HTTPS in prod —
  // sending it in local dev breaks http://localhost.
  if (isProd) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything except static assets and Next.js internals, which don't
    // need CSP/security headers and would just add overhead.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$).*)",
  ],
};
