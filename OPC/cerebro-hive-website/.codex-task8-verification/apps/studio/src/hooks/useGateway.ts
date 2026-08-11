import { useRef } from 'react';
import { GatewayClient } from '@cerebro/sdk';
import { usePlaygroundStore } from '../store/usePlaygroundStore';
import { v4 as uuidv4 } from 'uuid';

const gatewayClient = new GatewayClient('http://localhost:3000');

export function useGatewayStream() {
  const store = usePlaygroundStore();
  const cancelRef = useRef<boolean>(false);

  const runStream = async (userMessageContent: string) => {
    cancelRef.current = false;
    store.setIsStreaming(true);

    const userMessageId = uuidv4();
    store.addMessage({ id: userMessageId, role: 'user', content: userMessageContent });

    const assistantMessageId = uuidv4();
    store.addMessage({ id: assistantMessageId, role: 'assistant', content: '' });

    const request = {
      model: store.selectedModel,
      provider: store.provider,
      systemPrompt: store.systemPrompt,
      temperature: store.temperature,
      maxTokens: store.maxTokens,
      topP: store.topP,
      memoryContext: store.useWorkingMemory || store.useConversationMemory || store.useSemanticMemory ? 'Enabled' : undefined,
      messages: [...store.messages, { role: 'user' as const, content: userMessageContent }],
    };

    try {
      const stream = gatewayClient.streamCompletion(request);
      for await (const chunk of stream) {
        if (cancelRef.current) break;
        store.updateLastMessage(chunk.text);
        if (chunk.isDone && chunk.metadata) {
          store.setEvaluation(chunk.metadata.evaluations);
          store.setTokenUsage(chunk.metadata.tokens);
        }
      }
    } catch (err) {
      console.error('Streaming failed:', err);
      store.updateLastMessage('\n[Error: Stream interrupted]');
    } finally {
      store.setIsStreaming(false);
    }
  };

  const cancelStream = () => {
    cancelRef.current = true;
    store.setIsStreaming(false);
  };

  return { runStream, cancelStream };
}
