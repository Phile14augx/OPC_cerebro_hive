import { DigitalTwinEngine } from '../engine/DigitalTwinEngine';
import { FailurePropagator } from '../engine/FailurePropagator';
import { KnowledgeGraphPort } from '../../../knowledge-graph-core/src/index';
import { SimulationResult } from '../domain/SimulationResult';


export class SimulationAnalyst {
  constructor(private readonly canonicalGraph: KnowledgeGraphPort) {}

  async ask(question: string): Promise<string> {
    console.log(`\n[Analyst] Translating intent: "${question}"`);
    
    // Simulate natural language translation to scenario
    let targetProviderId = '';
    if (question.includes('Azure OpenAI')) {
      targetProviderId = 'prv-azure-openai';
      console.log(`[Analyst] Plan: Construct NodeFailure scenario for '${targetProviderId}'`);
    } else {
      return '[Analyst] Unable to construct simulation scenario from intent.';
    }

    // 1. Initialize Sandbox Overlay
    const twin = new DigitalTwinEngine(this.canonicalGraph);
    const propagator = new FailurePropagator(twin);

    // 2. Execute Failure Scenario within Sandbox
    const failures = await propagator.simulateNodeFailure(targetProviderId);
    
    // 3. Build Result
    const result: SimulationResult = {
      scenarioId: `sim-failure-${Date.now()}`,
      impactedCapabilities: failures.filter(f => f.kind === 'BusinessCapability'),
      cascadingFailures: failures,
      policyViolations: [],
      criticalPath: [],
      confidenceLevel: 'High',
      estimatedDegradation: 'Severe'
    };

    // 4. Summarize (Orchestrator)
    return this.summarize(result);
  }

  private summarize(result: SimulationResult): string {
    if (result.cascadingFailures.length === 0) return '[Analyst] No impact detected in simulation.';
    
    const impacts = result.cascadingFailures.map(f => `- [${f.kind}] ${f.properties.name || f.id}`).join('\n');
    
    return `[Analyst Executive Summary]
Simulation completed with ${result.confidenceLevel} confidence.
Estimated Degradation: ${result.estimatedDegradation}

Cascading Failures Detected:
${impacts}

Recommendation: Review redundancy architecture for the above services.`;
  }
}
