import { DecisionScenario } from '../domain/DecisionScenario';
import { DigitalTwinEngine } from '../../../simulation-core/src/index';
import { KnowledgeGraphPort, ReasoningEngine, GraphAlgorithms } from '../../../knowledge-graph-core/src/index';

export class PortfolioSimulator {
  constructor(private readonly canonicalGraph: KnowledgeGraphPort) {}

  public async simulateScenario(scenario: DecisionScenario): Promise<DecisionScenario> {
    console.log(`[PortfolioSimulator] Simulating portfolio impact of '${scenario.name}'...`);
    const twin = new DigitalTwinEngine(this.canonicalGraph);
    const reasoning = new ReasoningEngine(twin, new GraphAlgorithms(twin));

    // 1. Apply proposed changes to the sandbox
    for (const edgeId of scenario.proposedSeverances) {
      await twin.removeEdge(edgeId);
    }
    for (const node of scenario.proposedInjections) {
      await twin.addNode(node);
    }
    for (const edge of scenario.proposedDependencies) {
      await twin.addEdge(edge);
    }

    // 2. Run enterprise-wide reasoning on the virtual future state
    const aiMissionCriticalStatus = await reasoning.evaluateMissionCriticalAI();

    // 3. Assign Mock metrics based on the simulation state
    // In a real system, we would calculate actual topological resilience, FinOps integrations, etc.
    // Here we generate metrics that reflect the hypothetical scenario outcome
    const hasViolations = aiMissionCriticalStatus.violations.length > 0;
    
    // Simplistic heuristic for simulation outcomes
    const isLocal = scenario.proposedInjections.some(n => (n.properties.name as string)?.includes('Local'));
    
    scenario.metrics = {
      AvailabilityScore: isLocal ? 0.95 : 0.85, 
      ComplianceScore: hasViolations ? 0.2 : 0.99,
      PerformanceScore: isLocal ? 0.80 : 0.95,
      CostScore: isLocal ? 0.20 : 0.80, // Lower cost for local
      RecoveryTimeScore: isLocal ? 0.40 : 0.60,
      BlastRadiusScore: isLocal ? 0.20 : 0.70 // Local has smaller blast radius (less reliance on internet)
    };

    return scenario;
  }
}
