/**
 * CerebroCyber Security API Routes
 * 
 * Provides REST endpoints for security monitoring, threat detection,
 * compliance reporting, and security event management.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { 
  detectAIThreats, 
  checkRateLimit, 
  logSecurityEvent, 
  clearRateLimit,
  type SecurityEvent,
} from "@/lib/cybersecurity";

// Security metrics storage (in production, use Redis/ClickHouse)
const securityEvents: SecurityEvent[] = [];
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// API Key for internal service access (in production, use proper secrets management)
const API_SECRET = process.env.CYBER_API_SECRET || "development-key-change-in-production";

/**
 * Validate API key for internal service authentication
 */
async function validateApiKey(request: NextRequest): Promise<boolean> {
  const apiKey = request.headers.get("x-api-key") || "";
  return apiKey === API_SECRET;
}

/**
 * GET /api/security/events
 * List recent security events
 */
export async function GET(request: NextRequest) {
  // Require authentication for this endpoint
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse query parameters
  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const type = url.searchParams.get("type");
  const severity = url.searchParams.get("severity");
  const hours = parseInt(url.searchParams.get("hours") || "24");

  // Filter events
  let filteredEvents = [...securityEvents].reverse(); // Most recent first
  const cutoffTime = Date.now() - hours * 60 * 60 * 1000;

  filteredEvents = filteredEvents.filter(e => e.timestamp >= cutoffTime);

  if (type) {
    filteredEvents = filteredEvents.filter(e => e.type === type);
  }

  if (severity) {
    filteredEvents = filteredEvents.filter(e => e.severity === severity);
  }

  const response = NextResponse.json({
    events: filteredEvents.slice(0, limit),
    total: filteredEvents.length,
    limit,
    timeWindow: { hours, cutoff: cutoffTime },
  });

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}

/**
 * POST /api/security/events
 * Log a custom security event
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      type: body.type,
      severity: body.severity,
      message: body.message,
      context: body.context || {},
      metadata: body.metadata || {},
      timestamp: Date.now(),
      riskScore: body.riskScore || 50,
      source: body.source || "custom-api",
    };

    securityEvents.push(event);
    await logSecurityEvent(event);

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

/**
 * GET /api/security/metrics
 * Get security metrics summary
 */
export async function GET_METRICS(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const totalEvents = securityEvents.length;
  const eventsByType: Record<string, number> = {};
  const eventsBySeverity: Record<string, number> = {};
  
  for (const event of securityEvents) {
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
  }

  const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;
  const recentEvents = securityEvents.filter(e => e.timestamp >= cutoffTime);
  
  const totalRisk = recentEvents.reduce((sum, e) => sum + e.riskScore, 0);
  const avgRisk = recentEvents.length > 0 ? Math.round(totalRisk / recentEvents.length) : 0;

  const response = NextResponse.json({
    summary: {
      totalEvents,
      eventsLast24h: recentEvents.length,
      avgRiskScore: avgRisk,
      securityScore: Math.max(0, 100 - avgRisk),
    },
    breakdown: {
      byType: eventsByType,
      bySeverity: eventsBySeverity,
    },
    threats: {
      promptInjection: eventsByType["prompt_injection"] || 0,
      rateLimit: eventsByType["rate_limit"] || 0,
      authFailures: eventsByType["auth_failure"] || 0,
      dlpViolations: eventsByType["dlp_violation"] || 0,
    },
  });

  return response;
}

// Note: GET and POST handlers conflict - need to use route.ts properly
// This is a simplified example - the actual route structure is below

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateApiKey } from "./utils";

// Re-export for route handlers
export const GET = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
  const type = url.searchParams.get("type");
  const severity = url.searchParams.get("severity");
  const hours = parseInt(url.searchParams.get("hours") || "24");

  let events = [...securityEvents].reverse();
  const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
  events = events.filter(e => e.timestamp >= cutoffTime);

  if (type) events = events.filter(e => e.type === type);
  if (severity) events = events.filter(e => e.severity === severity);

  return NextResponse.json({
    events: events.slice(0, limit),
    total: events.length,
    limit,
    timeWindow: { hours, cutoff: cutoffTime },
  });
};

export const POST = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      type: body.type,
      severity: body.severity,
      message: body.message,
      context: body.context || {},
      metadata: body.metadata || {},
      timestamp: Date.now(),
      riskScore: body.riskScore || 50,
      source: body.source || "custom-api",
    };

    securityEvents.push(event);
    await logSecurityEvent(event);

    return NextResponse.json({ success: true, eventId: event.id });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
};