
import React from 'react';
import { useWorkspaceStore } from '../navigation/WorkspaceStore';

export const WorkspaceShell = ({ children }: { children: React.ReactNode }) => {
  const sidebarExpanded = useWorkspaceStore(s => s.sidebarExpanded);
  
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--color-bg-primary)]">
      {/* TopBar */}
      {/* Sidebar (Dynamic Width) */}
      <aside style={{ width: sidebarExpanded ? '280px' : '64px' }} className="transition-all border-r border-[var(--color-border-default)]">
         {/* NavigationRail or Full Sidebar */}
      </aside>
      
      {/* Main WorkspaceHost */}
      <main className="flex-1 flex flex-col relative">
        {children}
      </main>
      
      {/* Auxiliary Panel & OverlayHost would go here */}
    </div>
  );
}
