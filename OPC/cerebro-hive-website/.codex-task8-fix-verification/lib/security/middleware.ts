import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

/**
 * CerebroCyber Security Middleware
 * 
 * Implements zero-trust security enforcement at the request level:
 * - Authentication verification
 * - Rate limiting
 * - Request validation
 * - Security headers
 * - AI threat detection (prompt injection, DLP)
 */

export interface SecurityContext {
  userId?: string;
  tenantId?: string;
  isAuthenticated: boolean;
  permissions: string[];
  aiThreatLevel: "none" | "low" | "medium" | "high" | "critical";
  requestId: string;
  timestamp: number;
  securityScore: number;
}

export interface SecurityEvent {
  id: string;
  type: "auth_failure" | "rate_limit" | "prompt_injection" | "dlp_violation" | 
        "anomaly" | "policy_violation" | "credential_exposure" | "threat_detected";
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  context: Partial<SecurityContext>;
  metadata: Record<string, unknown>;
  timestamp: number;
  riskScore: number;
  source: string;
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// AI threat patterns
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
  /dan\s*[:\s]*mode/i,
  /do\s+anything\s+(now|else)/i,
  /you\s+(are\s+)?a\s+(language\s+model|AI|assistant)/i,
  /new\s+(instruction|prompt|response)/i,
];

const PII_PATTERNS: Record<string, RegExp> = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b(?:(?:4\d{3}|5[1-5]\d{2}|2[12]\d{2}|3[46]\d{2}|3[79]\d{2})\d{12}|(?:4\d{3}|5[1-5]\d{2}|2[12]\d{2}|3[46]\d{2}|3[79]\d{2})\d{15})\b/g,
  phone: /\b(?:\+?1[-.\s]?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9])[-.\s]?([0-9]{4})\b/g,
  ipAddress: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
};

const SENSITIVE_KEYWORDS = [
  "password", "passwd", "pwd", "secret", "api_key", "apikey", "token",
  "credential", "private_key", "privatekey", "access_key", "secret_key",
  "admin", "root_password", "master_key", "vault", "encryption_key",
];

export interface AIThreatResult {
  promptInjection: boolean;
  sensitiveData: boolean;
  severity: "low" | "medium" | "high" | "critical";
  details: {
    promptInjectionMatches?: string[];
    piiFound?: Record<string, number>;
    credentialsFound?: string[];
  };
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  trustedProxies?: string[];
}

export interface ThreatDetectionConfig {
  checkPII: boolean;
  checkCredentials: boolean;
  checkPromptInjection: boolean;
  customPatterns?: RegExp[];
}

export interface SecurityMiddlewareOptions {
  rateLimit?: Partial<RateLimitConfig>;
  threatDetection?: Partial<ThreatDetectionConfig>;
  skipAuthForPaths?: string[];
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 1000,
};

const DEFAULT_THREAT_CONFIG: ThreatDetectionConfig = {
  checkPII: true,
  checkCredentials: true,
  checkPromptInjection: true,
};

/**
 * Check rate limiting
 */
function checkRateLimit(
  key: string, 
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): { allowed: boolean; resetTime: number; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { 
      count: 1, 
      resetTime: now + config.windowMs 
    });
    return { allowed: true, resetTime: now + config.windowMs, remaining: config.maxRequests - 1 };
  }
  
  record.count++;
  
  if (record.count > config.maxRequests) {
    return { allowed: false, resetTime: record.resetTime, remaining: 0 };
  }
  
  return { allowed: true, resetTime: record.resetTime, remaining: config.maxRequests - record.count };
}

/**
 * Clear rate limit record (for testing)
 */
export function clearRateLimit(key: string) {
  rateLimitStore.delete(key);
}

/**
 * Detect AI-specific threats in request content
 */
