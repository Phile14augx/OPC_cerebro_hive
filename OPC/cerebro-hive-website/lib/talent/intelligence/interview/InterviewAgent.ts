import { AIProviderRegistry } from '../../infrastructure/ai/IAICapabilityProvider';

const aiRegistry = new AIProviderRegistry();

export type InterviewState = 
  | "INTRODUCTION"
  | "CODE_DISCUSSION"
  | "DESIGN_QUESTIONS"
  | "SCENARIO_QUESTIONS"
  | "REFLECTION"
  | "SUMMARY"
  | "COMPLETED";

export interface InterviewContext {
  candidateId: string;
  assessmentId: string;
  currentState: InterviewState;
  transcript: { role: 'agent' | 'candidate', text: string }[];
  collectedEvidence: string[];
}

export class InterviewAgent {
  
  /**
   * Processes a candidate's message and returns the Agent's response.
   * Driven by a strict State Machine rather than a free-form LLM chat.
   */
  async processMessage(context: InterviewContext, candidateMessage: string): Promise<{ response: string, newState: InterviewState }> {
    context.transcript.push({ role: 'candidate', text: candidateMessage });
    
    console.log(`[Interview Agent] Processing message in state: ${context.currentState}`);

    let nextState = context.currentState;
    let agentResponse = "";

    // State Machine Transitions
    switch (context.currentState) {
      case "INTRODUCTION":
        // Simulated transition logic
        if (context.transcript.length >= 2) {
          nextState = "CODE_DISCUSSION";
          agentResponse = "Great to meet you. Let's look at the SQL query you wrote earlier. Can you explain why you chose a Window Function here instead of a GROUP BY?";
        } else {
          agentResponse = "Hello! I'm the Talent OS Interview Agent. Are you ready to begin our technical discussion?";
        }
        break;

      case "CODE_DISCUSSION":
        if (candidateMessage.toLowerCase().includes("performance") || context.transcript.length >= 6) {
          // If they successfully hit the evaluation criteria (talking about performance), transition to Design.
          // In a real implementation, we would use an LLM Capability (e.g., InterviewerCapability) to evaluate the response.
          nextState = "DESIGN_QUESTIONS";
          agentResponse = "That makes sense regarding performance. Let's move on. How would you design a system to cache those SQL results if the table had 10 million rows?";
          context.collectedEvidence.push("Demonstrated understanding of Window Function performance characteristics.");
        } else {
          agentResponse = "Could you elaborate a bit more on the performance implications of that choice?";
        }
        break;

      case "DESIGN_QUESTIONS":
        nextState = "COMPLETED";
        agentResponse = "Thank you! That concludes our technical discussion. Your recruiter will be in touch shortly.";
        break;
        
      default:
        nextState = "COMPLETED";
        agentResponse = "The interview has concluded.";
        break;
    }

    context.transcript.push({ role: 'agent', text: agentResponse });
    context.currentState = nextState;

    return { response: agentResponse, newState: nextState };
  }
}
