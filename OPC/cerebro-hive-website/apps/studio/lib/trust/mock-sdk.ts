// Mock SDK for Enterprise Trust & Governance

export interface ExecutiveMetrics {
  overallScore: number;
  securityScore: number;
  complianceScore: number;
  governanceScore: number;
  reliabilityScore: number;
  aiSafetyScore: number;
  privacyScore: number;
  operationsScore: number;
  availabilityScore: number;
}

export interface SecurityPosture {
  identity: string;
  mfa: string;
  sso: string;
  rbac: string;
  secrets: string;
  encryption: string;
  certificates: string;
  apiKeys: string;
  sessionHealth: string;
  serviceAccounts: string;
  providerCredentials: string;
}

export interface RiskItem {
  id: string;
  category: string; // Hallucination, Prompt Injection, Jailbreak, PII Leakage, Data Poisoning, Bias, Tool Abuse, Model Drift
  likelihood: 'Low' | 'Medium' | 'High' | 'Critical';
  impact: 'Low' | 'Medium' | 'High' | 'Critical';
  exposure: string;
  mitigation: string;
  owner: string;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  progress: number; // 0-100
  controls: number;
  evidence: number;
  auditLogs: number;
  owner: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  message: string;
  category: 'Policy' | 'Workflow' | 'Provider' | 'Prompt' | 'Agent' | 'Evaluation' | 'Alert' | 'Security';
  user: string;
}

export interface Alert {
  id: string;
  severity: 'Critical' | 'Warning' | 'Information' | 'Resolved';
  message: string;
  timestamp: string;
}

export interface ProviderHealth {
  id: string;
  name: string;
  status: 'Healthy' | 'Slow' | 'Offline';
  latency: number;
  errorRate: number;
}

export interface AISafetyMetrics {
  hallucinationRate: number;
  promptInjectionAttempts: number;
  safetyBlocks: number;
  piiDetections: number;
  policyViolations: number;
}

class MockTrustClient {
  async getExecutiveMetrics(): Promise<ExecutiveMetrics> {
    return {
      overallScore: 94,
      securityScore: 98,
      complianceScore: 89,
      governanceScore: 92,
      reliabilityScore: 99,
      aiSafetyScore: 95,
      privacyScore: 96,
      operationsScore: 91,
      availabilityScore: 99.99
    };
  }

  async getSecurityPosture(): Promise<SecurityPosture> {
    return {
      identity: 'Enforced',
      mfa: '98% Coverage',
      sso: 'Okta Integrated',
      rbac: 'Strict',
      secrets: 'HashiCorp Vault',
      encryption: 'AES-256 (Rest), TLS 1.3 (Transit)',
      certificates: 'Automated (Let\\'s Encrypt)',
      apiKeys: 'Rotated (30 days)',
      sessionHealth: 'Monitored',
      serviceAccounts: 'Least Privilege',
      providerCredentials: 'Secure Enclave'
    };
  }

  async getRisks(): Promise<RiskItem[]> {
    return [
      { id: '1', category: 'Prompt Injection', likelihood: 'Medium', impact: 'High', exposure: 'External APIs', mitigation: 'Input Sanitization', owner: 'AI Safety Team' },
      { id: '2', category: 'Hallucination', likelihood: 'Low', impact: 'Medium', exposure: 'Chat Interfaces', mitigation: 'Retrieval Augmented Generation', owner: 'Model Ops' },
      { id: '3', category: 'PII Leakage', likelihood: 'Low', impact: 'Critical', exposure: 'Vector DB', mitigation: 'Data Redaction Pipeline', owner: 'Privacy Office' },
      { id: '4', category: 'Data Poisoning', likelihood: 'Low', impact: 'High', exposure: 'Fine-tuning Datasets', mitigation: 'Dataset Hashing', owner: 'Data Eng' },
    ];
  }

  async getComplianceFrameworks(): Promise<ComplianceFramework[]> {
    return [
      { id: 'soc2', name: 'SOC2 Type II', progress: 95, controls: 120, evidence: 340, auditLogs: 12000, owner: 'Compliance Team' },
      { id: 'hipaa', name: 'HIPAA', progress: 100, controls: 85, evidence: 210, auditLogs: 8000, owner: 'Privacy Officer' },
      { id: 'iso27001', name: 'ISO 27001', progress: 89, controls: 114, evidence: 280, auditLogs: 9500, owner: 'InfoSec' },
      { id: 'gdpr', name: 'GDPR', progress: 74, controls: 60, evidence: 150, auditLogs: 5000, owner: 'DPO' },
    ];
  }

  async getAuditTimeline(): Promise<AuditEvent[]> {
    return [
      { id: '1', timestamp: '09:31', message: 'Policy Approved: Data Retention', category: 'Policy', user: 'admin@cerebro.com' },
      { id: '2', timestamp: '09:28', message: 'Workflow Deployed: Customer Support', category: 'Workflow', user: 'dev@cerebro.com' },
      { id: '3', timestamp: '09:18', message: 'Provider Switched: OpenAI -> Anthropic', category: 'Provider', user: 'sysop@cerebro.com' },
      { id: '4', timestamp: '09:10', message: 'Prompt Updated: System Prompt V2', category: 'Prompt', user: 'prompt-eng@cerebro.com' },
      { id: '5', timestamp: '09:03', message: 'Agent Published: Code Reviewer', category: 'Agent', user: 'dev@cerebro.com' },
    ];
  }

  async getAlerts(): Promise<Alert[]> {
    return [
      { id: '1', severity: 'Critical', message: 'API Latency Spike (>2000ms)', timestamp: '10:15' },
      { id: '2', severity: 'Warning', message: 'Rate Limit Reached (OpenAI)', timestamp: '09:45' },
      { id: '3', severity: 'Information', message: 'Model Weights Synced', timestamp: '08:30' },
      { id: '4', severity: 'Resolved', message: 'Database Failover Completed', timestamp: '07:15' },
    ];
  }

  async getProviderHealth(): Promise<ProviderHealth[]> {
    return [
      { id: 'openai', name: 'OpenAI', status: 'Healthy', latency: 450, errorRate: 0.01 },
      { id: 'anthropic', name: 'Anthropic', status: 'Healthy', latency: 320, errorRate: 0.005 },
      { id: 'gemini', name: 'Gemini', status: 'Slow', latency: 1200, errorRate: 0.05 },
      { id: 'azure', name: 'Azure OpenAI', status: 'Healthy', latency: 410, errorRate: 0.01 },
      { id: 'ollama', name: 'Ollama (Local)', status: 'Offline', latency: 0, errorRate: 1.0 },
    ];
  }

  async getAISafetyMetrics(): Promise<AISafetyMetrics> {
    return {
      hallucinationRate: 1.2, // %
      promptInjectionAttempts: 452,
      safetyBlocks: 128,
      piiDetections: 34,
      policyViolations: 12,
    };
  }
}

export const trustClient = new MockTrustClient();
