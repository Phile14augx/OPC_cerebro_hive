import React from 'react';

export const PageContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`p-6 max-w-7xl mx-auto space-y-6 ${className || ''}`}>
    {children}
  </div>
);

export const PageHeader: React.FC<{ title: string; description?: string; children?: React.ReactNode }> = ({ title, description, children }) => (
  <div className="flex items-start justify-between">
    <div className="space-y-1">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
    {children && <div className="flex items-center gap-2">{children}</div>}
  </div>
);
