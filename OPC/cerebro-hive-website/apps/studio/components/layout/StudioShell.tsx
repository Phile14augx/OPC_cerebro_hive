'use client';

import { useLayoutStore } from '@/src/store/useLayoutStore';
import { CommandPalette } from './CommandPalette';

export function StudioShell({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, isInspectorOpen, isBottomPanelOpen } = useLayoutStore();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      <CommandPalette />
      
      {/* Top Status/Nav Bar */}
      <header className="h-12 border-b border-border flex items-center px-4 bg-muted/20">
        <div className="font-semibold text-sm">CerebroStudio</div>
        <div className="flex-1" />
        <div className="text-xs text-muted-foreground">Workspace: Default</div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Activity Bar (Icons) */}
        <aside className="w-12 border-r border-border bg-muted/10 flex flex-col items-center py-4 space-y-4">
          <div className="w-8 h-8 bg-primary/20 rounded cursor-pointer hover:bg-primary/30" title="Explorer" />
          <div className="w-8 h-8 bg-primary/20 rounded cursor-pointer hover:bg-primary/30" title="Search" />
          <div className="w-8 h-8 bg-primary/20 rounded cursor-pointer hover:bg-primary/30" title="Source Control" />
        </aside>

        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 border-r border-border bg-muted/5 flex flex-col">
            <div className="h-8 border-b border-border flex items-center px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Explorer
            </div>
            <div className="p-2 text-sm text-muted-foreground">
              No folder opened
            </div>
          </aside>
        )}

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
          <div className="flex-1 overflow-auto">
            {children}
          </div>
          
          {/* Bottom Panel */}
          {isBottomPanelOpen && (
            <div className="h-48 border-t border-border bg-muted/10">
              <div className="h-8 border-b border-border flex items-center px-4 text-xs font-semibold">
                Terminal
              </div>
            </div>
          )}
        </main>

        {/* Inspector */}
        {isInspectorOpen && (
          <aside className="w-80 border-l border-border bg-muted/5 flex flex-col">
            <div className="h-8 border-b border-border flex items-center px-4 text-xs font-semibold">
              Inspector
            </div>
          </aside>
        )}
      </div>

      {/* Status Bar */}
      <footer className="h-6 bg-primary text-primary-foreground flex items-center px-4 text-xs">
        <div>Ready</div>
        <div className="flex-1" />
        <div>TypeScript React</div>
      </footer>
    </div>
  );
}
