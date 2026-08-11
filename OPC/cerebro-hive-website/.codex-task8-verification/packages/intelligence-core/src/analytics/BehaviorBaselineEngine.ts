import { IdentityTimeline } from '../timeline/IdentityTimeline';

export interface BehaviorBaseline {
  commonLocations: Set<string>;
  typicalActiveHours: Set<number>; // 0-23
  frequentCapabilities: Set<string>;
}

export class BehaviorBaselineEngine {
  /**
   * Analyzes an identity's historical timeline to establish a "normal" baseline.
   */
  calculateBaseline(timeline: IdentityTimeline): BehaviorBaseline {
    const locations = new Set<string>();
    const activeHours = new Set<number>();
    const capabilities = new Set<string>();

    for (const event of timeline.events) {
      if (event.metadata.location) locations.add(event.metadata.location);
      if (event.metadata.capability) capabilities.add(event.metadata.capability);
      activeHours.add(event.timestamp.getHours());
    }

    return {
      commonLocations: locations,
      typicalActiveHours: activeHours,
      frequentCapabilities: capabilities
    };
  }

  /**
   * Evaluates if a new event deviates from the established baseline.
   */
  evaluateAnomaly(baseline: BehaviorBaseline, event: any): string[] {
    const anomalies: string[] = [];

    if (event.metadata.location && !baseline.commonLocations.has(event.metadata.location)) {
      anomalies.push('Unusual Location');
    }

    const hour = new Date(event.timestamp).getHours();
    if (!baseline.typicalActiveHours.has(hour)) {
      anomalies.push('Unusual Time of Day');
    }

    if (event.metadata.capability && !baseline.frequentCapabilities.has(event.metadata.capability)) {
      anomalies.push('Unusual Capability Accessed');
    }

    return anomalies;
  }
}
