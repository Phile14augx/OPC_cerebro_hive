# Data Model

## Core Domain Entities

1. **VectorNamespace**
   - Logical partition for vectors, typically mapped 1:1 with an enterprise tenant or a specific knowledge base.
2. **VectorRecord**
   - The primary entity storing the multidimensional dense array, optional sparse indices, and unstructured JSON metadata.

## Prisma Schema Draft

```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [vector]
}

model VectorNamespace {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String   @map("tenant_id")
  name        String
  createdAt   DateTime @default(now())
  
  vectors     VectorRecord[]

  @@unique([tenantId, name])
}

model VectorRecord {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  namespaceId String   @map("namespace_id") @db.Uuid
  externalId  String   @map("external_id") // Links to P04 KG node or P02 feature
  embedding   Unsupported("vector(1536)") // Dimensionality parameterized
  sparseText  String?  // For BM25
  metadata    Jsonb    @default("{}")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  namespace   VectorNamespace @relation(fields: [namespaceId], references: [id], onDelete: Cascade)

  @@index([embedding(ops: vector_cosine_ops)], type: Hnsw)
  @@index([namespaceId, externalId])
}
```

## Retention Policies
- Vectors inherit retention policies from the source domain (e.g., Knowledge Graph). If the parent node is deleted, a NATS event triggers cascade deletion in P03.
- Orphaned vectors are garbage collected via a weekly cron job.

## Privacy Classification
- `embedding` / `sparseText`: **Confidential** (Derivable back to original PII/IP).
- `metadata`: **Confidential** (May contain sensitive ACLs or tags).
- `externalId`: **Internal**.
- `tenantId`: **Internal**.
