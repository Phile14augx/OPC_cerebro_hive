import { describe, it, expect, beforeEach } from 'vitest';
import { PipelineService, PipelineDefinition } from '../../src/execution/pipeline.service';

describe('PipelineService Integration', () => {
  let service: PipelineService;
  beforeEach(() => { service = new PipelineService(); });

  it('should accept a valid acyclic DAG and execute', async () => {
    const dag: PipelineDefinition = { 
      steps: [
        { name: 'a', dependsOn: [] }, 
        { name: 'b', dependsOn: ['a'] }
      ] 
    };
    
    // validateDAG doesn't return anything but shouldn't throw
    expect(() => service.validateDAG(dag)).not.toThrow();
    
    const result = await service.executePipeline(dag);
    expect(result).toBeDefined();
    expect(result).toEqual(['a', 'b']);
  });

  it('should reject a cyclic DAG', async () => {
    const dag: PipelineDefinition = { 
      steps: [
        { name: 'a', dependsOn: ['b'] }, 
        { name: 'b', dependsOn: ['a'] }
      ] 
    };
    
    expect(() => service.validateDAG(dag)).toThrow('Cycle detected at node');
    await expect(service.executePipeline(dag)).rejects.toThrow('Cycle detected at node');
  });
});
