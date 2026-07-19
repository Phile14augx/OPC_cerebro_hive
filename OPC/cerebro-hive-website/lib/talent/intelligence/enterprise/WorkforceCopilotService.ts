import { AIProviderRegistry } from '../../infrastructure/ai/IAICapabilityProvider';

const aiRegistry = new AIProviderRegistry();

export type CopilotPersona = "EXECUTIVE" | "HR" | "ENGINEERING_MANAGER" | "LEARNING_DEVELOPMENT";

export class WorkforceCopilotService {
  
  /**
   * Generates insights based on the persona querying the Skill Graph.
   * Executive asks for workforce risk, HR asks for candidate fit, EM asks for team strengths, L&D asks for gaps.
   */
  async generatePersonaInsight(persona: CopilotPersona, contextGraphId: string, query: string) {
    console.log(`[Workforce Copilot] Handling query for ${persona} on graph ${contextGraphId}`);
    
    // 1. Fetch the relevant graph boundaries depending on persona
    // (e.g. Org level for Exec, Team level for EM)
    const contextData = { note: "Mock aggregated graph data" };

    // 2. Select AI capability
    const reasoner = aiRegistry.getReviewer();

    // 3. Inject persona-specific system prompts
    let systemPrompt = "";
    switch (persona) {
      case "EXECUTIVE":
        systemPrompt = "You are an Executive Workforce Copilot. Focus on hiring forecasts, budget planning, and org-wide skill risks.";
        break;
      case "HR":
        systemPrompt = "You are an HR Copilot. Focus on internal mobility, candidate fit, and succession pipelines.";
        break;
      case "ENGINEERING_MANAGER":
        systemPrompt = "You are an Engineering Manager Copilot. Focus on team delivery risks, missing expertise, and promotion readiness.";
        break;
      case "LEARNING_DEVELOPMENT":
        systemPrompt = "You are an L&D Copilot. Focus on certification gaps and training recommendations.";
        break;
    }

    const result = await reasoner.executeCapability({
      prompt: `${systemPrompt}\n\nQuery: ${query}`,
      code: JSON.stringify(contextData),
      rubricId: 'persona-default'
    });

    return {
      persona,
      insight: result.feedback,
      confidenceScore: 0.95
    };
  }
}
