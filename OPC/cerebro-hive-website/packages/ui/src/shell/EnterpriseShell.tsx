import React from 'react';
import { Sidebar, SidebarItemConfig } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '../utils';

export interface EnterpriseShellProps {
  children: React.ReactNode;
  sidebarConfig: SidebarItemConfig[];
  appName: string;
}

export const EnterpriseShell: React.FC<EnterpriseShellProps> = ({ children, sidebarConfig, appName }) => {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar items={sidebarConfig} />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <TopBar appName={appName} />
        <main className="flex-1 overflow-auto bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
};
