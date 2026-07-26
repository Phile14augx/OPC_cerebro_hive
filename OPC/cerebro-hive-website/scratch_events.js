const fs = require('fs');
const path = require('path');

const packagesDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages');
const eventsDir = path.join(packagesDir, 'events');
const srcDir = path.join(eventsDir, 'src');

fs.mkdirSync(srcDir, { recursive: true });

// package.json
fs.writeFileSync(path.join(eventsDir, 'package.json'), JSON.stringify({
  name: "@cerebro/events",
  version: "0.1.0",
  private: true,
  main: "src/index.ts",
  dependencies: {
    "mitt": "^3.0.1"
  }
}, null, 2));

// 1. Event Types & Taxonomy
fs.writeFileSync(path.join(srcDir, 'EventTypes.ts'), `
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
`);

// 2. Typed Bus Wrapper
fs.writeFileSync(path.join(srcDir, 'EventBus.ts'), `
import mitt from 'mitt';
import { PlatformEventMap } from './EventTypes';

// Hidden implementation detail
const emitter = mitt<PlatformEventMap>();

export class PlatformEventBus {
  static publish<K extends keyof PlatformEventMap>(type: K, event: PlatformEventMap[K]) {
    emitter.emit(type, event);
    // Future middleware hook point for WebSockets/NATS here
  }

  static subscribe<K extends keyof PlatformEventMap>(type: K, handler: (event: PlatformEventMap[K]) => void) {
    emitter.on(type, handler);
    return () => emitter.off(type, handler);
  }
}
`);

// 3. Index Export
fs.writeFileSync(path.join(srcDir, 'index.ts'), `
export * from './EventTypes';
export * from './EventBus';
`);

console.log('Phase 1: EventBus generated successfully');
