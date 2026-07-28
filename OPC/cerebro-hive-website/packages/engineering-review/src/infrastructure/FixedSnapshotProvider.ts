import { ISnapshotProvider, ReviewSnapshot } from '../ports/ISnapshotProvider';

/**
 * Slice 2's only snapshot provider: returns the same, constructor-supplied
 * snapshot for every workflow. Deliberately not "real" — validating that the
 * orchestrator and contributor contract fit together doesn't require a real
 * capability-registry/platform-version resolver yet (roadmap: "keep
 * infrastructure intentionally simple").
 */
export class FixedSnapshotProvider implements ISnapshotProvider {
  constructor(private readonly snapshot: ReviewSnapshot) {}

  async getSnapshot(_workflowId: string): Promise<ReviewSnapshot> {
    return this.snapshot;
  }
}
