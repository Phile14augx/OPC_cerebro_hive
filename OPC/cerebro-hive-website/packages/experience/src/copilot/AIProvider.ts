
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
