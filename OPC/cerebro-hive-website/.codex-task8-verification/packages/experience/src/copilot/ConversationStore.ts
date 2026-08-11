
import { create } from 'zustand';

export interface MessageMetadata {
  toolCalls?: string[];
  citations?: string[];
  reasoningTimeMs?: number;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

interface ConversationState {
  messages: ConversationMessage[];
  isTyping: boolean;
  addMessage: (msg: Omit<ConversationMessage, 'id' | 'timestamp'>) => void;
  setTyping: (status: boolean) => void;
  clear: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  messages: [],
  isTyping: false,
  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: crypto.randomUUID(), timestamp: new Date() }]
  })),
  setTyping: (status) => set({ isTyping: status }),
  clear: () => set({ messages: [] })
}));
