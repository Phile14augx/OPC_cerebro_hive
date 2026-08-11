import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  CEREBROCYBER_CONFIG,
  SECURITY_HEADERS,
  CEREBROHIVE_COLORS,
} from "./cerebrocyber-config";

/**
 * CerebroCyber Middleware for CerebroHive Platform
 * 
 * Integrates zero-trust security enforcement with the brand system UI.
 * 
 * Month 1 Implementation - DevOps Infrastructure & Brand System
 * Part of: Week 1: Brand System & Dark Intelligence UI
 */

export interface PlatformSecurityContext {
  userId?: string;
  tenantId?: string;
  isAuthenticated: boolean;
  permissions: string[];
  aiThreatLevel: "none" | "low" | "medium" | "high" | "critical";
  requestId: string;
  timestamp: number;
  securityScore: number;
  clientIP: string;
  userAgent?: string;
}

// Rate limiting store (in-memory for now, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// ============================================================================
// SECURITY HELPERS
// ============================================================================

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(
  key: string,
  config: { windowMs: number; maxRequests: number }
): { allowed: boolean; resetTime: number; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      allowed: true,
      resetTime: now + config.windowMs,
      remaining: config.maxRequests - 1,
    };
  }

  record.count++;

  if (record.count > config.maxRequests) {
    return { allowed: false, resetTime: record.resetTime, remaining: 0 };
  }

  return {
    allowed: true,
    resetTime: record.resetTime,
    remaining: config.maxRequests - record.count,
  };
}

function clearRateLimit(key: string) {
  rateLimitStore.delete(key);
}

// ============================================================================
// MAIN MIDDLEWARE
// ============================================================================

export async function cerebrocyberMiddleware(
  request: NextRequest
): Promise<Response> {
  const startTime = Date.now();
  const requestId = randomUUID();
  const clientIP = getClientIP(request);
  const path = request.nextUrl.pathname;

  const securityContext: PlatformSecurityContext = {
    requestId,
    timestamp: startTime,
    isAuthenticated: false,
    permissions: [],
    securityScore: 100,
    aiThreatLevel: "none",
    clientIP,
    userAgent: request.headers.get("user-agent") || undefined,
  };

  // Check if path skips auth (health checks, public endpoints)
  const skipAuth = CEREBROCYBER_CONFIG.skipAuthForPaths.some(
    (prefix) => path.startsWith(prefix) || path === prefix
  );

  // === 1. RATE LIMITING ===
  const rateLimitKey = `${clientIP}:${path}`;
  const rateLimitResult = checkRateLimit(
    rateLimitKey,
    CEREBROCYBER_CONFIG.rateLimit
  );

  if (!rateLimitResult.allowed) {
    console.warn("SECURITY_EVENT", JSON.stringify({
      type: "rate_limit",
      message: `Rate limit exceeded for ${clientIP}`,
      context: securityContext,
      path,
      timestamp: Date.now(),
      requestId,
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
          "X-RateLimit-Limit": String(CEREBROCYBER_CONFIG.rateLimit.maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimitResult.resetTime),
        },
      }
    );
  }

  // === 2. BUILD RESPONSE WITH SECURITY HEADERS ===
  const response = NextResponse.next();

  // Apply security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      response.headers.delete(key);
    } else if (value === "") {
      response.headers.delete(key);
    } else {
      response.headers.set(key, String(value));
    }
  });

  // CerebroHive-specific headers
  response.headers.set("X-Cerebro-Request-ID", requestId);
  response.headers.set("X-Cerebro-Threat-Level", securityContext.aiThreatLevel);
  response.headers.set(
    "X-Cerebro-Processing-Time",
    String(Date.now() - startTime)
  );
  response.headers.set(
    "X-Security-Score",
    String(securityContext.securityScore)
  );

  // Rate limit headers
  response.headers.set(
    "X-RateLimit-Remaining",
    String(rateLimitResult.remaining)
  );
  response.headers.set(
    "X-RateLimit-Limit",
    String(CEREBROCYBER_CONFIG.rateLimit.maxRequests)
  );
  response.headers.set(
    "X-RateLimit-Reset",
    String(rateLimitResult.resetTime)
  );

  // CerebroHive brand headers
  response.headers.set("X-Cerebro-Version", "1.0.0-beta");
  response.headers.set("X-Cerebro-Brand", "Neural-Blue-Design");

  return response;
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export {
  CEREBROCYBER_CONFIG,
  checkRateLimit,
  clearRateLimit,
  getClientIP,
  SECURITY_HEADERS,
  CEREBROHIVE_COLORS,
};