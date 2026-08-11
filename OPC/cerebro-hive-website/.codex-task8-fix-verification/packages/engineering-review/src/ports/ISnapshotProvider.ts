/**
 * Phase 5 §3 / Phase 6 determinism principle: everything a review needs to
 * be reproducible for a given workflow, captured once, at review time.
 * `ReviewSnapshot` is the raw material `ReviewManifest` (Phase 3) is built
 * from — this port supplies it; the orchestrator turns it into a manifest.
 */
export interface ReviewSnapshot {
  readonly snapshotId: string;
  readonly capabilityRegistrySnapshotId: string;
  readonly platformVersion: string;
  readonly featureFlags: Readonly<Record<string, boolean>>;
}

/**
 * Outbound port (Phase 4). Slice 2 ships exactly one implementation — a
 * fixed snapshot, per the roadmap's "keep infrastructure intentionally
 * simple" scope — but the orchestrator depends on this interface, not on
 * that implementation, so a real snapshot provider can replace it later
 * without the orchestrator changing.
 */
export interface ISnapshotProvider {
  getSnapshot(workflowId: string): Promise<ReviewSnapshot>;
}
