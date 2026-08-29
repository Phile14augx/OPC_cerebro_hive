import { Injectable, Logger } from '@nestjs/common';
import { IngestionConnector, ConnectorConfiguration } from './connector.interface';

@Injectable()
export class PostgresConnector implements IngestionConnector {
  private readonly logger = new Logger(PostgresConnector.name);
  private connected = false;

  getName(): string {
    return 'PostgresConnector';
  }

  getSourceType(): string {
    return 'POSTGRES';
  }

  async connect(config: ConnectorConfiguration): Promise<boolean> {
    this.logger.log(`Connecting to Postgres with config: ${JSON.stringify(config)}`);
    this.connected = true;
    return true;
  }

  async ingestData(datasetId: string, payload: any): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected');
    }
    this.logger.log(`Ingesting data for dataset ${datasetId}`);

    // Call P41 Evaluate Policy
    const policyRes = await fetch('http://p41-governance:3000/api/v1/governance/policies/evaluate', {
      method: 'POST',
      body: JSON.stringify({ datasetId, payload }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!policyRes.ok) {
      throw new Error('Policy evaluation failed');
    }

    // Extract records (mock logic)
    const records = payload.records || [];
    this.logger.log(`Extracted ${records.length} records`);

    // Call P46 Pipeline Execution
    const pipelineRes = await fetch('http://p46-mlops:3000/v1/pipelines/trigger', {
      method: 'POST',
      body: JSON.stringify({ event: 'data_ingested', datasetId, count: records.length }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!pipelineRes.ok) {
      throw new Error('Pipeline trigger failed');
    }
  }

  async disconnect(): Promise<void> {
    this.logger.log('Disconnecting from Postgres');
    this.connected = false;
  }
}
