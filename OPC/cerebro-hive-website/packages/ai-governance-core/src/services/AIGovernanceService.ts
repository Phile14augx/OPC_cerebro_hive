import { AIModel, ModelStatus } from '../domain/AIModel';
import { AIEvaluation } from '../domain/AIEvaluation';
import { ModelCard } from '../domain/ModelCard';
import { AIRegistry } from '../registry/AIRegistry';
import { AssetProvider, ChangeProvider, PolicyProvider } from '../integrations/Providers';
import { AIGovernanceEventType, AIGovernanceEvent } from '../events/AIGovernanceEvents';

export class AIGovernanceService {
  private events: AIGovernanceEvent[] = [];

  constructor(
    private readonly registry: AIRegistry,
    private readonly assetProvider: AssetProvider,
    private readonly changeProvider: ChangeProvider,
    private readonly policyProvider: PolicyProvider
  ) {}

  private emitEvent(eventType: AIGovernanceEventType, assetId: string, payload: any = {}) {
    this.events.push({
      eventId: `evt-${Date.now()}`,
      eventType,
      assetId,
      timestamp: new Date(),
      payload
    });
    console.log(`[Event] ${eventType} for Asset ${assetId}`);
  }

  async registerModel(model: AIModel): Promise<void> {
    // Composition: Link to CMDB
    model.cmdbConfigurationItemId = await this.assetProvider.linkAssetToCMDB(model.modelId, 'AIModel');
    model.status = ModelStatus.Draft;
    await this.registry.registerModel(model);
    this.emitEvent(AIGovernanceEventType.ModelRegistered, model.modelId);
  }

  async evaluateModel(evaluation: AIEvaluation): Promise<void> {
    const model = await this.registry.getModel(evaluation.modelId);
    if (!model) throw new Error('Model not found');
    
    model.status = ModelStatus.InEvaluation;
    await this.registry.registerEvaluation(evaluation);
    this.emitEvent(AIGovernanceEventType.EvaluationCompleted, evaluation.modelId, { evaluationId: evaluation.evaluationId });
  }

  async generateModelCard(modelId: string): Promise<ModelCard> {
    const evals = await this.registry.getEvaluationsForModel(modelId);
    const passed = evals.every(e => e.passed);
    
    return {
      modelCardId: `mc-${modelId}`,
      modelId,
      intendedUse: ['Determined via Policy'],
      prohibitedUse: ['Determined via Policy'],
      supportedJurisdictions: ['Global'],
      regulatoryObligations: [],
      evaluationSummary: `Evaluations Pass Rate: ${passed ? '100%' : 'Failed'}`,
      deploymentHistoryIds: [],
      approvalChainIds: [],
      linkedRiskIds: [],
      linkedControlIds: [],
      changeHistoryIds: [],
      generatedAt: new Date()
    };
  }

  async requestDeployment(modelId: string): Promise<string> {
    const model = await this.registry.getModel(modelId);
    if (!model) throw new Error('Model not found');

    const evals = await this.registry.getEvaluationsForModel(modelId);
    const avgCorrectness = evals.reduce((sum, e) => sum + (e.metrics.correctnessScore || 0), 0) / (evals.length || 1);

    const isPolicyCompliant = await this.policyProvider.validateDeploymentPolicy(modelId, avgCorrectness);
    if (!isPolicyCompliant) {
      this.emitEvent(AIGovernanceEventType.DeploymentRejected, modelId, { reason: 'Policy Validation Failed' });
      throw new Error('Model failed policy validation for deployment.');
    }

    const changeRequestId = await this.changeProvider.requestDeploymentChange(modelId, `Deploy AI Model ${model.name}`);
    model.status = ModelStatus.Approved;
    
    this.emitEvent(AIGovernanceEventType.DeploymentRequested, modelId, { changeRequestId });
    return changeRequestId;
  }
}
