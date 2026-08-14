export type JobStatus =
  | "QUEUED"
  | "PREPARING"
  | "RUNNING"
  | "WAITING_FOR_INPUT"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "TIMED_OUT";

export interface JobRecord {
  id: string;
  type: string;
  status: JobStatus;
  workspaceId?: string;
  projectId?: string;
  userId?: string;
  traceId?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  errorCode?: string;
}

export interface JobLogRecord {
  jobId: string;
  stream: "stdout" | "stderr" | "system";
  message: string;
  timestamp: string;
}
