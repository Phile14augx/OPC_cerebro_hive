import React from 'react';

export interface SidebarItemConfig {
  label: string;
  href: string;
  icon?: React.ReactNode;
  roles?: string[];
  permissions?: string[];
  children?: SidebarItemConfig[];
}

export const Sidebar: React.FC<{ items: SidebarItemConfig[] }> = ({ items }) => {
  return (
    <aside className="w-[var(--spacing-sidebar)] h-full bg-background border-r border-border flex flex-col">
      <div className="h-[var(--spacing-header)] border-b border-border flex items-center px-6">
        <span className="font-display font-bold text-xl tracking-tight">CerebroHive</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((item, idx) => (
          <a
            key={idx}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {item.icon}
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
};
