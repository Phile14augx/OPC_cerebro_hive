# Data Model: Pattern Intelligence (P09)

## Prisma Schema

```prisma
model Pattern {
  id          String   @id @default(uuid())
  name        String
  category    String   // anomaly, trend, correlation
  description String
  confidence  Float
  metadata    Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  status      String   // active, inactive, archived
}

model AnalysisJob {
  id           String   @id @default(uuid())
  sourceId     String
  analysisType String
  status       String   // pending, running, completed, failed
  results      Json?
  startedAt    DateTime @default(now())
  completedAt  DateTime?
}
```
