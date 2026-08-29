import { Test, TestingModule } from '@nestjs/testing';
import { PipelineService } from '../src/execution/pipeline.service';
import { BadRequestException } from '@nestjs/common';

describe('PipelineService', () => {
  let service: PipelineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PipelineService],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  it('should validate a valid DAG', () => {
    const def = {
      steps: [
        { name: 'A', dependsOn: [] },
        { name: 'B', dependsOn: ['A'] },
        { name: 'C', dependsOn: ['B'] },
      ]
    };
    expect(() => service.validateDAG(def)).not.toThrow();
  });

  it('should reject a cyclic DAG', () => {
    const def = {
      steps: [
        { name: 'A', dependsOn: ['C'] },
        { name: 'B', dependsOn: ['A'] },
        { name: 'C', dependsOn: ['B'] },
      ]
    };
    expect(() => service.validateDAG(def)).toThrow(BadRequestException);
  });

  it('should reject missing dependencies', () => {
    const def = {
      steps: [
        { name: 'A', dependsOn: ['Z'] },
      ]
    };
    expect(() => service.validateDAG(def)).toThrow(BadRequestException);
  });

  it('should execute pipeline in topological order', async () => {
    const def = {
      steps: [
        { name: 'C', dependsOn: ['A', 'B'] },
        { name: 'B', dependsOn: ['A'] },
        { name: 'A', dependsOn: [] },
      ]
    };
    const order = await service.executePipeline(def);
    expect(order).toEqual(['A', 'B', 'C']);
  });

  it('should throw if pipeline def has no steps', () => {
    expect(() => service.validateDAG({} as any)).toThrow(BadRequestException);
  });
});
