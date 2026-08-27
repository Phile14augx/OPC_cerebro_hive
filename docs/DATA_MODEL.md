# Data Model

## Core Entities

* **Policy:** Defines rules using OPA Rego.
* **ModelCard:** Standardized metadata for AI models.
* **ApprovalWorkflow:** State machine for human or automated approvals.
* **ProvenanceRecord:** Cryptographic chain of events for a model or decision.

## Prisma Schema Draft

```prisma
model Policy {
  id          String   @id @default(uuid())
  name        String
  regoContent String
  version     Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  status      String   // active, inactive
}

model ModelCard {
  id           String   @id @default(uuid())
  modelId      String   @unique
  name         String
  capabilities Json
  limitations  Json
  status       String   // draft, approved, deprecated
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model ApprovalWorkflow {
  id           String   @id @default(uuid())
  resourceId   String
  workflowType String   // human, automated, escalation
  status       String   // pending, approved, rejected
  justification String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model ProvenanceRecord {
  id            String   @id @default(cuid())
  sourceProduct String   // e.g. "P44" — which product emitted this record
  eventType     String   // e.g. "consent_granted", "privacy_budget_consumed", "policy_evaluated"
  subjectId     String   // data subject identifier (pseudonymised)
  payload       Json     // flexible audit payload from source product
  lawfulBasis   String?  // GDPR Article 6 basis if applicable
  epsilon       Float?   // differential privacy budget consumed (from P44)
  delta         Float?   // DP delta parameter (from P44)
  timestamp     DateTime @default(now())
  policyRef     String?  // OPA policy ID that evaluated or triggered this event
  verdict       String?  // policy evaluation result: "allow", "deny", "escalate"
}
```

## Retention Policies
* **Model Cards:** Retained indefinitely.
* **Policies:** Version history retained indefinitely.
* **Approval Workflows:** Retained for 7 years minimum for compliance.
* **Audit Logs:** Retained in immutable storage for 10 years.

## Privacy Classification
* `Policy.regoContent`: Internal
* `ModelCard` fields: Public (internal to organization)
* `ApprovalWorkflow.justification`: Confidential
