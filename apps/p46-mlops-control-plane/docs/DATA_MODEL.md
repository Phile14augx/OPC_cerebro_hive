# Data Model

## Core Entities
- **Experiment**: Logical grouping of runs.
- **Run**: Execution instance with parameters, metrics, and tags.
- **RegisteredModel**: Top-level entity for a deployable model.
- **ModelVersion**: Specific iteration of a RegisteredModel.
- **Pipeline**: Definition of a DAG for training/eval.
- **PipelineExecution**: Instance of a running Pipeline.

## Prisma Schema Draft
```prisma
model RegisteredModel {
  id          String         @id @default(uuid())
  name        String         @unique
  description String?
  versions    ModelVersion[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

model ModelVersion {
  id                String          @id @default(uuid())
  registeredModelId String
  model             RegisteredModel @relation(fields: [registeredModelId], references: [id])
  version           Int
  stage             String          @default("NONE") // NONE, STAGING, PRODUCTION, ARCHIVED
  artifactUri       String
  runId             String?
  createdAt         DateTime        @default(now())

  @@unique([registeredModelId, version])
}

model Run {
  id            String   @id @default(uuid())
  experimentId  String
  status        String
  metrics       Json?
  parameters    Json?
  startTime     DateTime @default(now())
  endTime       DateTime?
}
```

## Retention Policies
- **Metrics/Params**: Retained for 3 years (Compliance).
- **Artifacts (Weights)**: Retained for 1 year post-deprecation, then moved to cold storage.
- **Pipeline Logs**: Retained for 90 days.

## Privacy Classification
- Model Metadata: INTERNAL
- Model Artifacts (Weights): CONFIDENTIAL
- Evaluation Datasets: RESTRICTED
