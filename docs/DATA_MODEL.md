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
