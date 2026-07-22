import React from 'react';

export const EmptyState: React.FC<{ title: string; description: string; action?: React.ReactNode }> = ({ title, description, action }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-lg bg-background">
    <h3 className="text-lg font-medium">{title}</h3>
    <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm">{description}</p>
    {action}
  </div>
);

export const LoadingOverlay: React.FC = () => (
  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);
