'use client';

import React from 'react';

export function TraceViewer() {
  return (
    <div className="flex flex-col h-full bg-background border-t border-border">
      <div className="h-10 border-b border-border flex items-center px-4 bg-muted/5 flex-none">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Trace Viewer / Execution History</h3>
        <div className="ml-auto flex gap-2">
          <button className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90">Simulate</button>
          <button className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded hover:bg-secondary/80">Clear</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Mocked Execution Trace */}
        <div className="border border-border rounded p-4 bg-muted/5">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-sm">Execution #1204</span>
            <span className="text-xs text-muted-foreground">Completed in 4.2s</span>
          </div>
          
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {/* Step 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border border-green-500 bg-background text-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M14.4 5.6l-5.6 5.6-2.4-2.4-1.6 1.6 4 4 7.2-7.2z"></path></svg>
              </div>
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.25rem)] p-3 rounded border border-border bg-background shadow-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-xs">Start Node</span>
                  <span className="text-[10px] text-muted-foreground">0ms</span>
                </div>
                <div className="text-xs text-muted-foreground">Trigger received.</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border border-green-500 bg-background text-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M14.4 5.6l-5.6 5.6-2.4-2.4-1.6 1.6 4 4 7.2-7.2z"></path></svg>
              </div>
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.25rem)] p-3 rounded border border-border bg-background shadow-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-xs">Data Extractor Agent</span>
                  <span className="text-[10px] text-muted-foreground">1.8s</span>
                </div>
                <div className="text-xs text-muted-foreground truncate">Prompt executed. Extracted: {`{ "valid": true }`}</div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border border-blue-500 bg-background text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
              </div>
              <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.25rem)] p-3 rounded border border-border bg-background shadow-sm border-l-2 border-l-blue-500">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-xs">CRM Sync Tool</span>
                  <span className="text-[10px] text-muted-foreground">Running...</span>
                </div>
                <div className="text-xs text-muted-foreground">Executing external API call...</div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
