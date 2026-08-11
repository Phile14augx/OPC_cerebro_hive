// FIXTURE: must be REJECTED by `eda-otel-containment` (ADR 0003).
import { trace } from '@opentelemetry/api';
export const t: unknown = trace;
