import { create } from 'zustand';
import type { CompletionMetadata, EvaluationScores, TokenUsage } from '../hooks/gatewayMetadata';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: CompletionMetadata;
}

interface PlaygroundState {
  systemPrompt: string;
  selectedModel: string;
  provider: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  
  // Memory Toggles
  useWorkingMemory: boolean;
  useConversationMemory: boolean;
  useSemanticMemory: boolean;
  
  // Chat State
  messages: ChatMessage[];
  isStreaming: boolean;
  evaluation: EvaluationScores | null;
  tokenUsage: TokenUsage | null;
  
  // Actions
  setSystemPrompt: (prompt: string) => void;
  setModelConfig: (config: Partial<PlaygroundState>) => void;
  setMemoryToggle: (key: 'useWorkingMemory' | 'useConversationMemory' | 'useSemanticMemory', value: boolean) => void;
  
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string, metadata?: CompletionMetadata) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setEvaluation: (evaluation: EvaluationScores) => void;
  setTokenUsage: (usage: TokenUsage) => void;
  clearChat: () => void;
}

export const usePlaygroundStore = create<PlaygroundState>((set) => ({
  systemPrompt: 'You are a helpful AI assistant.',
  selectedModel: 'gpt-4o',
  provider: 'openai',
  temperature: 0.7,
  topP: 1,
  maxTokens: 2000,
  
  useWorkingMemory: true,
  useConversationMemory: true,
  useSemanticMemory: false,
  
  messages: [],
  isStreaming: false,
  evaluation: null,
  tokenUsage: null,
  
  setSystemPrompt: (prompt) => set({ systemPrompt: prompt }),
  setModelConfig: (config) => set((state) => ({ ...state, ...config })),
  setMemoryToggle: (key, value) => set({ [key]: value }),
  
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (content, metadata) => set((state) => {
    const newMessages = [...state.messages];
    if (newMessages.length > 0) {
      newMessages[newMessages.length - 1].content += content;
      if (metadata) {
        newMessages[newMessages.length - 1].metadata = metadata;
      }
    }
    return { messages: newMessages };
  }),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setEvaluation: (evaluation) => set({ evaluation }),
  setTokenUsage: (tokenUsage) => set({ tokenUsage }),
  clearChat: () => set({ messages: [], evaluation: null, tokenUsage: null }),
}));
