
import React from 'react';
import { cn } from "../../utils/cn"

export function EmptyState({ 
  title, 
  description, 
  icon,
  className 
}: { 
  title: string; 
  description: string; 
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      {icon && <div className="mb-4 text-[var(--color-text-muted)]">{icon}</div>}
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-sm">{description}</p>
    </div>
  )
}
