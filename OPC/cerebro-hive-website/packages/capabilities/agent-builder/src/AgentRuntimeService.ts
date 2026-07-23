import { AgentExecutionContext } from '@cerebro/domain';
import { ToolRuntime } from './tools/ToolRuntime';
// Note: In reality, we would inject AIService, Telemetry, and DB repositories here.

export class AgentRuntimeService {
  constructor(private toolRuntime: ToolRuntime) {}

  /**
   * The core execution loop of the Agent Runtime.
   * Based on the Phase 6 architecture, this orchestrates the full lifecycle.
   */
  async execute(context: AgentExecutionContext, userInput: string): Promise<any> {
    // 1. Safety Layer (Input Validation, Prompt Injection Detection)
    this.validateSafety(userInput);

    // 2. Load Agent, Context, Memory (Already loaded into AgentExecutionContext by caller)
    let isComplete = false;
    let iterations = 0;
    const maxIterations = 10;
    
    const messages = [...context.memory.conversationHistory, { role: 'user', content: userInput }];

    // 3. The Execution Loop
    while (!isComplete && iterations < maxIterations) {
      iterations++;

      // a. Check Cancellation
      if (context.cancellationToken?.isCancellationRequested) {
        throw new Error('Agent execution was cancelled');
      }

      // b. AI Gateway / Model Invocation (Planner)
      // Mocking LLM decision
      const llmResponse = await this.invokeModel(context, messages);

      // c. Check if Tool Execution is Needed
      if (llmResponse.needsTool) {
        messages.push({ role: 'assistant', content: 'Calling tool: ' + llmResponse.toolName, toolCalls: [llmResponse] });
        
        // d. Tool Runtime Execution
        const toolResult = await this.toolRuntime.executeTool(
          llmResponse.toolName, 
          llmResponse.toolArgs, 
          context
        );
        
        messages.push({ role: 'tool', content: JSON.stringify(toolResult) });

        // e. If async tool, we break the loop and return status
        if (toolResult.status === 'accepted' && toolResult.jobId) {
           return {
             status: 'suspended',
             reason: 'waiting_for_async_tool',
             jobId: toolResult.jobId,
             messages
           };
        }
      } else {
        // Final Answer
        messages.push({ role: 'assistant', content: llmResponse.content });
        isComplete = true;
      }
    }

    if (!isComplete) {
      throw new Error('Max iterations reached before completion.');
    }

    // 4. Persistence & Event Publishing handled by caller or decorators
    return {
      status: 'completed',
      messages
    };
  }

  private validateSafety(input: string) {
    // Scaffold: In reality, call a safety model or regex
    if (input.toLowerCase().includes('ignore all previous instructions')) {
      throw new Error('SafetyViolation: Potential prompt injection detected.');
    }
  }

  private async invokeModel(context: AgentExecutionContext, messages: any[]): Promise<any> {
    // Scaffold: In reality, this would call `@cerebro/ai-gateway`
    // We mock a tool call for demonstration if the user asks for a calculation
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    if (lastUserMessage?.content.includes('calculate')) {
      return {
        needsTool: true,
        toolName: 'calculator',
        toolArgs: { expression: '2+2' } // mock
      };
    }

    return {
      needsTool: false,
      content: `I am an agent (Version: ${context.agentVersionId}). I have processed your input.`
    };
  }
}
