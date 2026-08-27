export interface IConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  ingest(data: any): Promise<void>;
}