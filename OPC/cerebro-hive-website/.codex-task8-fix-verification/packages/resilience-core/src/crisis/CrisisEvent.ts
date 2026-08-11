export interface CrisisEvent {
  crisisId: string;
  incidentId: string; // Ref to IT Service Management
  
  impactedServiceIds: string[];
  activatedPlanIds: string[];
  
  declaredAt: Date;
  resolvedAt?: Date;
  
  executiveNotificationsSent: boolean;
  lessonsLearned: string[];
}

export class CrisisManager {
  private crises = new Map<string, CrisisEvent>();

  declareCrisis(crisis: CrisisEvent) {
    this.crises.set(crisis.crisisId, crisis);
    console.log(`[CrisisManager] 🚨 CRISIS DECLARED: Incident ${crisis.incidentId}`);
    
    if (crisis.impactedServiceIds.length > 0) {
      console.log(`[CrisisManager] 📉 Impacted Services: ${crisis.impactedServiceIds.join(', ')}`);
    }
    
    if (crisis.activatedPlanIds.length > 0) {
      console.log(`[CrisisManager] 📜 Activating Resilience Plans: ${crisis.activatedPlanIds.join(', ')}`);
    }
  }

  resolveCrisis(crisisId: string, lessonsLearned: string[]) {
    const crisis = this.crises.get(crisisId);
    if (crisis) {
      crisis.resolvedAt = new Date();
      crisis.lessonsLearned = lessonsLearned;
      console.log(`[CrisisManager] ✅ Crisis ${crisisId} Resolved. Lessons captured.`);
    }
  }
}
