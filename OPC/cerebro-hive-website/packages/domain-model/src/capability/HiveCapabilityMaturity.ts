/**
 * A capability descriptor's maturity — distinct from the documentation-only
 * evidence-status legend (Verified/Approved/Planned/Vision/Open Decision,
 * hiveforge/00-FOUNDATION.md §0). That legend describes *this masterplan's
 * documents*; this describes a *runtime capability instance's* maturity,
 * the way a real deployed service would report it. The two are not the same
 * axis and should not be conflated.
 */
export const HiveCapabilityMaturity = {
  Experimental: 'Experimental',
  Beta: 'Beta',
  Stable: 'Stable',
  Deprecated: 'Deprecated',
} as const;

export type HiveCapabilityMaturity =
  (typeof HiveCapabilityMaturity)[keyof typeof HiveCapabilityMaturity];
