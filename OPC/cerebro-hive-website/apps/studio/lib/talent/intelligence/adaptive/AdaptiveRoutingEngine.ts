import { AssessmentSchema, AssessmentSection } from '../../types';

export interface AdaptiveRoutingContext {
  candidateId: string;
  assessmentId: string;
  currentSectionIndex: number;
  sectionScores: number[]; // Scores out of 100 for each completed section
}

export class AdaptiveRoutingEngine {
  
  /**
   * Determines the next Section to serve the candidate based on their performance so far.
   * Modifies the remaining Schema dynamically.
   * 
   * As per strategic design: Adaptation happens BETWEEN sections, not between individual widgets.
   * This provides a smoother experience and prevents erratic difficulty spikes.
   */
  async determineNextSection(
    schema: AssessmentSchema, 
    context: AdaptiveRoutingContext
  ): Promise<AssessmentSection | null> {
    
    console.log(`[Adaptive Engine] Evaluating routing for Candidate ${context.candidateId}`);
    
    if (context.currentSectionIndex >= schema.sections.length - 1) {
      console.log(`[Adaptive Engine] Assessment complete. No further sections.`);
      return null;
    }

    const nextSectionRaw = schema.sections[context.currentSectionIndex + 1];

    // If the candidate scored exceptionally well on the previous section (e.g. >= 90),
    // and the schema defines an "advanced" variant for the next section, swap it in.
    const lastScore = context.sectionScores[context.currentSectionIndex] || 0;

    if (lastScore >= 90) {
      console.log(`[Adaptive Engine] Candidate scored ${lastScore}. Routing to ADVANCED branch.`);
      // In a real schema, sections would have 'variants' or 'difficulty' metadata.
      // We would mutate nextSectionRaw to pull from an advanced pool.
      nextSectionRaw.title = nextSectionRaw.title + " (Advanced)";
    } else if (lastScore < 50) {
      console.log(`[Adaptive Engine] Candidate scored ${lastScore}. Routing to FUNDAMENTAL branch.`);
      nextSectionRaw.title = nextSectionRaw.title + " (Fundamental)";
    }

    return nextSectionRaw;
  }
}
