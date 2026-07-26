const fs = require('fs');
const path = require('path');

const expDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages', 'experience', 'src');

// ----------------------------------------------------
// PHASE 4: AI COPILOT
// ----------------------------------------------------
const copilotDir = path.join(expDir, 'copilot');
fs.mkdirSync(copilotDir, { recursive: true });

// ConversationStore
fs.writeFileSync(path.join(copilotDir, 'ConversationStore.ts'), `
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
`);

// AIProvider / Tools Registration
fs.writeFileSync(path.join(copilotDir, 'AIProvider.ts'), `
import { CommandRegistry } from '../commands/CommandRegistry';

// Register AI-specific tools to the command registry
export const initializeAITools = () => {
  CommandRegistry.register({
    id: 'ai.analyze_kpi',
    title: 'Analyze KPI',
    category: 'AI Tools',
    keywords: ['analyze', 'kpi', 'metrics'],
    handler: () => { console.log("AI Tool Executed: Analyze KPI"); }
  });

  CommandRegistry.register({
    id: 'ai.show_logs',
    title: 'Show System Logs',
    category: 'AI Tools',
    keywords: ['logs', 'system', 'error'],
    handler: () => { console.log("AI Tool Executed: Show Logs"); }
  });
};
`);

// CopilotPanel
fs.writeFileSync(path.join(copilotDir, 'CopilotPanel.tsx'), `
import React from 'react';
import { useConversationStore } from './ConversationStore';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@cerebro/ui';

export const CopilotPanel = () => {
  const { messages, isTyping } = useConversationStore();

  return (
    <Card className="flex flex-col h-full border-none rounded-none border-l border-[var(--color-border-default)] w-80">
      <CardHeader className="py-4 border-b border-[var(--color-border-subtle)]">
        <CardTitle className="text-sm">Hive Copilot</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)] text-center mt-10">How can I assist your operations today?</p>
        )}
        {messages.map(m => (
          <div key={m.id} className={\`text-sm \${m.role === 'user' ? 'text-right' : 'text-left'}\`}>
            <span className={\`inline-block p-2 rounded-lg \${m.role === 'user' ? 'bg-[var(--color-bg-primary)] text-white' : 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]'}\`}>
              {m.content}
            </span>
          </div>
        ))}
        {isTyping && <div className="text-sm text-[var(--color-text-muted)] animate-pulse">Assistant is thinking...</div>}
      </CardContent>
      <div className="p-4 border-t border-[var(--color-border-subtle)]">
        <input 
          className="w-full text-sm bg-[var(--color-surface-raised)] border border-[var(--color-border-default)] rounded-md p-2 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]" 
          placeholder="Ask Copilot..." 
        />
      </div>
    </Card>
  );
};
`);

// Update ContextBuilder
const contextBuilderPath = path.join(expDir, 'commands', 'ContextBuilder.ts');
fs.writeFileSync(contextBuilderPath, `
import { useWorkspaceStore } from '../navigation/WorkspaceStore';

export interface CommandContext {
  workspace: string | null;
  dashboard: string | null;
  activeWidget: string | null;
  selection: any;
  filters: Record<string, any>;
  permissions: string[];
  timeRange: string;
  visibleWidgets: string[];
}

export const buildCommandContext = (): CommandContext => {
  const store = useWorkspaceStore.getState();
  return {
    workspace: store.activeModule,
    dashboard: 'mission-control',
    activeWidget: null,
    selection: null,
    filters: {},
    permissions: ['*'],
    timeRange: 'last_7_days',
    visibleWidgets: ['kpi-overview', 'health-status']
  };
};
`);


// ----------------------------------------------------
// PHASE 5: CUSTOMIZATION
// ----------------------------------------------------
const settingsDir = path.join(expDir, 'preferences');
fs.mkdirSync(settingsDir, { recursive: true });

// PreferenceService
fs.writeFileSync(path.join(settingsDir, 'PreferenceService.ts'), `
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PlatformPreferences {
  appearance: {
    theme: 'light' | 'dark' | 'aurora' | 'executive' | 'blueprint' | 'graphite';
    density: 'comfortable' | 'compact' | 'dense';
    fontScaling: number;
    motionReduction: boolean;
  };
  workspace: {
    sidebarBehavior: 'pinned' | 'floating' | 'collapsed';
    defaultDashboard: string;
  };
  accessibility: {
    highContrast: boolean;
    keyboardNavigation: boolean;
  };
  experimental: {
    betaFeatures: boolean;
    debugMode: boolean;
  };
}

const defaultPreferences: PlatformPreferences = {
  appearance: { theme: 'dark', density: 'comfortable', fontScaling: 100, motionReduction: false },
  workspace: { sidebarBehavior: 'pinned', defaultDashboard: 'mission-control' },
  accessibility: { highContrast: false, keyboardNavigation: true },
  experimental: { betaFeatures: false, debugMode: false }
};

interface PreferenceStore extends PlatformPreferences {
  updateAppearance: (overrides: Partial<PlatformPreferences['appearance']>) => void;
  updateWorkspace: (overrides: Partial<PlatformPreferences['workspace']>) => void;
}

export const usePreferenceService = create<PreferenceStore>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      updateAppearance: (overrides) => set((state) => ({ appearance: { ...state.appearance, ...overrides } })),
      updateWorkspace: (overrides) => set((state) => ({ workspace: { ...state.workspace, ...overrides } }))
    }),
    { name: 'cerebro-preferences' }
  )
);
`);

// Expose Copilot and Preferences in index.ts
let indexContent = fs.readFileSync(path.join(expDir, 'index.ts'), 'utf8');
indexContent += `
export * from './copilot/ConversationStore';
export * from './copilot/CopilotPanel';
export * from './copilot/AIProvider';
export * from './preferences/PreferenceService';
`;
fs.writeFileSync(path.join(expDir, 'index.ts'), indexContent);

console.log('Phase 4 & 5 executed successfully');
