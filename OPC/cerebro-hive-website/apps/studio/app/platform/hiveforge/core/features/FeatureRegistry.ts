import { FeatureFlag, FeatureRegistryContext, FeatureStage } from "../contracts/features";
import { eventBus } from "../events/EventBus";

export class FeatureRegistry implements FeatureRegistryContext {
  private features: Map<string, FeatureFlag> = new Map();
  
  registerFeature(feature: FeatureFlag): void {
    if (this.features.has(feature.id)) {
      console.warn(`[FeatureRegistry] Overwriting feature flag: ${feature.id}`);
    }
    this.features.set(feature.id, feature);
    
    eventBus.publish({
      category: "TelemetryLifecycle",
      type: "FeatureRegistered",
      source: "FeatureRegistry",
      payload: { id: feature.id, stage: feature.stage }
    });
  }

  getFeature(id: string): FeatureFlag | undefined {
    return this.features.get(id);
  }

  isFeatureEnabled(id: string, workspaceId?: string): boolean {
    const feature = this.features.get(id);
    if (!feature) return false;
    
    // Default logic (to be expanded with actual workspace context later)
    return feature.isEnabledDefault;
  }
}

export const featureRegistry = new FeatureRegistry();
