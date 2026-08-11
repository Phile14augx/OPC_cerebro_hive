"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, X, Sparkles, AlertTriangle, TrendingDown } from "lucide-react";

export function Copilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  
  const suggestions = [
    { text: "Why did deployment fail?", icon: AlertTriangle },
    { text: "Find cost anomalies.", icon: TrendingDown },
    { text: "Predict GPU exhaustion.", icon: Sparkles }
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-emerald-500 text-[#0B0D14] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform z-50 flex items-center justify-center"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Copilot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[400px] h-[600px] bg-[#0B0D14] border border-emerald-500/20 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-emerald-500/10 bg-emerald-500/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-emerald-50">Operations Copilot</h3>
                  <p className="text-xs text-emerald-500/70">Powered by CerebroInsight</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Welcome Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl rounded-tl-sm p-3 text-sm text-slate-300">
                  <p>Hello! I am your Enterprise Operations Copilot. How can I assist you with infrastructure today?</p>
                </div>
              </div>
              
              {/* Quick Suggestions */}
              <div className="grid gap-2 pt-2">
                {suggestions.map((s, i) => (
                  <button 
                    key={i} 
                    className="text-left px-3 py-2 rounded-lg border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-xs text-emerald-100 flex items-center gap-2 transition-colors"
                  >
                    <s.icon className="w-3 h-3 text-emerald-400" />
                    {s.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-emerald-500/10 bg-slate-900/50">
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about clusters, costs, or pipelines..."
                  className="w-full bg-[#0B0D14] border border-emerald-500/20 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors placeholder:text-slate-500"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:text-emerald-400 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
