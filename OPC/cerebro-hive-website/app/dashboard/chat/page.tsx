'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Database, Plus, Paperclip, ChevronRight, Loader2 } from 'lucide-react';
import { askAI, Citation } from '@/app/actions/ai';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  citations?: Citation[];
};

const INITIAL_MESSAGE: Message = { 
  role: 'system', 
  content: 'CerebroArchive Research Assistant initialized. I have access to your workspace documents. How can I help you synthesize information today?' 
};

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const res = await askAI(input);
    setIsLoading(false);

    if (res.error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${res.error}` }]);
      return;
    }

    if (res.data) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data!.answer,
        citations: res.data!.citations
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-page">
      
      {/* Header area for Context/Options */}
      <div className="h-14 border-b border-border/50 bg-surface/50 backdrop-blur-md flex items-center px-6 shrink-0 z-10 justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Chatting with context:</span>
          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md font-medium flex items-center gap-1.5 cursor-pointer hover:bg-indigo-500/20 transition-colors">
            <Database size={14} />
            Entire Workspace
            <ChevronRight size={14} />
          </span>
        </div>
        <button className="flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors bg-surface-hover px-3 py-1.5 rounded-md border border-border/50">
          <Plus size={14} />
          New Chat
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-8 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-8">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''} animate-fade-in-up`} style={{ animationDelay: `${idx * 100}ms` }}>
              
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                  <Bot size={18} className="text-white" />
                </div>
              )}
              
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-surface-hover border border-border/50' : 'bg-transparent'} rounded-2xl px-5 py-4`}>
                <div className="text-gray-200 leading-relaxed text-[15px] whitespace-pre-wrap">
                  {msg.content}
                </div>
                
                {/* Citations block */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap gap-2">
                    <span className="text-xs text-muted font-medium mr-1">Sources:</span>
                    {msg.citations.map((cite, cIdx) => (
                      <div key={cIdx} className="text-xs bg-surface border border-border/50 text-indigo-300 px-2 py-1 rounded cursor-pointer hover:bg-indigo-500/10 transition-colors group relative">
                        {cite.source}
                        {/* Tooltip on hover showing chunk text */}
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-surface border border-border/50 p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                          <p className="text-gray-300 line-clamp-4">{cite.text}</p>
                          <p className="text-gray-500 mt-1">Score: {(cite.score * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-surface border border-border/50 flex items-center justify-center shrink-0">
                  <User size={18} className="text-gray-400" />
                </div>
              )}
            </div>
          {isLoading && (
            <div className="flex gap-4 animate-fade-in-up">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                <Bot size={18} className="text-white animate-pulse" />
              </div>
              <div className="bg-transparent rounded-2xl px-5 py-4 flex items-center">
                <Loader2 size={20} className="text-indigo-400 animate-spin" />
                <span className="ml-3 text-gray-400 text-sm">Synthesizing response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-4 sm:p-6 max-w-4xl w-full mx-auto pb-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-lg transition-all opacity-0 group-focus-within:opacity-100" />
          <div className="relative bg-surface border border-border/50 rounded-2xl p-2 flex items-end shadow-2xl transition-all focus-within:border-indigo-500/50">
            <button className="p-3 text-gray-500 hover:text-white transition-colors rounded-xl">
              <Paperclip size={20} />
            </button>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..." 
              className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:outline-none focus:ring-0 py-3 px-2 resize-none max-h-32 min-h-[44px]"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white transition-colors rounded-xl m-1 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
        <p className="text-center text-xs text-muted mt-3">
          AI can make mistakes. Verify important information with the cited source documents.
        </p>
      </div>

    </div>
  );
}
