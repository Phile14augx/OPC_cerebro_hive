'use client';

import { useEvaluationStudioStore, EvaluationView } from '@/src/store/useEvaluationStudioStore';
import { LayoutDashboard, FileText, Database, ShieldCheck, Play, FlaskConical, BarChart3, Settings } from 'lucide-react';

export function EvaluationSidebar() {
  const { activeView, setActiveView } = useEvaluationStudioStore();

  const navItems: { id: EvaluationView; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profiles', label: 'Profiles', icon: FileText },
    { id: 'datasets', label: 'Datasets', icon: Database },
    { id: 'evaluators', label: 'Evaluators', icon: ShieldCheck },
    { id: 'runs', label: 'Runs', icon: Play },
    { id: 'experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col h-full bg-muted/5 border-r border-border w-64">
      <div className="h-12 border-b border-border flex items-center px-4 font-semibold shrink-0">
        Evaluation Studio
      </div>
      
      <div className="flex-1 overflow-auto py-2 flex flex-col gap-1">
        {/* Core items */}
        {navItems.slice(0, 4).map(item => (
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
        
        {/* Execution items */}
        {navItems.slice(4).map(item => (
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
