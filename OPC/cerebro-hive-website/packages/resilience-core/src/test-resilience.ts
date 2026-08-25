import { BiaRegistry, BusinessService, BusinessImpactAnalysis } from './bia/BusinessImpactAnalysis';
import { DependencyGraph } from './dependency/DependencyGraph';
import { ResilienceAnalyzer } from './analyzer/ResilienceAnalyzer';
import { ResiliencePlanner, ResilienceExercise } from './planning/ResiliencePlanning';
import { CrisisManager, CrisisEvent } from './crisis/CrisisEvent';

async function runResilienceTest() {
  console.log('--- Starting Business Continuity & Operational Resilience Test ---');

  const biaRegistry = new BiaRegistry();
  const graph = new DependencyGraph();
  const analyzer = new ResilienceAnalyzer(graph, biaRegistry);
  const planner = new ResiliencePlanner();
  const crisisManager = new CrisisManager();

  // 1. Define Business Service & BIA
  const checkoutBia: BusinessImpactAnalysis = {
    biaId: 'bia-checkout-2026',
    serviceId: 'svc-checkout',
    criticality: 'MissionCritical',
    requiredRtoHours: 2, // Must recover in 2 hours
    requiredRpoHours: 1,
    maximumTolerableDowntimeHours: 4,
    financialImpact: 'High ($100k/hr)',
    regulatoryImpact: 'Low',
    customerImpact: 'Critical',
    lastReviewedAt: new Date()
  };

  const checkoutService: BusinessService = {
    serviceId: 'svc-checkout',
    name: 'Customer Checkout',
    description: 'Processes online orders',
    owner: 'E-commerce Team',
    bia: checkoutBia,
    resilienceViolations: []
  };
  biaRegistry.registerService(checkoutService);
  
  // Root node in Dependency Graph
  graph.addNode({ nodeId: 'svc-checkout', name: 'Customer Checkout', type: 'BusinessService', statedRtoHours: 1 });

  // 2. Map Dependencies
  console.log('\n[Dependency Graph] Mapping checkout dependencies...');
  
  // API Layer
  graph.addNode({ nodeId: 'app-payment-api', name: 'Payment API', type: 'Application', statedRtoHours: 1 });
  graph.addDependency('svc-checkout', 'app-payment-api', 'Application');
  
  // Database Layer (Uh oh, stated RTO is 12 hours)
  graph.addNode({ nodeId: 'db-orders', name: 'Orders DB', type: 'Database', statedRtoHours: 12 });
  graph.addDependency('app-payment-api', 'db-orders', 'Database');

  // Vendor Layer
  graph.addNode({ nodeId: 'vendor-stripe', name: 'Stripe Gateway', type: 'Vendor', statedRtoHours: 1 });
  graph.addDependency('app-payment-api', 'vendor-stripe', 'Vendor');

  // 3. Analyze Resilience (Constraint Validation & SPOF)
  console.log('\n[Resilience Analyzer] Validating constraints for Customer Checkout...');
  analyzer.analyzeService('svc-checkout');
  
  const analyzedService = biaRegistry.getService('svc-checkout');
  console.log(`   Effective RTO Calculated: ${analyzedService?.effectiveRtoHours} hours`);
  if (analyzedService?.resilienceViolations.length) {
    analyzedService.resilienceViolations.forEach(v => console.log(`   * ${v}`));
  }

  // 4. Resilience Exercise & Risk Escalation
  console.log('\n[Resilience Exercise] Conducting Failover Drill...');
  const drill: ResilienceExercise = {
    exerciseId: 'ex-dr-2026-q3',
    planId: 'bcp-checkout-001',
    type: 'FailoverDrill',
    conductedAt: new Date(),
    success: false,
    findings: [
      {
        description: 'Orders DB took 12 hours to recover from backup. Missed 2-hour RTO.',
        recommendation: 'Implement Active-Active replication for Orders DB.',
        generatedRiskId: 'risk-checkout-rto-failure' // Feeds into Phase 10.5 Risk Register
      }
    ]
  };
  planner.recordExercise(drill);

  // 5. Crisis Event
  console.log('\n[Crisis Management] Simulating a major operational incident...');
  const crisis: CrisisEvent = {
    crisisId: 'crisis-aws-us-east-outage',
    incidentId: 'INC-998822',
    impactedServiceIds: ['svc-checkout'],
    activatedPlanIds: ['drp-aws-failover'],
    declaredAt: new Date(),
    executiveNotificationsSent: true,
    lessonsLearned: []
  };
  crisisManager.declareCrisis(crisis);
  crisisManager.resolveCrisis(crisis.crisisId, ['Need faster cross-region DB sync.']);

}

runResilienceTest().catch(console.error);
