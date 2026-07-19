"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Send, Bot, User, CornerDownLeft } from "lucide-react";
import { cn } from "./utils";

export interface HiveAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HiveAssistant({ isOpen, onClose }: HiveAssistantProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, action?: boolean }[]>([
    { role: 'assistant', content: "Hello! I am Cerebro X. What would you like to build, deploy, or automate today?" }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");

    // Mock AI response logic
    setTimeout(() => {
      let aiMsg = "I can help with that! However, this is a prototype interface. In the future, I will automatically provision the required resources.";
      let hasAction = false;
      
      const lower = userMsg.toLowerCase();
      if (lower.includes("hr chatbot") || lower.includes("agent")) {
        aiMsg = "I've started creating your HR Chatbot. I've scaffolded a new project, provisioned a Vector Database, and attached the 'Policies' knowledge base. Would you like to review the architecture?";
        hasAction = true;
      } else if (lower.includes("deploy") || lower.includes("postgresql")) {
        aiMsg = "I'm deploying a High-Availability PostgreSQL cluster to the 'West India' region. This usually takes about 3 minutes.";
        hasAction = true;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiMsg, action: hasAction }]);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center">
                  <Sparkles size={20} className="text-primary-accent" />
                </div>
                <div>
                  <h2 className="font-space font-bold text-text-primary text-lg leading-none">Hive Assistant</h2>
                  <p className="text-xs text-primary-accent mt-1">Powered by Cerebro X</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface rounded-full transition-colors text-text-muted hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    msg.role === 'user' ? "bg-surface border border-border" : "bg-primary-accent text-background"
                  )}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-surface-elevated text-text-primary rounded-tr-none" 
                      : "bg-primary-accent/10 text-text-primary border border-primary-accent/20 rounded-tl-none"
                  )}>
                    {msg.content}
                    {msg.action && (
                      <div className="mt-3 pt-3 border-t border-primary-accent/20">
                        <button className="text-xs font-bold text-primary-accent hover:underline flex items-center gap-1">
                          View Details <CornerDownLeft size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-background">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Cerebro X..."
                  className="w-full bg-surface border border-border focus:border-primary-accent/50 rounded-xl pl-4 pr-12 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-primary-accent text-background rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  <Send size={16} />
                </button>
              </form>
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 custom-scrollbar hide-scroll-bar">
                {["Deploy PostgreSQL", "Create a HR chatbot", "Build RAG"].map((suggestion) => (
                  <button 
                    key={suggestion}
                    type="button"
                    onClick={() => setInput(suggestion)}
                    className="whitespace-nowrap px-3 py-1 bg-surface border border-border rounded-full text-xs text-text-secondary hover:text-primary-accent hover:border-primary-accent/30 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
