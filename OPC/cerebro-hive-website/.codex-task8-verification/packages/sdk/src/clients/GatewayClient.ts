export interface GatewayRequest {
  model: string;
  provider: string;
  systemPrompt: string;
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  temperature: number;
  maxTokens?: number;
  topP?: number;
  memoryContext?: string;
  tools?: any[];
}

export interface StreamChunk {
  id: string;
  text: string;
  isDone: boolean;
  metadata?: any;
}

export class GatewayClient {
  constructor(private baseUrl: string, private headers?: Record<string, string>) {}

  /**
   * Simulates a streaming completion using an async generator.
   */
  async *streamCompletion(request: GatewayRequest): AsyncGenerator<StreamChunk, void, unknown> {
    const mockResponseText = "This is a simulated response from the AI Gateway.\n\nIt streams back in chunks, simulating real latency and network behavior. \n\n" + 
      "The Gateway Assembly Engine received your prompt with the following configuration:\n" +
      `- Model: ${request.model}\n` +
      `- Provider: ${request.provider}\n` +
      `- Temperature: ${request.temperature}\n` +
      (request.memoryContext ? `- Memory Injected: Yes\n` : `- Memory Injected: No\n`);

    const words = mockResponseText.split(' ');
    
    // Simulate initial latency
    await new Promise(resolve => setTimeout(resolve, 600));

    for (let i = 0; i < words.length; i++) {
      // Simulate chunk latency
      await new Promise(resolve => setTimeout(resolve, 50));
      
      yield {
        id: `chunk-${i}`,
        text: words[i] + ' ',
        isDone: i === words.length - 1,
        metadata: i === words.length - 1 ? {
          evaluations: { safety: 0.99, quality: 0.95 },
          tokens: { prompt: 150, completion: words.length, total: 150 + words.length },
          cost: 0.002
        } : undefined
      };
    }
  }

  async evaluatePrompt(request: any) {
    return {
      safety: 0.99,
      grounding: 0.95,
      quality: 0.90
    };
  }
}
