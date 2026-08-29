import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class QueryFederationService {
  private readonly logger = new Logger(QueryFederationService.name);

  async executeQuery(sql: string, sourceId: string): Promise<any[]> {
    this.logger.log(`Executing federated query on ${sourceId}: ${sql}`);

    // Resolve Connector
    const connectorType = this.resolveConnector(sourceId);
    if (!connectorType) {
      throw new Error(`No connector found for source ${sourceId}`);
    }

    // Call P41 Evaluate Policy
    const policyRes = await fetch('http://p41-governance:3000/api/v1/governance/policies/evaluate', {
      method: 'POST',
      body: JSON.stringify({ sql, sourceId, type: connectorType }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!policyRes.ok) {
      throw new Error('Policy evaluation failed: Access Denied');
    }

    // Mock query execution based on connector
    return [
      { id: 1, source: sourceId, connector: connectorType, queried: true }
    ];
  }

  resolveConnector(sourceId: string): string | null {
    if (!sourceId) return null;
    if (sourceId.startsWith('pg-')) return 'POSTGRES';
    if (sourceId.startsWith('csv-')) return 'CSV';
    if (sourceId.startsWith('mongo-')) return 'MONGODB';
    return null;
  }
}
