# Data Model

## Core Domain Entities

```prisma
model Connector {
  id            String   @id @default(uuid())
  name          String
  type          String   // e.g., postgres, s3, kafka
  config        Json     // Encrypted connection details
  status        String   // ACTIVE, ERROR, PAUSED
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  datasets      Dataset[]
}

model Dataset {
  id            String   @id @default(uuid())
  name          String
  connectorId   String
  schema        Json     // Schema definition
  format        String   // e.g., Iceberg, Parquet
  privacyClass  String   // PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED
  connector     Connector @relation(fields: [connectorId], references: [id])
  pipelines     Pipeline[]
}

model Pipeline {
  id            String   @id @default(uuid())
  name          String
  type          String   // SPARK, DBT
  definition    String   // Code or reference to code
  targetDatasetId String
  targetDataset Dataset  @relation(fields: [targetDatasetId], references: [id])
  schedule      String?  // Cron expression
}
```

## Retention Policies
- Raw ingested data: 30 days (default), configurable.
- Cleaned/Silver data: 1 year.
- Aggregated/Gold data: Indefinite (or as governed by compliance).

## Privacy Classification
- **Public:** Available to all authenticated users.
- **Internal:** Available to employees/systems within the organization.
- **Confidential:** Restricted to specific groups/roles (e.g., PII data).
- **Restricted:** Highly sensitive (e.g., PCI/PHI data), requires special audit logging and KMS encryption.
