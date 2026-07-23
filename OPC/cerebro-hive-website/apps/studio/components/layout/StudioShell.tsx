'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useLayoutStore } from '@/src/store/useLayoutStore';
import { CommandPalette } from './CommandPalette';
import { getNavigationForPath } from '@/lib/navigation/registry';
import { Folder, Search, GitBranch, ShieldAlert, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StudioShell({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, isInspectorOpen, isBottomPanelOpen } = useLayoutStore();
  const pathname = usePathname() || '/';
  
  const currentNav = getNavigationForPath(pathname);

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
          <Link href="/" className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-md transition-colors" title="Explorer">
            <Folder size={20} />
          </Link>
          <button className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-md transition-colors" title="Search">
            <Search size={20} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-md transition-colors" title="Source Control">
            <GitBranch size={20} />
          </button>
          
          <div className="flex-1" />
          
          {/* Bottom Activity Icons */}
          <Link href="/trust" className={cn(
            "w-10 h-10 flex items-center justify-center rounded-md transition-colors",
            pathname.startsWith("/trust") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
          )} title="Trust & Governance">
            <ShieldAlert size={20} />
          </Link>
        </aside>

        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 border-r border-border bg-muted/5 flex flex-col overflow-hidden">
            {currentNav ? (
              <>
                <div className="h-8 border-b border-border flex items-center px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {currentNav.title}
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                  {currentNav.groups.map((group, i) => (
                    <div key={i} className="mb-4">
                      <div className="px-4 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {group.label}
                      </div>
                      <div className="space-y-0.5">
                        {group.items.map((item, j) => {
                          const isActive = pathname === item.href;
                          return (
                            <Link 
                              key={j} 
                              href={item.href}
                              className={cn(
                                "flex items-center gap-2 px-4 py-1.5 text-sm transition-colors",
                                isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                              )}
                            >
                              {item.icon && <item.icon size={16} />}
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="h-8 border-b border-border flex items-center px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Explorer
                </div>
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No workspace folder opened
                </div>
              </>
            )}
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
