
export class ModelRegistry {
  resolveLogicalModel(logicalName: string): string {
    const mappings: Record<string, string[]> = {
      'enterprise-general': ['openai/gpt-4-turbo', 'anthropic/claude-3-sonnet'],
      'enterprise-fast': ['openai/gpt-3.5-turbo', 'anthropic/claude-3-haiku']
    };
    // Returns primary model in array
    return mappings[logicalName] ? mappings[logicalName][0] : logicalName;
  }
}
