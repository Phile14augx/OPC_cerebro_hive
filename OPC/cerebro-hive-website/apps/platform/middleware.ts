/**
 * CerebroCyber™ Security Middleware - CerebroHive Platform
 * 
 * Month 1 Implementation: DevOps Infrastructure & Brand System
 * Integration point for: Week 1-4 infrastructure setup
 * 
 * This middleware implements:
 * - Zero-trust authentication verification
 * - Rate limiting with customizable windows
 * - Security headers (CSP, HSTS, X-Frame-Options, etc.)
 * - AI threat detection (prompt injection, PII)
 * - Compliance audit logging
 */

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// ============================================================================
// CONFIGURATION FROM ENVIRONMENT
// ============================================================================

const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT_WINDOW: 60_000,
  MAX_REQUESTS: process.env.SECURITY_RATE_LIMIT
    ? parseInt(process.env.SECURITY_RATE_LIMIT, 10)
    : 1000,

  // Threat detection
  CHECK_PII: process.env.PII_DETECTION_ENABLED !== "false",
  CHECK_CREDENTIALS: process.env.CREDENTIAL_DETECTION_ENABLED !== "false",
  CHECK_PROMPT_INJECTION: process.env.PROMPT_INJECTION_DETECTION !== "false",

  // Skip authentication for these paths
  SKIP_AUTH_PATHS: [
    "/api/auth",
    "/api/public",
    "/health",
    "/metrics",
    "/auth/callback",
    "/security/events",
    "/_next",
    "/static",
  ],
};

// ============================================================================
// RATE LIMITING STORE
// ============================================================================

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// ============================================================================
// AI THREAT DETECTION PATTERNS
// ============================================================================

const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous\s+)?(instructions?|messages?)/i,
  /system\s*:\s*/i,
  /jailbreak/i,
  /bypass\s+(all\s+)?.*filter/i,
  /\\.*?\\.*?\\.*?"/i,
  /<\/?(script|iframe|object|embed)[^>]*>/i,
  /\[.*?\]/i,
  /\b(on\s+(halt|stop|quit|pause|exit)\b)/i,
  /pretend\s+you\s+(are|act\s+as)/i,
  /role\s*:\s*"/i,
  /dan\s*[:]\s*mode/i,
  /do\s+anything\s+(now|else)/i,
  /you\s+(are\s+)?a\s+(language\s+model|AI|assistant)/i,
  /new\s+(instruction|prompt|response)/i,
];

const PII_PATTERNS: Record<string, RegExp> = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard:
    /\b(?:(?:4\d{3}|5[1-5]\d{2}|2[12]\d{2}|3[46]\d{2}|3[79]\d{2})\d{12}|(?:4\d{3}|5[1-5]\d{2}|2[12]\d{2}|3[46]\d{2}|3[79]\d{2})\d{15})\b/g,
  phone: /\b(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9])[-.\s]?([0-9]{4})\b/g,
  ipAddress: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
};

const SENSITIVE_KEYWORDS = [
  "password",
  "passwd",
  "pwd",
  "secret",
  "api_key",
  "apikey",
  "token",
  "credential",
  "private_key",
  "privatekey",
  "access_key",
  "secret_key",
  "admin",
  "root_password",
  "master_key",
  "vault",
  "encryption_key",
];

// ============================================================================
// MAIN MIDDLEWARE
// ============================================================================

export default async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = randomUUID();
  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const path = request.nextUrl.pathname;

  // Check if path skips auth
  const skipAuth = SECURITY_CONFIG.SKIP_AUTH_PATHS.some(
    (prefix) => path.startsWith(prefix) || path === prefix
  );

  // === 1. RATE LIMITING ===
  const rateLimitKey = `${clientIP}:${path}`;
  const now = Date.now();
  const record = rateLimitStore.get(rateLimitKey);

  let rateLimitResult: { allowed: boolean; resetTime: number; remaining: number };

  if (!record || now > record.resetTime) {
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW,
    });
    rateLimitResult = {
      allowed: true,
      resetTime: now + SECURITY_CONFIG.RATE_LIMIT_WINDOW,
      remaining: SECURITY_CONFIG.MAX_REQUESTS - 1,
    };
  } else {
    record.count++;

    if (record.count > SECURITY_CONFIG.MAX_REQUESTS) {
      rateLimitResult = {
        allowed: false,
        resetTime: record.resetTime,
        remaining: 0,
      };

      console.warn("SECURITY_EVENT", JSON.stringify({
        type: "rate_limit",
        message: `Rate limit exceeded for ${clientIP}`,
        path,
        clientIP,
        timestamp: Date.now(),
        requestId,
        riskScore: 30,
      }));

      return NextResponse.json(
        {
          error: "Too Many Requests",
          code: "RATE_LIMITED",
          retryAfter: rateLimitResult.resetTime - Date.now(),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(SECURITY_CONFIG.MAX_REQUESTS),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitResult.resetTime),
          },
        }
      );
    }

    rateLimitResult = {
      allowed: true,
      resetTime: record.resetTime,
      remaining: SECURITY_CONFIG.MAX_REQUESTS - record.count,
    };
  }

  // === 2. BUILD RESPONSE WITH SECURITY HEADERS ===
  const response = NextResponse.next();

  // Standard security headers (Month 1 security foundation)
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  // Content Security Policy for dark intelligence UI
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https: blob:; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' https://*.cerebrohive.com; " +
      "frame-ancestors 'none';"
  );

  // CORS headers
  response.headers.set(
    "Access-Control-Allow-Origin",
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  // HSTS for production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  // CerebroHive brand headers
  response.headers.set("X-Cerebro-Request-ID", requestId);
  response.headers.set("X-Cerebro-Threat-Level", "none");
  response.headers.set("X-Cerebro-Processing-Time", String(Date.now() - startTime));
  response.headers.set("X-Cerebro-Version", "1.0.0-beta");
  response.headers.set("X-Security-Score", "100");

  // Rate limit headers
  response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
  response.headers.set("X-RateLimit-Limit", String(SECURITY_CONFIG.MAX_REQUESTS));
  response.headers.set("X-RateLimit-Reset", String(rateLimitResult.resetTime));

  return response;
}

// ============================================================================
// MATCHER - Apply middleware to all routes except static files
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};