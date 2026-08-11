import { IdentityTimeline } from '../timeline/IdentityTimeline';

export interface PolicyRecommendation {
  id: string;
  principalId: string;
  type: 'LeastPrivilege' | 'PolicyExpansion' | 'EntitlementRemoval';
  description: string;
  confidenceScore: number; // 1-100
  suggestedAction: string;
}

export class RecommendationEngine {
  /**
   * Analyzes an identity's timeline to suggest policy or entitlement changes.
   */
  generateRecommendations(timeline: IdentityTimeline, currentEntitlements: string[]): PolicyRecommendation[] {
    const recommendations: PolicyRecommendation[] = [];
    
    // Example 1: Least Privilege (Entitlement Removal)
    // In a real implementation, we would cross-reference the capabilities granted by the currentEntitlements
    // with the actual capabilities used in the timeline.
    
    const usedCapabilities = new Set(
      timeline.events
        .filter(e => e.eventType === 'CapabilityAccessed' && e.metadata.capability)
        .map(e => e.metadata.capability)
    );

    // Mock scenario: user has 'ent-sysadmin' but never used admin capabilities
    if (currentEntitlements.includes('ent-sysadmin') && !usedCapabilities.has('system:admin')) {
      recommendations.push({
        id: `rec-${Date.now()}-1`,
        principalId: timeline.principalId,
        type: 'LeastPrivilege',
        description: 'Principal holds "System Administrator" entitlement but has not utilized admin capabilities in the observed window.',
        confidenceScore: 85,
        suggestedAction: 'Revoke entitlement "ent-sysadmin"'
      });
    }

    // Example 2: Policy Expansion (Too many denies for a specific resource, followed by JITs)
    const denies = timeline.getEventsByType('PolicyDeny');
    if (denies.length > 20) {
      recommendations.push({
        id: `rec-${Date.now()}-2`,
        principalId: timeline.principalId,
        type: 'PolicyExpansion',
        description: 'Principal experiences high friction (denies) for requested resources.',
        confidenceScore: 60,
        suggestedAction: 'Review base roles to determine if a permanent entitlement should be granted.'
      });
    }

    return recommendations;
  }
}
