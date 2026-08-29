# Data Model: Nexarch Privacy Intelligence

## Core Entities
- **ConsentLedger**: Immutable records of user consent, tied to specific purposes and lawful bases.
- **PrivacyBudget**: Tracks $\epsilon$ and $\delta$ usage across queries for a specific dataset or user.
- **AnonymizationJob**: Audit trail for large-scale dataset transformations.

## Prisma Schema Draft

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model ConsentLedger {
  id           String   @id @default(uuid())
  userId       String
  purpose      String
  lawfulBasis  String
  grantedAt    DateTime @default(now())
  revokedAt    DateTime?
  metadata     Json?
  
  @@index([userId, purpose])
}

model PrivacyBudget {
  id           String   @id @default(uuid())
  datasetId    String
  epsilonTotal Float
  epsilonUsed  Float
  deltaTotal   Float
  deltaUsed    Float
  updatedAt    DateTime @updatedAt
  
  @@index([datasetId])
}

model AnonymizationJob {
  id           String   @id @default(uuid())
  strategy     String
  status       String
  startedAt    DateTime @default(now())
  completedAt  DateTime?
  rowsAffected Int?
}
```

## Retention Policies
- **ConsentLedger**: Kept indefinitely as per compliance audit requirements, unless a strict data deletion mandate overwrites this.
- **AnonymizationJob**: Retained for 7 years for auditability.
- **PrivacyBudget**: Retained for the lifecycle of the dataset.

## Privacy Classification
- **ConsentLedger.userId**: `confidential` (Pseudonymized internal ID)
- **ConsentLedger.metadata**: `restricted` (May contain contextual PII)
- **PrivacyBudget.***: `internal`
