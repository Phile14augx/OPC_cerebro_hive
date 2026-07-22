import React from 'react';

export const TopBar: React.FC<{ appName: string }> = ({ appName }) => {
  return (
    <header className="h-[var(--spacing-header)] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-4">
        <h1 className="font-semibold text-lg">{appName}</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* User profile / global actions will go here */}
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
          U
        </div>
      </div>
    </header>
  );
};
