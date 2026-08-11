
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
          <div key={m.id} className={`text-sm ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${m.role === 'user' ? 'bg-[var(--color-bg-primary)] text-white' : 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]'}`}>
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
