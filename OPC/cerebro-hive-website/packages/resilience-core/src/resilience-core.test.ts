import { describe, expect, it, vi } from 'vitest';
import {
  BiaRegistry,
  DependencyGraph,
  ResilienceAnalyzer,
  type BusinessService,
} from './index';

function service(requiredRtoHours: number): BusinessService {
  return {
    serviceId: 'checkout',
    name: 'Checkout',
    description: 'Processes customer orders',
    owner: 'commerce',
    bia: {
      biaId: 'bia-checkout',
      serviceId: 'checkout',
      criticality: 'MissionCritical',
      requiredRtoHours,
      requiredRpoHours: 1,
      maximumTolerableDowntimeHours: 12,
      financialImpact: 'Revenue interruption',
      regulatoryImpact: 'None',
      customerImpact: 'Orders unavailable',
      lastReviewedAt: new Date('2026-01-01T00:00:00.000Z'),
    },
    resilienceViolations: [],
  };
}

describe('ResilienceAnalyzer', () => {
  it('propagates the slowest downstream RTO and reports a business RTO breach', () => {
    const graph = new DependencyGraph();
    graph.addNode({ nodeId: 'checkout', name: 'Checkout', type: 'BusinessService', statedRtoHours: 1 });
    graph.addNode({ nodeId: 'orders-api', name: 'Orders API', type: 'Application', statedRtoHours: 2 });
    graph.addNode({ nodeId: 'orders-db', name: 'Orders DB', type: 'Database', statedRtoHours: 8 });
    graph.addDependency('checkout', 'orders-api', 'Application');
    graph.addDependency('orders-api', 'orders-db', 'Database');

    const registry = new BiaRegistry();
    const checkout = service(4);
    registry.registerService(checkout);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    new ResilienceAnalyzer(graph, registry).analyzeService('checkout');

    expect(checkout.effectiveRtoHours).toBe(8);
    expect(checkout.resilienceViolations).toEqual([
      'RTO Violation: Required RTO is 4h, but Effective RTO is 8h due to downstream dependencies.',
    ]);
  });

  it('identifies a direct single-database dependency as a single point of failure', () => {
    const graph = new DependencyGraph();
    graph.addNode({ nodeId: 'checkout', name: 'Checkout', type: 'BusinessService', statedRtoHours: 1 });
    graph.addNode({ nodeId: 'orders-db', name: 'Orders DB', type: 'Database', statedRtoHours: 2 });
    graph.addDependency('checkout', 'orders-db', 'Database');

    const registry = new BiaRegistry();
    const checkout = service(4);
    registry.registerService(checkout);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);

    new ResilienceAnalyzer(graph, registry).analyzeService('checkout');

    expect(checkout.effectiveRtoHours).toBe(2);
    expect(checkout.resilienceViolations).toEqual([
      "SPOF Detected: Relies on single database 'Orders DB' with no redundancy.",
    ]);
  });
});
