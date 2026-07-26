import React from 'react';
import { WidgetDefinition, WidgetState } from './WidgetRegistry';
import { WidgetLifecycle } from './WidgetLifecycle';

export interface WidgetHostProps {
  widgetId: string;
  definition: WidgetDefinition;
  config?: Record<string, any>;
}

export const WidgetHost: React.FC<WidgetHostProps> = ({ widgetId, definition, config = {} }) => {
  const [state, setState] = React.useState<WidgetState>('loading');
  const Component = definition.component;

  // Render wrapper with standard empty/error/loading boundaries
  return (
    <div 
      data-widget-id={widgetId}
      className="bg-[var(--color-surface-default)] rounded-[var(--radius-lg)] border border-[var(--color-border-default)] flex flex-col h-full overflow-hidden"
    >
      {/* Standardized Header */}
      <header className="px-4 py-3 border-b border-[var(--color-border-muted)] flex justify-between items-center bg-[var(--color-surface-subtle)]">
        <div className="flex items-center gap-2">
          {/* We would use the IconRegistry here */}
          <span className="text-sm font-medium text-[var(--color-text-primary)]">{definition.title}</span>
        </div>
        <div className="flex items-center gap-2">
           {/* Actions like refresh, settings, remove */}
        </div>
      </header>

      {/* Standardized Content Area */}
      <div className="flex-1 p-4 overflow-y-auto relative">
        {state === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-default)]/80 z-10">
             <span className="text-sm text-[var(--color-text-muted)] animate-pulse">Loading...</span>
          </div>
        )}
        
        {state === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-surface-default)] z-10">
             <span className="text-sm text-[var(--color-text-danger)]">Failed to load widget</span>
          </div>
        )}

        {/* The actual product capability */}
        <Component 
          instanceId={widgetId} 
          state={state} 
          onStateChange={setState} 
          config={config} 
        />
      </div>
    </div>
  );
};
