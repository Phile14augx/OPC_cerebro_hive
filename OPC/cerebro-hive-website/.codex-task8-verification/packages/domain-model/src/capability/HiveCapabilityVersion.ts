/**
 * A semantic-version string identifying one revision of a capability's
 * declared support surface (per hiveforge/01-PLATFORM-ARCHITECTURE.md §2's
 * capability-discovery principle). Kept as a lightly-validated string, not
 * a parsed {major,minor,patch} struct — nothing in this slice needs range
 * arithmetic; a future slice can introduce that without changing this type.
 */
export type HiveCapabilityVersion = string;

const SEMVER_SHAPE = /^\d+\.\d+\.\d+(-[0-9A-Za-z-.]+)?$/;

export function isHiveCapabilityVersion(value: unknown): value is HiveCapabilityVersion {
  return typeof value === 'string' && SEMVER_SHAPE.test(value);
}
