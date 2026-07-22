"use client";

import { Plugin, ActionDefinition } from "../../../app/platform/hiveforge/core/contracts/plugin";

export function CapabilityGrid({ plugin }: { plugin: Plugin }) {
  const actions = plugin.actions || [];

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">Service Capabilities</h3>
      
      {actions.length === 0 ? (
        <div className="text-sm text-text-secondary bg-surface/30 p-4 rounded-lg border border-border">
          This service currently exposes no automated capabilities.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action) => (
            <div key={action.id} className="border border-border bg-surface/40 p-4 rounded-xl hover:border-primary-accent/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-text-primary font-medium">
                  {action.icon && <span>{action.icon}</span>}
                  {action.title}
                </div>
                <div className="text-[10px] uppercase bg-primary-accent/10 text-primary-accent px-2 py-0.5 rounded">
                  {action.category}
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-text-secondary">
                  Shortcut: <kbd className="font-mono bg-background border border-border px-1 rounded">{action.keyboardShortcut || "None"}</kbd>
                </div>
                <button 
                  onClick={() => action.execute({})}
                  className="text-xs font-semibold text-text-primary bg-primary-accent hover:bg-primary-accent/80 transition-colors px-3 py-1.5 rounded"
                >
                  Execute
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