export function detectAIThreats(
  content: string,
  config: ThreatDetectionConfig = DEFAULT_THREAT_CONFIG
): AIThreatResult {
  const result: AIThreatResult = {
    promptInjection: false,
    sensitiveData: false,
    severity: "low",
    details: {},
  };

  // Check for prompt injection
  if (config.checkPromptInjection) {
    const injectionMatches: string[] = [];
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      const match = content.match(pattern);
      if (match) {
        injectionMatches.push(match[0]);
      }
    }
    if (injectionMatches.length > 0) {
      result.promptInjection = true;
      result.details.promptInjectionMatches = injectionMatches;
      result.severity = "high";
    }
  }

  // Check for PII/secret data
  if (config.checkPII || config.checkCredentials) {
    const piiFound: Record<string, number> = {};
    const credentialsFound: string[] = [];

    for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
      const matches = content.match(pattern);
      if (matches) {
        piiFound[type] = matches.length;
        if (result.severity !== "high") {
          result.severity = "medium";
        }
      }
    }

    // Check for credential keywords with potential values
    const contentLower = content.toLowerCase();
    for (const keyword of SENSITIVE_KEYWORDS) {
      if (contentLower.includes(keyword)) {
        credentialsFound.push(keyword);
        result.sensitiveData = true;
        result.severity = result.severity === "low" ? "medium" : result.severity;
      }
    }

    if (Object.keys(piiFound).length > 0) {
      result.details.piiFound = piiFound;
    }
    if (credentialsFound.length > 0) {
      result.details.credentialsFound = credentialsFound;
    }
  }

  return result;
}

/**
 * JWT payload structure expected from Keycloak
 */
interface JWTClaims {
  sub: string;
  userId?: string;
  email?: string;
  tenant?: string;
  tenantId?: string;
  org_id?: string;
  org_role?: string;
  roles?: string[];
  permissions?: string[];
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Validate and decode JWT token
 */
async function validateToken(token: string): Promise<{ valid: true; claims: JWTClaims } | { valid: false; error: string }> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid token format" };
    }

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return { valid: false, error: "Token expired" };
    }

    return { valid: true, claims: payload };
  } catch (error) {
    return { valid: false, error: "Failed to decode token" };
  }
}

/**
 * Log security event (to SIEM, audit log, etc.)
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  console.error("SECURITY_EVENT", JSON.stringify({
    ...event,
    timestamp: event.timestamp || Date.now(),
    id: event.id || randomUUID(),
    source: event.source || "cerebrocyber-middleware",
  }));
}

/**
 * Get client IP from request
 */
function getClientIP(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip") || "unknown";
}

/**
 * Default paths that skip authentication
 */
const DEFAULT_SKIP_AUTH_PATHS = [
  "/api/auth",
  "/api/public",
  "/health",
  "/metrics",
  "/auth/callback",
];

/**
 * CerebroCyber Security Middleware
 */
