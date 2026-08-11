'use client';
import React from 'react';
import { useRiskStore } from '@/src/store/trust/useRiskStore';
import { AlertTriangle, AlertCircle } from 'lucide-react';

export function RiskHeatmap() {
  const { risks, isLoading } = useRiskStore();

  if (isLoading || !risks) {
    return <div className="h-64 border border-border bg-muted/10 animate-pulse rounded-lg" />;
  }

  const getSeverityColor = (level: string) => {
    switch(level) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-orange-500" />
          <h3 className="font-semibold text-sm">Risk Register</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/5 border-b border-border">
            <tr>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Likelihood</th>
              <th className="px-4 py-3 font-medium">Impact</th>
              <th className="px-4 py-3 font-medium">Exposure</th>
              <th className="px-4 py-3 font-medium">Mitigation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {risks.map((risk) => (
              <tr key={risk.id} className="hover:bg-muted/10">
                <td className="px-4 py-3 font-medium flex items-center gap-2">
                  <AlertCircle size={14} className="text-muted-foreground" />
                  {risk.category}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(risk.likelihood)}`}>{risk.likelihood}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(risk.impact)}`}>{risk.impact}</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{risk.exposure}</td>
                <td className="px-4 py-3 text-muted-foreground">{risk.mitigation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
