// ── Runtime type guards ───────────────────────────────────────────────────────

import type { PlatformEvent } from "../events/index.js";

export function isString(v: unknown): v is string  { return typeof v === "string"; }
export function isNumber(v: unknown): v is number  { return typeof v === "number"; }
export function isBoolean(v: unknown): v is boolean { return typeof v === "boolean"; }
export function isNull(v: unknown): v is null       { return v === null; }
export function isUndefined(v: unknown): v is undefined { return v === undefined; }
export function isNullish(v: unknown): v is null | undefined {
  return v === null || v === undefined;
}

export function isNonEmptyString(v: unknown): v is string {
  return isString(v) && v.trim().length > 0;
}

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function isArray<T>(v: unknown, guard: (item: unknown) => item is T): v is T[] {
  return Array.isArray(v) && v.every(guard);
}

export function isPlatformEvent(v: unknown): v is PlatformEvent {
  return (
    isRecord(v) &&
    isString(v["id"]) &&
    isString(v["type"]) &&
    isString(v["orgId"]) &&
    isString(v["timestamp"])
  );
}

export function assertNonNull<T>(
  value:   T | null | undefined,
  message: string,
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

export function assertDefined<T>(
  value:   T | undefined,
  message: string,
): asserts value is T {
  if (value === undefined) {
    throw new Error(message);
  }
}

export function exhaustive(value: never): never {
  throw new Error(`Exhaustive check failed: ${JSON.stringify(value)}`);
}
