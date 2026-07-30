/**
 * Per hiveforge/00-FOUNDATION.md §3 (Capability inventory, amended per
 * Amendment 1 to include HiveDatabase — eight capabilities, all Planned
 * status). This is vocabulary only: which capabilities exist, not their
 * service catalogs (hiveforge/02-SERVICE-CATALOG.md) or implementations.
 */
export const HiveCapability = {
  HiveCompute: 'HiveCompute',
  HiveStorage: 'HiveStorage',
  HiveNetwork: 'HiveNetwork',
  HiveIdentity: 'HiveIdentity',
  HiveGateway: 'HiveGateway',
  HiveConsole: 'HiveConsole',
  HiveShield: 'HiveShield',
  HiveDatabase: 'HiveDatabase',
} as const;

export type HiveCapability = (typeof HiveCapability)[keyof typeof HiveCapability];
