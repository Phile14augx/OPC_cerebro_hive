/**
 * CerebroCyber™ Security Configuration for CerebroHive Platform
 * 
 * Integrates with Month 1 DevOps Infrastructure setup
 * Part of the Brand System & Dark Intelligence UI foundation
 */

// ============================================================================
// TYPE DEFINITIONS (Mirrors main cybersecurity.ts types)
// ============================================================================

export interface SecurityMiddlewareOptions {
  rateLimit?: Partial<RateLimitConfig>;
  threatDetection?: Partial<ThreatDetectionConfig>;
  compliance?: Partial<ComplianceConfig>;
  skipAuthForPaths?: string[];
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

export interface ComplianceConfig {
  frameworks: ("soc2" | "hipaa" | "gdpr" | "iso27001" | "nist")[];
  auditLog: boolean;
  evidenceCollection: boolean;
}

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================

export const CEREBROCYBER_CONFIG = {
  // Rate limiting based on environment
  rateLimit: process.env.SECURITY_RATE_LIMIT
    ? {
        windowMs: 60_000,
        maxRequests: parseInt(process.env.SECURITY_RATE_LIMIT, 10),
      }
    : {
        windowMs: 60_000,
        maxRequests: 1000,
      },

  // Threat detection based on environment
  threatDetection: {
    checkPII: process.env.PII_DETECTION_ENABLED !== "false",
    checkCredentials: process.env.CREDENTIAL_DETECTION_ENABLED !== "false",
    checkPromptInjection: process.env.PROMPT_INJECTION_DETECTION !== "false",
  },

  // Paths that skip authentication (public endpoints)
  skipAuthForPaths: [
    "/api/auth",
    "/api/public",
    "/health",
    "/metrics",
    "/auth/callback",
    "/security/events", // Health check for security events API
  ],

  // Compliance configuration
  compliance: {
    frameworks: process.env.COMPLIANCE_FRAMEWORKS?.split(",") || ["soc2"],
    auditLog: process.env.EVIDENCE_COLLECTION_ENABLED === "true",
    evidenceCollection: process.env.EVIDENCE_COLLECTION_ENABLED === "true",
  },
};

// ============================================================================
// SECURITY HEADERS CONFIGURATION
// ============================================================================

export const SECURITY_HEADERS: Record<string, string> = {
  // Standard security headers
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",

  // Content Security Policy for dark intelligence UI
  "Content-Security-Policy":
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://*.cerebrohive.com https://*.anthropic.com https://*.openai.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; ",

  // CerebroHive-specific headers
  "X-Cerebro-Version": "1.0.0",
  "X-Cerebro-Threat-Level": "none",
};

// ============================================================================
// BRAND SYSTEM COLORS (Neural Blue Palette)
// ============================================================================

export const CEREBROHIVE_COLORS = {
  primary: {
    50: "#E8F4FF",
    100: "#C9E7FF",
    200: "#9BD6FF",
    300: "#6BC5FF",
    400: "#3EB4FF",
    500: "#00E5FF", // Neural Blue
    600: "#00D1E5",
    700: "#00B9CC",
    800: "#009FB3",
    900: "#008599",
  },
  secondary: {
    50: "#F0F4F8",
    100: "#E2E9F0",
    200: "#C1CFDE",
    300: "#9FB4C9",
    400: "#7D94B4",
    500: "#5B85A0",
    600: "#4A6F85",
    700: "#39536B",
    800: "#283952",
    900: "#171F3A",
  },
  dark: {
    primary: "#080B14", // Deep Space
    secondary: "#121721",
    accent: "#4F46E5", // Indigo
  },
  glass: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "rgba(255, 255, 255, 0.1)",
    overlay: "rgba(255, 255, 255, 0.08)",
  },
};

// ============================================================================
// UI COMPONENT CLASSNAMES (Glassmorphism)
// ============================================================================

export const CEREBROHIVE_CLASSES = {
  card: "card-glass",
  button: "btn-primary",
  section: "section-label",
};

// ============================================================================
// DEVOPS CONFIGURATION (For Terraform/CloudFormation)
// ============================================================================

export const DEVOPS_CONFIG = {
  // AWS Configuration
  aws: {
    region: process.env.AWS_REGION || "us-east-1",
    account: process.env.AWS_ACCOUNT_ID || "",
    vpc: {
      cidr: "10.0.0.0/16",
      publicSubnets: ["10.0.1.0/24", "10.0.2.0/24"],
      privateSubnets: ["10.0.10.0/24", "10.0.11.0/24"],
    },
  },

  // EKS Cluster Configuration
  eks: {
    version: "1.31",
    nodeGroups: {
      general: {
        instanceType: "t3.medium",
        minSize: 2,
        maxSize: 10,
        desiredSize: 3,
      },
      cpu: {
        instanceType: "c6i.large",
        minSize: 1,
        maxSize: 5,
        desiredSize: 2,
      },
    },
  },

  // Security Configuration
  security: {
    // WAF rules configuration
    wafRules: [
      "AWSManagedRulesCommonRuleSet",
      "AWSManagedRulesAmazonIpReputationList",
      "CerebroHiveCustomRuleSet",
    ],
    // Shield Advanced
    shieldEnabled: true,
    // GuardDuty
    guarddutyEnabled: true,
  },

  // CI/CD Configuration
  cicd: {
    githubActions: {
      branchProtection: true,
      requiredApprovals: 1,
      statusChecks: ["lint", "test", "security-scan"],
    },
    argocd: {
      appOfAppsPattern: true,
      healthCheckTimeout: 300,
    },
  },
};

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

export const CORS_CONFIG = {
  allowedOrigins: [
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3400",
    "https://*.cerebrohive.com",
    "https://localhost:3400",
  ],
  allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Cerebro-Request-ID",
    "X-Cerebro-Threat-Level",
  ],
};

export default CEREBROCYBER_CONFIG;