'use client';

import React, { useState } from 'react';
import { usePlaygroundStore } from '@/src/store/usePlaygroundStore';
import { useGatewayStream } from '@/src/hooks/useGateway';

export function ChatWindow() {
  const { messages, isStreaming, tokenUsage, evaluation } = usePlaygroundStore();
  const { runStream, cancelStream } = useGatewayStream();
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    runStream(input);
    setInput('');
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-background relative">
      {/* Top Bar with Metrics */}
      {tokenUsage && (
        <div className="absolute top-0 left-0 right-0 h-8 bg-muted/10 border-b border-border flex items-center px-4 gap-4 text-xs text-muted-foreground z-10 backdrop-blur">
          <span>Tokens: {tokenUsage.total}</span>
          <span>Cost: ${tokenUsage.cost}</span>
          {evaluation && (
            <>
              <span className="text-green-500">Safety: {evaluation.safety}</span>
              <span className="text-green-500">Quality: {evaluation.quality}</span>
            </>
          )}
        </div>
      )}

      {/* Messages */}
      <div className={`flex-1 overflow-auto p-4 space-y-6 ${tokenUsage ? 'pt-12' : ''}`}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            Enter a message to begin execution sandbox...
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id || i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap
                ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/20 border border-border'}
              `}>
                {msg.content}
                {/* Simulated tool calls or reasoning metadata could go here */}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-muted/5">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message to the assembled prompt..."
            className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm outline-none focus:border-primary transition-colors"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button 
              type="button" 
              onClick={cancelStream}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
            >
              Stop
            </button>
          ) : (
            <button 
              type="submit" 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled={!input.trim()}
            >
              Send
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
