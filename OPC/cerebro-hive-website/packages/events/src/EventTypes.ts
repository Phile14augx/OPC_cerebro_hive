
export interface BaseEvent {
  timestamp: Date;
  source: string;
}

// UI Category
export interface UIEvent extends BaseEvent {
  type: 'THEME_CHANGED' | 'DENSITY_CHANGED';
  payload: Record<string, any>;
}

// Widget Category
export interface WidgetEvent extends BaseEvent {
  type: 'WIDGET_MOUNTED' | 'WIDGET_REFRESHED' | 'WIDGET_ERROR';
  widgetId: string;
  durationMs?: number;
}

// Telemetry Category
export interface TelemetryEvent extends BaseEvent {
  type: 'METRICS_UPDATED' | 'ALERT_TRIGGERED' | 'SYSTEM_DEGRADED';
  severity: 'info' | 'warning' | 'critical';
  details: Record<string, any>;
}

// Copilot Category
export interface CopilotEvent extends BaseEvent {
  type: 'AI_COMMAND_EXECUTED' | 'AI_SUGGESTION_REJECTED';
  commandId: string;
}

// The master typed map
export interface PlatformEventMap {
  'ui:event': UIEvent;
  'widget:event': WidgetEvent;
  'telemetry:event': TelemetryEvent;
  'copilot:event': CopilotEvent;
  // Others to be added as Epics are built
}
