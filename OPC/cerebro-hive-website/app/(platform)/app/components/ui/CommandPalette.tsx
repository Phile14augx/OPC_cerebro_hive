"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronRight, X } from "lucide-react";
import { Modal } from "./Modal";
import { platformNavigation } from "../../navigation";
import { useRouter } from "next/navigation";
import { cn } from "./utils";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Reset search when opened
  useEffect(() => {
    if (isOpen) setSearchQuery("");
  }, [isOpen]);

  // Flatten and filter navigation items based on search query
  const allItems = platformNavigation.flatMap(group => 
    group.items.map(item => ({ ...item, group: group.title }))
  );

  const filteredItems = searchQuery.trim() === "" 
    ? allItems.slice(0, 8) // Show some defaults when empty
    : allItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.group.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className="max-w-3xl border-0 bg-transparent shadow-none"
    >
      <div className="bg-background border border-border rounded-2xl shadow-elevated overflow-hidden flex flex-col h-[60vh] max-h-[500px]">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-border bg-surface relative">
          <Search size={20} className="text-primary-accent absolute left-5" />
          <input 
            autoFocus
            type="text"
            placeholder="Search, command, or jump to..."
            className="w-full pl-10 pr-10 py-2 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            onClick={onClose}
            className="absolute right-5 p-1 bg-surface-elevated rounded-md text-text-muted hover:text-text-primary transition-colors text-xs font-bold"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {filteredItems.length > 0 ? (
            <div className="space-y-1">
              {filteredItems.map((item, idx) => (
                <button
                  key={`${item.href}-${idx}`}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-elevated transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
                      {item.icon && <item.icon size={16} className="text-text-muted group-hover:text-primary-accent transition-colors" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary group-hover:text-primary-accent transition-colors">{item.title}</h4>
                      <p className="text-xs text-text-secondary">{item.group}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Search size={32} className="text-text-muted mb-4 opacity-50" />
              <p className="text-text-primary font-bold">No results found</p>
              <p className="text-sm text-text-secondary mt-1">We couldn&apos;t find anything matching &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-border bg-surface flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border font-sans">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border font-sans">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-background rounded border border-border font-sans">↵</kbd>
              to select
            </span>
          </div>
          <div>HivePulse</div>
        </div>
      </div>
    </Modal>
  );
}
