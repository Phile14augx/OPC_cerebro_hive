const fs = require('fs');
const path = require('path');

const packagesDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages');
const servicesDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'services');

// ----------------------------------------------------
// EPIC 1: AGENTOPS EXECUTION ENGINE (M8)
// ----------------------------------------------------
const swarmRuntimeDir = path.join(servicesDir, 'swarm-runtime', 'src');

fs.writeFileSync(path.join(swarmRuntimeDir, 'ExecutionEngine.ts'), `
import { TaskDAG, TaskNode, emitSwarmEvent } from '@cerebro/swarm-sdk';

// 1. Task Queue Abstraction
export class TaskQueue {
  private queue: TaskNode[] = [];
  
  enqueue(node: TaskNode) { this.queue.push(node); }
  dequeue(): TaskNode | undefined { return this.queue.shift(); }
  isEmpty() { return this.queue.length === 0; }
}

// 2. Execution Provider Interface
export interface ExecutionProvider {
  execute(node: TaskNode): Promise<void>;
}

// 3. Worker Thread Provider (Phase 1)
export class WorkerThreadProvider implements ExecutionProvider {
  async execute(node: TaskNode): Promise<void> {
    emitSwarmEvent('AGENT_STARTED', { taskId: node.id });
    emitSwarmEvent('REASONING_STARTED', { taskId: node.id, intent: node.intent });
    
    // Simulate agent thought loop
    await new Promise(r => setTimeout(r, 600));
    emitSwarmEvent('TOOL_CALLED', { tool: 'KnowledgeRetriever', args: { query: node.intent } });
    
    await new Promise(r => setTimeout(r, 400));
    emitSwarmEvent('MEMORY_RETRIEVED', { chunks: 3 });
    
    await new Promise(r => setTimeout(r, 500));
    emitSwarmEvent('EXECUTION_FINISHED', { taskId: node.id, result: 'Success' });
  }
}

// 4. Execution Engine refactored to use Queue + Provider
export class ExecutionEngine {
  private queue = new TaskQueue();
  
  constructor(private provider: ExecutionProvider) {}

  async run(dag: TaskDAG) {
    emitSwarmEvent('SWARM_STARTED', { nodes: dag.nodes.length });
    
    // Enqueue all nodes (Ignoring complex DAG dependency sorting for this mock)
    dag.nodes.forEach(n => this.queue.enqueue(n));

    // Process Queue
    while (!this.queue.isEmpty()) {
      const node = this.queue.dequeue();
      if (node) {
        emitSwarmEvent('TASK_STARTED', { taskId: node.id });
        await this.provider.execute(node);
        emitSwarmEvent('TASK_COMPLETED', { taskId: node.id });
      }
    }

    emitSwarmEvent('SWARM_COMPLETED', { success: true });
  }
}

export class Scheduler {
  // Using WorkerThreadProvider for Phase 1 local development
  private engine = new ExecutionEngine(new WorkerThreadProvider());
  
  dispatch(dag: TaskDAG) {
    emitSwarmEvent('PLAN_CREATED', { dag });
    console.log('[Scheduler] DAG generated. Dispatching to Execution Engine queue...');
    this.engine.run(dag);
  }
}
export const SwarmScheduler = new Scheduler();
`);

// ----------------------------------------------------
// EPIC 2: AGENTOPS DASHBOARD (UI) EXPANSION (M8)
// ----------------------------------------------------
const swarmUiSrc = path.join(packagesDir, 'widgets', 'swarm', 'src');

fs.writeFileSync(path.join(swarmUiSrc, 'LiveExecutionTimelineWidget.tsx'), `
import React, { useEffect, useState } from 'react';
import { PlatformEventBus } from '@cerebro/events';
import { CardContent } from '@cerebro/ui';

export const LiveExecutionTimelineWidget = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const unsub = PlatformEventBus.subscribe('telemetry:event' as any, (event: any) => {
      // Filter for Swarm/Agent lifecycle events
      const swarmTypes = ['REASONING_STARTED', 'TOOL_CALLED', 'MEMORY_RETRIEVED', 'EXECUTION_FINISHED'];
      if (swarmTypes.includes(event.type)) {
        setEvents(prev => [...prev, event].slice(-10)); // Keep last 10
      }
    });
    return unsub;
  }, []);

  return (
    <CardContent className="flex flex-col gap-2 py-4">
      <h3 className="font-semibold text-sm mb-2">Live Agent Reasoning</h3>
      {events.map((e, i) => (
        <div key={i} className="flex gap-2 text-xs">
          <span className="text-[var(--color-text-muted)]">{new Date(e.timestamp).toLocaleTimeString()}</span>
          <span className="font-medium text-[var(--color-text-primary)]">{e.type}</span>
          <span className="text-[var(--color-text-secondary)]">{JSON.stringify(e.details)}</span>
        </div>
      ))}
      {events.length === 0 && <p className="text-xs text-[var(--color-text-muted)]">Awaiting agent execution...</p>}
    </CardContent>
  );
};
`);

fs.writeFileSync(path.join(swarmUiSrc, 'ToolInvocationExplorerWidget.tsx'), `
import React from 'react';
import { CardContent } from '@cerebro/ui';

export const ToolInvocationExplorerWidget = () => (
  <CardContent className="flex flex-col items-center justify-center py-8">
    <p className="text-sm text-[var(--color-text-muted)] italic">Tool Invocation Statistics Viewer</p>
  </CardContent>
);
`);

// Update index to export new widgets
let indexContent = fs.readFileSync(path.join(swarmUiSrc, 'index.ts'), 'utf8');
indexContent = indexContent.replace(
  "import { TaskGraphWidget } from './TaskGraphWidget';",
  "import { TaskGraphWidget } from './TaskGraphWidget';\nimport { LiveExecutionTimelineWidget } from './LiveExecutionTimelineWidget';\nimport { ToolInvocationExplorerWidget } from './ToolInvocationExplorerWidget';"
);
fs.writeFileSync(path.join(swarmUiSrc, 'index.ts'), indexContent);

console.log('M8 AgentOps Scaffolded Successfully');
