import { AgentExecutionContext } from '@cerebro/domain';

export interface CompiledMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export interface CompiledPrompt {
  messages: CompiledMessage[];
}

export class PromptCompiler {
  /**
   * Compiles the system prompt, agent persona, instructions, memory,
   * knowledge, conversation history, and current user message into a single Prompt.
   */
  compile(context: AgentExecutionContext, userMessage: string): CompiledPrompt {
    const messages: CompiledMessage[] = [];

    // 1. System Prompt / Agent Persona
    if (context.agent.systemPrompt) {
      messages.push({
        role: 'system',
        content: `[Agent Version]: ${context.version?.version || 'latest'}\n\n${context.agent.systemPrompt}`
      });
    }

    // 2. Memory / Knowledge context (RAG/Citations later)
    if (context.memory.workingMemory && Object.keys(context.memory.workingMemory).length > 0) {
      messages.push({
        role: 'system',
        content: `[Working Memory]:\n${JSON.stringify(context.memory.workingMemory, null, 2)}`
      });
    }

    // 3. Conversation History
    if (context.memory.conversationHistory && context.memory.conversationHistory.length > 0) {
      for (const msg of context.memory.conversationHistory) {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    // 4. Current User Message
    messages.push({
      role: 'user',
      content: userMessage
    });

    return { messages };
  }
}
