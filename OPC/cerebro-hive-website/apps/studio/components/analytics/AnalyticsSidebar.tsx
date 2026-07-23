'use client';

import { useAnalyticsStore, AnalyticsView } from '@/src/store/useAnalyticsStore';
import { LayoutDashboard, Activity, Search, FileTerminal, DollarSign, Cpu, Globe, Bot, Workflow, Bell, Settings } from 'lucide-react';

export function AnalyticsSidebar() {
  const { activeView, setActiveView } = useAnalyticsStore();

  const navItems: { id: AnalyticsView; label: string; icon: any; section?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'metrics', label: 'Metrics', icon: Activity },
    { id: 'traces', label: 'Traces', icon: Search },
    { id: 'logs', label: 'Logs', icon: FileTerminal },
    { id: 'costs', label: 'Cost Analysis', icon: DollarSign },
    
    // Domain Specific
    { id: 'models', label: 'Models', icon: Cpu, section: 'Domain' },
    { id: 'providers', label: 'Providers', icon: Globe, section: 'Domain' },
    { id: 'agents', label: 'Agents', icon: Bot, section: 'Domain' },
    { id: 'workflows', label: 'Workflows', icon: Workflow, section: 'Domain' },
    
    // Ops
    { id: 'alerts', label: 'Alerts', icon: Bell, section: 'Ops' },
  ];

  return (
    <div className="flex flex-col h-full bg-muted/5 border-r border-border w-64">
      <div className="h-12 border-b border-border flex items-center px-4 font-semibold shrink-0">
        Analytics & Observability
      </div>
      
      <div className="flex-1 overflow-auto py-2 flex flex-col gap-1">
        {navItems.filter(item => !item.section).map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors
              ${activeView === item.id ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
        
        <div className="mx-4 my-2 h-px bg-border"></div>
        <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entity Telemetry</div>
        
        {navItems.filter(item => item.section === 'Domain').map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors
              ${activeView === item.id ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}

        <div className="mx-4 my-2 h-px bg-border"></div>
        <div className="px-4 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Operations</div>

        {navItems.filter(item => item.section === 'Ops').map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors
              ${activeView === item.id ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
            {item.id === 'alerts' && <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">3</span>}
          </button>
        ))}
      </div>

      <div className="border-t border-border p-2">
        <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground rounded transition-colors text-left">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
}
