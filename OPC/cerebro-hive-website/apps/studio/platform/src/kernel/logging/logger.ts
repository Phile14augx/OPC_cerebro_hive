import { pino, type Logger } from "pino";

export type { Logger };

export function createLogger(level: string, name = "platform"): Logger {
  return pino({ name, level, base: { service: name }, timestamp: pino.stdTimeFunctions.isoTime });
}
