export interface ConnectorConfiguration {
  [key: string]: any;
}

export interface IngestionConnector {
  getName(): string;
  getSourceType(): string;
  connect(config: ConnectorConfiguration): Promise<boolean>;
  ingestData(datasetId: string, payload: any): Promise<void>;
  disconnect(): Promise<void>;
}
