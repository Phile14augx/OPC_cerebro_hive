'use client';
import React from 'react';
import { useSecurityStore } from '@/src/store/trust/useSecurityStore';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export function SecurityPosturePanel() {
  const { posture, isLoading } = useSecurityStore();

  if (isLoading || !posture) {
    return <div className="h-64 border border-border bg-muted/10 animate-pulse rounded-lg" />;
  }

  const items = [
    { label: 'Identity', value: posture.identity },
    { label: 'MFA', value: posture.mfa },
    { label: 'SSO', value: posture.sso },
    { label: 'RBAC', value: posture.rbac },
    { label: 'Secrets', value: posture.secrets },
    { label: 'Encryption', value: posture.encryption },
    { label: 'Certificates', value: posture.certificates },
    { label: 'API Keys', value: posture.apiKeys },
    { label: 'Session Health', value: posture.sessionHealth },
    { label: 'Service Accounts', value: posture.serviceAccounts },
    { label: 'Provider Credentials', value: posture.providerCredentials },
  ];

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-border bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-primary" />
          <h3 className="font-semibold text-sm">Security Posture</h3>
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{item.value}</span>
              <CheckCircle2 size={14} className="text-emerald-500" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
