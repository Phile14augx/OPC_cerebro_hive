/**
 * Security Metrics & Health Endpoint
 * 
 * Month 1 Implementation: Week 4 - Observability, Logging & Content Sprint
 * Part of: Prometheus and Grafana dashboard setup
 */

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Rate limiting for metrics endpoint (higher limit for health checks)
const metricsRateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = randomUUID();
  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Health check rate limiting (200 req/min for metrics)
  const rateLimitKey = `${clientIP}:metrics`;
  const now = Date.now();
  const record = metricsRateLimitStore.get(rateLimitKey);

  let rateLimitResult: { allowed: boolean; resetTime: number; remaining: number };

  if (!record || now > record.resetTime) {
    metricsRateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + 60_000,
    });
    rateLimitResult = {
      allowed: true,
      resetTime: now + 60_000,
      remaining: 199,
    };
  } else {
    record.count++;
    if (record.count > 200) {
      rateLimitResult = {
        allowed: false,
        resetTime: record.resetTime,
        remaining: 0,
      };
      return NextResponse.json(
        {
          error: "Too Many Requests",
          code: "RATE_LIMITED",
          retryAfter: rateLimitResult.resetTime - Date.now(),
        },
        { status: 429 }
      );
    }
    rateLimitResult = {
      allowed: true,
      resetTime: record.resetTime,
      remaining: 200 - record.count,
    };
  }

  // Collect security metrics
  const securityMetrics = {
    timestamp: Date.now(),
    requestId,
    securityScore: 100,
    threatLevel: "none",
    requests: {
      total: 1000, // Placeholder - would come from actual metrics store
      blocked: 0,
      throttled: 0,
    },
    aiThreats: {
      promptInjectionAttempts: 0,
      piiDetected: 0,
      dlpViolations: 0,
    },
    auth: {
      failures: 0,
      successes: 0,
    },
    rateLimits: {
      active: true,
      windowMs: 60_000,
      maxRequests: 1000,
    },
    compliance: {
      frameworks: ["soc2"],
      auditLogEnabled: true,
    },
  };

  const response = NextResponse.json(securityMetrics, { status: 200 });

  // Add timing header
  response.headers.set(
    "X-Cerebro-Processing-Time",
    String(Date.now() - startTime)
  );
  response.headers.set("X-Cerebro-Request-ID", requestId);
  response.headers.set(
    "X-RateLimit-Remaining",
    String(rateLimitResult.remaining)
  );
  response.headers.set(
    "X-RateLimit-Limit",
    String(200)
  );
  response.headers.set(
    "X-RateLimit-Reset",
    String(rateLimitResult.resetTime)
  );

  return response;
}

export async function POST(request: NextRequest) {
  // Endpoint for security event ingestion (SIEM integration)
  const body = await request.text();

  try {
    const event = JSON.parse(body);

    // Validate event structure
    if (!event.type || !event.message) {
      return NextResponse.json(
        { error: "Invalid event structure" },
        { status: 400 }
      );
    }

    // Log security event
    console.error("SECURITY_EVENT", JSON.stringify({
      ...event,
      timestamp: event.timestamp || Date.now(),
      id: event.id || randomUUID(),
      source: event.source || "security-metrics",
    }));

    return NextResponse.json({ status: "accepted" }, { status: 202 });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }
}

export const config = {
  matcher: ["/security/metrics"],
};