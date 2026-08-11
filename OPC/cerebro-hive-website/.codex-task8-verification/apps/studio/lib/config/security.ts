export interface ComplianceStandard {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface SecurityFeature {
  id: string;
  title: string;
  description: string;
}

export const complianceStandards: ComplianceStandard[] = [
  { id: "soc2", name: "SOC 2 Type II", description: "Audited security, availability, and confidentiality controls.", icon: "ShieldCheck" },
  { id: "hipaa", name: "HIPAA Compliant", description: "Strict PHI protection for healthcare workloads.", icon: "Activity" },
  { id: "gdpr", name: "GDPR Ready", description: "Data sovereignty, right-to-be-forgotten, and EU data residency.", icon: "Globe" },
  { id: "iso27001", name: "ISO 27001", description: "Certified information security management systems.", icon: "Lock" }
];

export const securityFeatures: SecurityFeature[] = [
  {
    id: "private-enclave",
    title: "Private LLM Enclaves",
    description: "Deploy models entirely within your own Virtual Private Cloud (VPC) or on-premises infrastructure. Zero data egress to public APIs."
  },
  {
    id: "rbac",
    title: "Granular RBAC",
    description: "Enterprise-grade Role-Based Access Control mapped directly to your active directory (Okta, Entra ID) to enforce least-privilege."
  },
  {
    id: "e2e-encryption",
    title: "End-to-End Encryption",
    description: "AES-256 encryption at rest and TLS 1.3 in transit. Bring Your Own Key (BYOK) supported for total cryptographic control."
  },
  {
    id: "audit-logging",
    title: "Immutable Audit Trails",
    description: "Every AI agent decision, API call, and data access request is logged to an immutable ledger for compliance and forensic analysis."
  }
];
