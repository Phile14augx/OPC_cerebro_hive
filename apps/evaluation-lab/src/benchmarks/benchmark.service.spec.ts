import { BenchmarkRegistryService, EvalResult } from './benchmark.service';
import { NotFoundException } from '@nestjs/common';

describe('BenchmarkRegistryService', () => {
  let service: BenchmarkRegistryService;

  beforeEach(() => {
    service = new BenchmarkRegistryService();
  });

  it('should register and retrieve a benchmark suite', () => {
    const suite = service.registerBenchmarkSuite('Test Suite', 'MODEL', 'ds_test', ['accuracy'], [{ metric: 'accuracy', operator: '>=', value: 0.8 }]);
    expect(suite.id).toMatch(/^bench_/);
    
    const retrieved = service.getBenchmarkById(suite.id);
    expect(retrieved).toEqual(suite);
  });

  it('should list all benchmarks', () => {
    service.registerBenchmarkSuite('Suite 1', 'MODEL', 'ds1', [], []);
    service.registerBenchmarkSuite('Suite 2', 'MODEL', 'ds2', [], []);
    const list = service.listBenchmarks();
    expect(list.length).toBe(2);
  });

  it('should validate EvalResult correctly - pass case', () => {
    const suite = service.registerBenchmarkSuite('Test Suite', 'MODEL', 'ds_test', ['accuracy'], [{ metric: 'accuracy', operator: '>=', value: 0.8 }]);
    const evalResult: EvalResult = { metrics: { accuracy: 0.9 } };
    
    const result = service.validateEvalResult(evalResult, suite.id);
    expect(result.passed).toBe(true);
    expect(result.failures.length).toBe(0);
  });

  it('should validate EvalResult correctly - fail case', () => {
    const suite = service.registerBenchmarkSuite('Test Suite', 'MODEL', 'ds_test', ['accuracy'], [{ metric: 'accuracy', operator: '>=', value: 0.8 }]);
    const evalResult: EvalResult = { metrics: { accuracy: 0.7 } };
    
    const result = service.validateEvalResult(evalResult, suite.id);
    expect(result.passed).toBe(false);
    expect(result.failures.length).toBe(1);
    expect(result.failures[0]).toContain('failed threshold >= 0.8');
  });

  it('should throw NotFoundException for unknown benchmark', () => {
    expect(() => service.getBenchmarkById('unknown')).toThrow(NotFoundException);
  });
});
