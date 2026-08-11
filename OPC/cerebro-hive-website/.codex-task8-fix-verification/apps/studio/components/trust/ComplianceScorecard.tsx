'use client';
import React from 'react';
import { useComplianceStore } from '@/src/store/trust/useComplianceStore';
import { ShieldCheck } from 'lucide-react';

export function ComplianceScorecard() {
  const { frameworks, isLoading } = useComplianceStore();

  if (isLoading || !frameworks) {
    return <div className="h-64 border border-border bg-muted/10 animate-pulse rounded-lg" />;
  }

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-blue-500" />
          <h3 className="font-semibold text-sm">Compliance Status</h3>
        </div>
      </div>
      <div className="p-4 space-y-6">
        {frameworks.map((fw) => (
          <div key={fw.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">{fw.name}</span>
              <span className="font-mono text-muted-foreground">{fw.progress}%</span>
            </div>
            <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${fw.progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                style={{ width: `${fw.progress}%` }}
              />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{fw.controls} Controls</span>
              <span>{fw.evidence} Evidence</span>
              <span>{fw.owner}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
