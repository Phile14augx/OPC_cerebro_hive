# Data Model: Nexarch Feature Intelligence (P02)

## Core Domain Entities

1. **Entity:** The primary subject of features (e.g., User, Product, Store).
2. **Feature View:** A logical grouping of features derived from one or more data sources, sharing the same entity keys and transformation logic.
3. **Feature:** An individual measurable property or characteristic.
4. **Feature Service:** A curated list of features served together for a specific ML model.
5. **Job:** An asynchronous task for materializing features or generating datasets.

## Prisma Schema Draft

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Entity {
  id          String        @id @default(uuid())
  name        String        @unique
  description String?
  valueType   String        // e.g., STRING, INT64
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  views       FeatureView[]
}

model FeatureView {
  id             String    @id @default(uuid())
  name           String
  version        Int
  description    String?
  entityId       String
  entity         Entity    @relation(fields: [entityId], references: [id])
  queryContext   String    // SQL or DSL for transformation
  batchSourceUri String?
  streamTopic    String?
  features       Feature[]
  createdAt      DateTime  @default(now())
  
  @@unique([name, version])
}

model Feature {
  id             String      @id @default(uuid())
  name           String
  dataType       String      // INT, FLOAT, STRING, DENSE_VECTOR, SPARSE_VECTOR
  description    String?
  viewId         String
  view           FeatureView @relation(fields: [viewId], references: [id])
  privacyClass   String      @default("INTERNAL") // PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED
}

model FeatureService {
  id          String   @id @default(uuid())
  name        String
  version     Int
  description String?
  features    Json     // Array of feature references
  createdAt   DateTime @default(now())
  
  @@unique([name, version])
}
```

## Retention Policies
- **Online Store:** Features are retained based on a configured TTL per Feature View (e.g., 30 days for rolling window features, or indefinitely for static profiles).
- **Offline Store:** Raw feature values retained indefinitely (or bound by corporate data retention policies) to support historical point-in-time joins.
- **Metadata:** Registry metadata is retained indefinitely.

## Privacy Classification
- **Public:** Aggregated, non-sensitive features (e.g., global average product rating).
- **Internal:** Standard business metrics (e.g., total category sales).
- **Confidential:** PII-derived or sensitive user behaviors (e.g., individual user transaction counts).
- **Restricted:** Highly sensitive data (e.g., financial credit scores, medical embeddings). Requires strict ACLs and audit logging for access.