export async function cerebrocyberMiddleware(
  request: NextRequest,
  options: SecurityMiddlewareOptions = {}
): Promise<Response> {
  const startTime = Date.now();
  const opts: Required<Omit<SecurityMiddlewareOptions, 'skipAuthForPaths'>> & { skipAuthForPaths: string[] } = {
    rateLimit: { ...DEFAULT_RATE_LIMIT, ...options.rateLimit },
    threatDetection: { ...DEFAULT_THREAT_CONFIG, ...options.threatDetection },
    skipAuthForPaths: [...DEFAULT_SKIP_AUTH_PATHS, ...(options.skipAuthForPaths || [])],
  };

  const requestId = randomUUID();
  const clientIP = getClientIP(request);
  const path = request.nextUrl.pathname;

  const securityContext: SecurityContext = {
    requestId,
    timestamp: startTime,
    isAuthenticated: false,
    permissions: [],
    securityScore: 100,
    aiThreatLevel: "none",
  };

  // Check if path skips auth
  const skipAuth = opts.skipAuthForPaths.some(prefix => 
    path.startsWith(prefix) || path === prefix
  );

  // === 1. AUTHENTICATION ===
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token && !skipAuth) {
    return NextResponse.json(
      { error: "Unauthorized", code: "AUTH_REQUIRED" },
      { status: 401 }
    );
  }

  if (token && !skipAuth) {
    const authResult = await validateToken(token);
    
    if (!authResult.valid) {
      await logSecurityEvent({
        id: randomUUID(),
        type: "auth_failure",
        severity: "warning",
        message: `Authentication failed: ${authResult.error}`,
        context: securityContext,
        metadata: { path, clientIP },
        timestamp: Date.now(),
        riskScore: 50,
        source: "cerebrocyber-middleware",
      });

      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    securityContext.isAuthenticated = true;
    securityContext.userId = authResult.claims.userId || authResult.claims.sub;
    securityContext.tenantId = authResult.claims.tenantId || authResult.claims.tenant;
    securityContext.permissions = authResult.claims.permissions || [];
  } else {
    securityContext.isAuthenticated = true;
  }

  // === 2. RATE LIMITING ===
  const rateLimitKey = `${clientIP}:${path}`;
  const rateLimitResult = checkRateLimit(rateLimitKey, opts.rateLimit);
  
  if (!rateLimitResult.allowed) {
    await logSecurityEvent({
      id: randomUUID(),
      type: "rate_limit",
      severity: "info",
      message: `Rate limit exceeded for ${clientIP}`,
      context: securityContext,
      metadata: { path, windowMs: opts.rateLimit.windowMs },
      timestamp: Date.now(),
      riskScore: 30,
      source: "cerebrocyber-middleware",
    });

    return NextResponse.json(
      { 
        error: "Too Many Requests",
        code: "RATE_LIMITED",
        retryAfter: rateLimitResult.resetTime - Date.now()
      },
      { 
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(opts.rateLimit.maxRequests),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimitResult.resetTime),
        }
      }
    );
  }

  // === 3. AI THREAT DETECTION ===
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    const body = await request.text();
    
    if (body) {
      const threats = detectAIThreats(body, opts.threatDetection);

      if (threats.promptInjection) {
        securityContext.aiThreatLevel = "high";
        securityContext.securityScore -= 50;

        await logSecurityEvent({
          id: randomUUID(),
          type: "prompt_injection",
          severity: "critical",
          message: "Prompt injection attempt detected",
          context: securityContext,
          metadata: { 
            path, 
            clientIP,
            matches: threats.details.promptInjectionMatches,
          },
          timestamp: Date.now(),
          riskScore: 95,
          source: "cerebrocyber-middleware",
        });

        return NextResponse.json(
          {
            error: "Request blocked - potential prompt injection",
            code: "PROMPT_INJECTION_DETECTED",
            threatDetails: threats.details,
          },
          { status: 400 }
        );
      }

      if (threats.sensitiveData) {
        securityContext.aiThreatLevel = threats.severity;
        securityContext.securityScore -= 20;

        await logSecurityEvent({
          id: randomUUID(),
          type: "dlp_violation",
          severity: threats.severity === "high" || threats.severity === "critical" ? "warning" : "error",
          message: "Potential sensitive data detected in request",
          context: securityContext,
          metadata: {
            path,
            clientIP,
            piiType: Object.keys(threats.details.piiFound || {}),
            credentials: threats.details.credentialsFound,
          },
          timestamp: Date.now(),
          riskScore: 75,
          source: "cerebrocyber-middleware",
        });
      }
    }
  }

  // === 4. BUILD RESPONSE WITH SECURITY HEADERS ===
  const response = NextResponse.next();

  // Standard security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  response.headers.set("X-Content-Security-Policy", "default-src 'self'");

  // CSP Header
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://*.cerebrohive.com; " +
    "frame-ancestors 'none';"
  );

  // CerebroHive-specific headers
  response.headers.set("X-Cerebro-Request-ID", requestId);
  response.headers.set("X-Cerebro-Threat-Level", securityContext.aiThreatLevel);
  response.headers.set("X-Cerebro-Processing-Time", String(Date.now() - startTime));
  response.headers.set("X-Security-Score", String(securityContext.securityScore));

  // Rate limit headers
  response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
  response.headers.set("X-RateLimit-Limit", String(opts.rateLimit.maxRequests));
  response.headers.set("X-RateLimit-Reset", String(rateLimitResult.resetTime));

  return response;
}

// Export utilities
export const SECURITY_HEADERS = {
  X_CONTENT_TYPE_OPTIONS: "nosniff",
  X_FRAME_OPTIONS: "DENY",
  X_XSS_PROTECTION: "1; mode=block",
  REFERRER_POLICY: "strict-origin-when-cross-origin",
  PERMISSIONS_POLICY: "camera=(), microphone=(), geolocation=()",
} as const;

export const THREAT_LEVELS = {
  NONE: "none",
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export { checkRateLimit, detectAIThreats, clearRateLimit, logSecurityEvent, validateToken };