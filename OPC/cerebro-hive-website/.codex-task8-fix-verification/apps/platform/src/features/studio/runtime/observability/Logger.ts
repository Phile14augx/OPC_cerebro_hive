/**
 * M24 — Structured Logger
 * Context-aware structured logger, injectable via ExecutionContext.provide().
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  timestamp: number;
  executionId?: string;
  nodeId?: string;
  message: string;
  data?: unknown;
}

export class StructuredLogger {
  private entries: LogEntry[] = [];
  private executionId?: string;
  private nodeId?: string;
  private minLevel: LogLevel;

  private static LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

  constructor(opts: { executionId?: string; minLevel?: LogLevel } = {}) {
    this.executionId = opts.executionId;
    this.minLevel = opts.minLevel ?? 'info';
  }

  withNode(nodeId: string): StructuredLogger {
    const child = new StructuredLogger({ executionId: this.executionId, minLevel: this.minLevel });
    child.nodeId = nodeId;
    child.entries = this.entries; // shared log
    return child;
  }

  private shouldLog(level: LogLevel): boolean {
    return StructuredLogger.LEVEL_ORDER[level] >= StructuredLogger.LEVEL_ORDER[this.minLevel];
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;
    const entry: LogEntry = { level, timestamp: Date.now(), executionId: this.executionId, nodeId: this.nodeId, message, data };
    this.entries.push(entry);
    const prefix = `[Studio:${this.executionId?.slice(0, 6) ?? '?'}${this.nodeId ? `:${this.nodeId}` : ''}]`;
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(`${prefix} ${message}`, data !== undefined ? data : '');
  }

  debug(msg: string, data?: unknown): void { this.log('debug', msg, data); }
  info(msg: string, data?: unknown): void { this.log('info', msg, data); }
  warn(msg: string, data?: unknown): void { this.log('warn', msg, data); }
  error(msg: string, data?: unknown): void { this.log('error', msg, data); }

  getEntries(): LogEntry[] { return [...this.entries]; }
}
