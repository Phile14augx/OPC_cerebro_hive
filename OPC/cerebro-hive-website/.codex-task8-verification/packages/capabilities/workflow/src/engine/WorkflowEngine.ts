import { Client, Connection } from '@temporalio/client';
import { AgentDAGWorkflow } from './AgentDAGWorkflow';

export interface IWorkflowEngine {
  startWorkflow(templateId: string, input: any): Promise<string>;
  getWorkflowStatus(executionId: string): Promise<any>;
  cancelWorkflow(executionId: string): Promise<void>;
}

export class TemporalWorkflowEngine implements IWorkflowEngine {
  private clientPromise: Promise<Client>;

  constructor(temporalAddress = 'localhost:7233') {
    this.clientPromise = Connection.connect({ address: temporalAddress }).then(
      connection => new Client({ connection })
    );
  }

  async startWorkflow(templateId: string, input: any): Promise<string> {
    const executionId = `exec-${Math.random().toString(36).substring(7)}`;
    const client = await this.clientPromise;
    
    await client.workflow.start(AgentDAGWorkflow, {
      taskQueue: 'cerebro-workflows',
      workflowId: executionId,
      args: [templateId, input]
    });
    
    return executionId;
  }

  async getWorkflowStatus(executionId: string): Promise<any> {
    const client = await this.clientPromise;
    const handle = client.workflow.getHandle(executionId);
    const desc = await handle.describe();
    return {
      status: desc.status.name,
      executionId: desc.workflowId
    };
  }

  async cancelWorkflow(executionId: string): Promise<void> {
    const client = await this.clientPromise;
    const handle = client.workflow.getHandle(executionId);
    await handle.cancel();
  }
}

