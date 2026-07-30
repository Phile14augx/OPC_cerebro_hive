/**
 * Per hiveforge/01-DOMAIN-MODEL.md §3 (Resource lifecycle, high-level) and
 * ADR-022 (Resource Lifecycle State Machine). This slice fixes the state
 * vocabulary only — transition rules (which states allow which Operations,
 * concurrent-transition handling, idempotency) are Control Plane scope
 * (hiveforge/03-CONTROL-PLANE.md), not implemented here.
 */
export const ResourceLifecycleState = {
  Requested: 'Requested',
  Provisioning: 'Provisioning',
  Active: 'Active',
  Updating: 'Updating',
  Degraded: 'Degraded',
  Deleting: 'Deleting',
  Deleted: 'Deleted',
  Failed: 'Failed',
} as const;

export type ResourceLifecycleState =
  (typeof ResourceLifecycleState)[keyof typeof ResourceLifecycleState];
