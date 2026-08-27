import { BenchmarkRegistryService } from '../../src/benchmarks/benchmark.service';

describe('BenchmarkRegistryService Integration', () => {
  let service: BenchmarkRegistryService;
  beforeEach(() => { service = new BenchmarkRegistryService(); });

  it('should register and retrieve a benchmark', async () => {
    const benchmark = service.registerBenchmarkSuite('test-bench', 'CLASSIFICATION', 'ds-1', ['accuracy'], [{ metric: 'accuracy', operator: '>', value: 0.8 }]);
    const retrieved = service.getBenchmarkById(benchmark.id);
    expect(retrieved).toBeDefined();
    expect(retrieved.name).toEqual('test-bench');
  });

  it('should correctly flag a result that fails threshold', async () => {
    const bm = service.registerBenchmarkSuite('strict-bench', 'CLASSIFICATION', 'ds-1', ['accuracy'], [{ metric: 'accuracy', operator: '>', value: 0.9 }]);
    const pass = service.validateEvalResult({ metrics: { accuracy: 0.75 } }, bm.id);
    expect(pass.passed).toBe(false);
    expect(pass.failures.length).toBeGreaterThan(0);
  });
});
