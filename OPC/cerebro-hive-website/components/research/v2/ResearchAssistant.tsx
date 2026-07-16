"use client";

import React, { useState } from "react";
import { MessageSquare, X, Send, Bot, FileText, LayoutList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const ResearchAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi. I'm the Research Lab Copilot. I've read all 350+ CerebroHive papers. How can I help?" }
  ]);
  const [input, setInput] = useState("");

  const suggestedActions = [
    { icon: FileText, label: "Explain RAG Paper" },
    { icon: LayoutList, label: "Compare Architectures" }
  ];

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    setMessages([...messages, { role: "user", text: input }]);
    setInput("");
    
    // Simulate thinking
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", text: "I'm currently a UI demonstration. In production, I would query the vector database to synthesize a response from our research corpus." }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary-accent rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,245,122,0.3)] hover:scale-110 transition-transform z-50 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageSquare size={24} className="text-black" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-surface-elevated border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 bg-black/50 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary-accent/10 flex items-center justify-center">
                  <Bot size={18} className="text-primary-accent" />
                </div>
                <div>
                  <h4 className="font-space font-bold text-white text-sm">Lab Copilot</h4>
                  <div className="text-[10px] text-[#00E5FF] uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" /> Agent OS Active
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar flex flex-col">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary-accent text-black rounded-tr-sm font-medium' 
                      : 'bg-white/5 border border-white/10 text-text-secondary rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggested Actions */}
            {messages.length === 1 && (
              <div className="px-4 pb-4 flex flex-wrap gap-2">
                {suggestedActions.map((action, i) => (
                  <button key={i} onClick={() => setInput(action.label)} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-primary-accent/50 hover:text-primary-accent transition-colors text-xs text-text-muted">
                    <action.icon size={12} /> {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-black/50 border-t border-white/10">
              <form onSubmit={handleSend} className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about our research..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors"
                />
                <button type="submit" disabled={!input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary-accent text-black disabled:opacity-50 disabled:bg-white/10 disabled:text-text-muted transition-colors">
                  <Send size={14} />
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
