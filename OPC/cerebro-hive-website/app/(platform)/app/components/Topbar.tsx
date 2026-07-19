"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, Sparkles, UserCircle, ChevronDown, Building2 } from "lucide-react";
import { CommandPalette } from "./ui/CommandPalette";
import { HiveAssistant } from "./ui/HiveAssistant";

export function Topbar() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Global Ctrl+K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0">
      {/* Organization Switcher (Left) */}
      <div className="flex items-center gap-4 ml-12 lg:ml-0">
        <button className="hidden md:flex items-center gap-2 px-3 py-1.5 hover:bg-surface rounded-lg transition-colors border border-transparent hover:border-border">
          <div className="w-6 h-6 rounded bg-primary-accent/10 flex items-center justify-center">
            <Building2 size={14} className="text-primary-accent" />
          </div>
          <span className="text-sm font-medium text-text-primary">CerebroHive</span>
          <ChevronDown size={14} className="text-text-muted" />
        </button>
      </div>

      {/* Command Palette / Search (Center) */}
      <div className="flex-1 max-w-xl px-4">
        <button 
          onClick={() => setCmdOpen(true)}
          className="w-full flex items-center justify-between px-4 py-2 bg-surface border border-border hover:border-primary-accent/40 rounded-xl text-text-muted transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Search size={16} className="group-hover:text-primary-accent transition-colors" />
            <span className="text-sm">Search, command, or jump to...</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold">
            <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 bg-background rounded border border-border">K</kbd>
          </div>
        </button>
      </div>

      {/* Actions (Right) */}
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => setAssistantOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-accent/10 hover:bg-primary-accent/20 text-primary-accent rounded-lg transition-colors border border-primary-accent/20"
        >
          <Sparkles size={16} />
          <span className="text-sm font-bold hidden sm:inline">Hive Assistant</span>
        </button>
        
        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-full transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
        </button>
        
        <button className="p-1 hover:bg-surface rounded-full transition-colors">
          <UserCircle size={28} className="text-text-secondary" />
        </button>
      </div>
    </header>

    <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    <HiveAssistant isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
}
