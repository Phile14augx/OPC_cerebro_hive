"use client";

import { useEffect, useState } from "react";
import { ActionDefinition } from "../../../app/platform/hiveforge/core/contracts/plugin";
import { platformRegistry } from "../../../app/platform/hiveforge/core/registry/PlatformRegistry";

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [actions, setActions] = useState<ActionDefinition[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global Ctrl+K / Cmd+K listener
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => {
          if (!open) {
            setActions(platformRegistry.getActions());
            setSearch("");
          }
          return !open;
        });
      }
      
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const filteredActions = actions.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) || 
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[20vh] backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-background shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-3 border-b border-border">
          <input
            type="text"
            className="flex-1 bg-transparent text-lg text-text-primary outline-none placeholder:text-text-secondary"
            placeholder="Search commands, resources, logs, or 'deploy'..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="text-xs text-text-secondary bg-surface px-2 py-1 rounded">ESC</div>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="p-4 text-center text-sm text-text-secondary">No actions found.</div>
          ) : (
            filteredActions.map((action) => (
              <button
                key={action.id}
                onClick={async () => {
                  setIsOpen(false);
                  await action.execute({});
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary-accent/10 hover:text-primary-accent transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  {action.icon && <span>{action.icon}</span>}
                  <div className="font-medium">{action.title}</div>
                </div>
                <div className="text-xs text-text-secondary group-hover:text-primary-accent/70 uppercase tracking-wider">{action.category}</div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
