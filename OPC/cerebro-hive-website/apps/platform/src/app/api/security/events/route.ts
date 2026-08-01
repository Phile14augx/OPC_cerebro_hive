/**
 * Security Events API Route
 * 
 * Month 1 Implementation: Week 4 - Observability, Logging & Content Sprint
 * 
 * Endpoint for receiving and querying security events from CerebroCyber middleware.
 * Integrates with SIEM and audit logging infrastructure.
 */

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// In-memory event store (use Elasticsearch/Prometheus/Splunk in production)
const securityEventsStore: Array<{
  id: string;
  type: string;
  severity: string;
  message: string;
  context: Record<string, unknown>;
  timestamp: number;
  riskScore: number;
  source: string;
}> = [];

// Rate limiting for API
const apiRateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Max events to store (for memory efficiency)
const MAX_EVENTS = 10000;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = randomUUID();
  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Rate limiting (50 req/min for event ingestion)
  const rateLimitKey = `api-events-post:${clientIP}`;
  const now = Date.now();
  const record = apiRateLimitStore.get(rateLimitKey);

  let rateLimitResult: { allowed: boolean; resetTime: number; remaining: number };

  if (!record || now > record.resetTime) {
    apiRateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + 60_000,
    });
    rateLimitResult = {
      allowed: true,
      resetTime: now + 60_000,
      remaining: 49,
    };
  } else {
    record.count++;
    if (record.count > 50) {
      rateLimitResult = {
        allowed: false,
        resetTime: record.resetTime,
        remaining: 0,
      };
      return NextResponse.json(
        { error: "Too Many Requests", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }
    rateLimitResult = {
      allowed: true,
      resetTime: record.resetTime,
      remaining: 50 - record.count,
    };
  }

  // Parse request body
  let event: Record<string, unknown>;
  try {
    const body = await request.text();
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Validate event type
  const validEventTypes = [
    "auth_failure",
    "rate_limit",
    "prompt_injection",
    "dlp_violation",
    "anomaly",
    "policy_violation",
    "credential_exposure",
    "threat_detected",
  ];

  if (event.type && !validEventTypes.includes(event.type as string)) {
    return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
  }

  // Store the event
  const securityEvent = {
    id: (event.id as string) || randomUUID(),
    type: (event.type as string) || "anomaly",
    severity: (event.severity as string) || "info",
    message: (event.message as string) || "Security event",
    context: (event.context as Record<string, unknown>) || {},
    timestamp: (event.timestamp as number) || Date.now(),
    riskScore: (event.riskScore as number) || 0,
    source: (event.source as string) || "cerebrocyber-middleware",
  };

  // Add to store (with memory management)
  securityEventsStore.push(securityEvent);
  if (securityEventsStore.length > MAX_EVENTS) {
    securityEventsStore.shift(); // Remove oldest event
  }

  const response = NextResponse.json(
    { status: "accepted", id: securityEvent.id },
    { status: 202 }
  );

  response.headers.set("X-Cerebro-Request-ID", requestId);
  response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
  response.headers.set("X-RateLimit-Limit", "50");
  response.headers.set("X-RateLimit-Reset", String(rateLimitResult.resetTime));

  return response;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = randomUUID();
  const clientIP =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Rate limiting (100 req/min for read)
  const rateLimitKey = `api-events-get:${clientIP}`;
  const now = Date.now();
  const record = apiRateLimitStore.get(rateLimitKey);

  let rateLimitResult: { allowed: boolean; resetTime: number; remaining: number };

  if (!record || now > record.resetTime) {
    apiRateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + 60_000,
    });
    rateLimitResult = {
      allowed: true,
      resetTime: now + 60_000,
      remaining: 99,
    };
  } else {
    record.count++;
    if (record.count > 100) {
      rateLimitResult = {
        allowed: false,
        resetTime: record.resetTime,
        remaining: 0,
      };
      return NextResponse.json(
        { error: "Too Many Requests", code: "RATE_LIMITED" },
        { status: 429 }
      );
    }
    rateLimitResult = {
      allowed: true,
      resetTime: record.resetTime,
      remaining: 100 - record.count,
    };
  }

  // Parse query parameters
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 1000);
  const type = url.searchParams.get("type");
  const severity = url.searchParams.get("severity");

  // Filter events
  let events = [...securityEventsStore].reverse(); // Most recent first

  if (type) {
    events = events.filter((e) => e.type === type);
  }

  if (severity) {
    events = events.filter((e) => e.severity === severity);
  }

  // Return paginated results
  const response = NextResponse.json({
    events: events.slice(0, limit),
    total: securityEventsStore.length,
    filtered: type || severity,
    timestamp: Date.now(),
  });

  response.headers.set("X-Cerebro-Request-ID", requestId);
  response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
  response.headers.set("X-RateLimit-Limit", "100");
  response.headers.set("X-RateLimit-Reset", String(rateLimitResult.resetTime));

  return response;
}

// Export utility functions
export function clearSecurityEvents() {
  securityEventsStore.length = 0;
}

export function getSecurityEventsCount() {
  return securityEventsStore.length;
}