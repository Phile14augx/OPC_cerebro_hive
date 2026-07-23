export interface AssemblyContext {
  systemPrompt: string;
  persona: string;
  policies: string[];
  memoryContext: string[];
  knowledgeContext: string[];
  conversationHistory: any[];
  toolDefinitions: any[];
  executionConstraints: string[];
  userPrompt: string;
}

export class PromptAssemblyEngine {
  assemble(context: AssemblyContext): any[] {
    const messages = [];

    // 1. Build System Message (Composable Stages)
    let systemContent = `${context.systemPrompt}\n\n`;
    
    if (context.persona) {
      systemContent += `## Persona\n${context.persona}\n\n`;
    }

    if (context.policies.length > 0) {
      systemContent += `## Policies\n${context.policies.join('\n')}\n\n`;
    }

    if (context.executionConstraints.length > 0) {
      systemContent += `## Constraints\n${context.executionConstraints.join('\n')}\n\n`;
    }

    if (context.knowledgeContext.length > 0) {
      systemContent += `## Knowledge Base\n${context.knowledgeContext.join('\n')}\n\n`;
    }

    if (context.memoryContext.length > 0) {
      systemContent += `## Relevant Memory\n${context.memoryContext.join('\n')}\n\n`;
    }

    messages.push({ role: 'system', content: systemContent.trim() });

    // 2. Conversation History
    for (const msg of context.conversationHistory) {
      messages.push(msg);
    }

    // 3. User Prompt
    messages.push({ role: 'user', content: context.userPrompt });

    return messages;
  }
}
