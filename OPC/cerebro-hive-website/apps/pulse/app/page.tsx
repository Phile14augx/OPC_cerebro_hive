import React from 'react';
import { WidgetRegistry } from '@cerebro/experience/widgets/WidgetRegistry';
import { WidgetHost } from '@cerebro/experience/widgets/WidgetHost';
import { useDashboardRefreshCoordinator } from '@cerebro/data-core';

export default function MissionControlPage() {
  // Initialize the central refresh coordinator hook
  useDashboardRefreshCoordinator();

  // Retrieve all registered widgets for the dashboard
  const widgets = WidgetRegistry.getAll().filter(w => w.defaultVisibility);

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Mission Control
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Overview of Cerebro Hive operations and connected models.
        </p>
      </header>
      
      {/* 
        M3 CSS Grid Canvas. 
        Widgets define their row/col spans via metadata.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
        {widgets.map(widget => (
          <div 
            key={widget.id} 
            className="flex flex-col"
            style={{ 
              gridColumn: `span ${widget.columnSpan} / span ${widget.columnSpan}`, 
              gridRow: `span ${widget.rowSpan} / span ${widget.rowSpan}` 
            }}
          >
            <WidgetHost 
              widgetId={widget.id} 
              definition={widget} 
            />
          </div>
        ))}

        {widgets.length === 0 && (
          <div className="col-span-full py-12 flex items-center justify-center border-2 border-dashed border-[var(--color-border-muted)] rounded-[var(--radius-lg)]">
            <span className="text-[var(--color-text-muted)]">No widgets registered for this dashboard.</span>
          </div>
        )}
      </div>
    </div>
  );
}
