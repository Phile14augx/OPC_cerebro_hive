'use client';
import React from 'react';
import { useSecurityStore } from '@/src/store/trust/useSecurityStore';
import { Server, Activity, ArrowRightCircle } from 'lucide-react';

export function ProviderHealthPanel() {
  const { providerHealth, isLoading } = useSecurityStore();

  if (isLoading || !providerHealth) {
    return <div className="h-48 border border-border bg-muted/10 animate-pulse rounded-lg" />;
  }

  const getStatusColor = (status: string) => {
    if (status === 'Healthy') return 'text-emerald-500';
    if (status === 'Slow') return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBg = (status: string) => {
    if (status === 'Healthy') return 'bg-emerald-500';
    if (status === 'Slow') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server size={18} className="text-cyan-500" />
          <h3 className="font-semibold text-sm">Provider Health</h3>
        </div>
        <button className="text-xs flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
          View all <ArrowRightCircle size={12} />
        </button>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
        {providerHealth.map((provider) => (
          <div key={provider.id} className="border border-border rounded-md p-3 flex flex-col space-y-2 hover:bg-muted/10 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold truncate">{provider.name}</span>
              <div className={`h-2 w-2 rounded-full ${getStatusBg(provider.status)} shadow-[0_0_8px_currentColor]`} />
            </div>
            <div className="flex items-center gap-2">
              <Activity size={12} className={getStatusColor(provider.status)} />
              <span className={`text-xs font-mono ${getStatusColor(provider.status)}`}>{provider.status}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Latency: {provider.latency}ms
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
