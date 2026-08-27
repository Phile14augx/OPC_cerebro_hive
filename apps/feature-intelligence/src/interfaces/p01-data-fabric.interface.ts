export interface P01IngestConnectorRequest {
  name: string;
  sourceType: string;
  configuration: Record<string, any>;
}

export interface P01TransformJobRequest {
  jobName: string;
  parameters: Record<string, any>;
}

export interface P01QueryRequest {
  sql: string;
}

export interface P01DataIngestedEvent {
  datasetId: string;
  timestamp: string;
  rowCount: number;
  schemaVersion: string;
}

export interface P01PipelineCompletedEvent {
  pipelineId: string;
  status: 'SUCCESS' | 'FAILURE';
  durationMs: number;
  outputDatasets: string[];
}

export interface P01SchemaUpdatedEvent {
  datasetId: string;
  changes: Record<string, any>;
}
