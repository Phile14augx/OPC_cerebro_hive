/**
 * Phase 9g-5 — a minimal structured-logging abstraction. Deliberately NOT a
 * dependency on a real logging library (pino, winston, etc.) or a real log
 * shipper — nothing in this sandbox can verify a real log pipeline delivers
 * anything anywhere. The shape here (leveled methods taking a message plus a
 * structured-fields object) is a common-enough convention that a real
 * adapter wrapping pino/winston could satisfy it later without caller-side
 * changes (see `ADR-050`).
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogFields {
  readonly [key: string]: unknown;
}

export interface Logger {
  debug(message: string, fields?: LogFields): void;
  info(message: string, fields?: LogFields): void;
  warn(message: string, fields?: LogFields): void;
  error(message: string, fields?: LogFields): void;
}

export interface RecordedLogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly fields: LogFields;
  readonly loggedAt: Date;
}

/** Standalone, in-memory reference `Logger` — real, not a test double.
 * Records every call for later introspection via `getEntries()`. */
export class InMemoryStructuredLogger implements Logger {
  private readonly entries: RecordedLogEntry[] = [];

  debug(message: string, fields: LogFields = {}): void {
    this.record('debug', message, fields);
  }

  info(message: string, fields: LogFields = {}): void {
    this.record('info', message, fields);
  }

  warn(message: string, fields: LogFields = {}): void {
    this.record('warn', message, fields);
  }

  error(message: string, fields: LogFields = {}): void {
    this.record('error', message, fields);
  }

  getEntries(): readonly RecordedLogEntry[] {
    return this.entries;
  }

  getEntriesAtLevel(level: LogLevel): readonly RecordedLogEntry[] {
    return this.entries.filter((e) => e.level === level);
  }

  clear(): void {
    this.entries.length = 0;
  }

  private record(level: LogLevel, message: string, fields: LogFields): void {
    this.entries.push({ level, message, fields, loggedAt: new Date() });
  }
}
