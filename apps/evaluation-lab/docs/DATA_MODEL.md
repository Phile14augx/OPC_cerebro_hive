# Data Model

## Core Entities

### Dataset
Represents a collection of inputs and expected outputs/contexts for benchmarking.
- **Privacy**: Internal
- **Retention**: Indefinite (versioned)

### EvaluationRun
A specific execution of a target against datasets.
- **Privacy**: Internal
- **Retention**: 2 years

### EvaluationResult
Individual row-level result containing the target's output and the score.
- **Privacy**: Internal (may contain sensitive PII depending on dataset)
- **Retention**: 90 days (aggregated to EvaluationRun afterwards)

### HumanAnnotation
A label or score provided by a human reviewer.
- **Privacy**: Internal
- **Retention**: Indefinite (used to improve LLM-as-a-judge)

## Prisma Schema Draft
```prisma
model Dataset {
  id          String   @id @default(cuid())
  name        String
  type        String   // e.g., QA, CLASSIFICATION, AGENT_TRAJECTORY
  uri         String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  runs        EvaluationRun[]
}

model EvaluationRun {
  id          String   @id @default(cuid())
  targetId    String
  datasetId   String
  dataset     Dataset  @relation(fields: [datasetId], references: [id])
  status      String   // QUEUED, RUNNING, COMPLETED, FAILED
  metrics     Json     // Configured metrics
  summary     Json?    // Aggregated scores
  createdAt   DateTime @default(now())
  completedAt DateTime?
  results     EvaluationResult[]
}

model EvaluationResult {
  id          String        @id @default(cuid())
  runId       String
  run         EvaluationRun @relation(fields: [runId], references: [id])
  inputData   Json
  outputData  Json
  scores      Json          // Dictionary of metric -> score
  judgeLog    Json?         // LLM judge reasoning
  createdAt   DateTime      @default(now())
}
```
