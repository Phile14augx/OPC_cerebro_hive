import { ExecutionStore } from '../ExecutionStore';
import { Buffer } from 'buffer';

export interface ArchiveStorage {
  uploadArchive(executionId: string, serializedData: Buffer): Promise<string>; // Returns URI
  downloadArchive(executionId: string, uri: string): Promise<Buffer>;
}

export class ExecutionArchiveService {
  constructor(
    private readonly hotStore: ExecutionStore,
    private readonly coldStorage: ArchiveStorage
  ) {}

  /**
   * Archives executions that have been complete for > 30 days.
   * Compresses the event stream, uploads it to cold storage, and drops the events from the hot store.
   * Retains the Projection/Snapshot in the hot store.
   */
  public async archiveExecution(executionId: string): Promise<void> {
    const events = await this.hotStore.getEvents(executionId);
    if (events.length === 0) return;

    const serializedData = Buffer.from(JSON.stringify(events)); // In reality: gzip or msgpack

    const archiveUri = await this.coldStorage.uploadArchive(executionId, serializedData);

    // After successful upload, update the execution record with the archive URI
    // and delete the events from the hot database.
    await this.hotStore.updateExecution(executionId, { metadata: { archiveUri } }, -1, 0n);
    
    // In a real system, we would have a hotStore.deleteEvents() call here.
  }

  /**
   * Restores an archived event stream back into the hot database for time-travel debugging.
   */
  public async restoreExecution(executionId: string): Promise<void> {
    const exec = await this.hotStore.getExecution(executionId);
    if (!exec || !exec.metadata?.archiveUri) {
      throw new Error(`Execution ${executionId} is not archived.`);
    }

    const archiveBuffer = await this.coldStorage.downloadArchive(executionId, exec.metadata.archiveUri);
    const events = JSON.parse(archiveBuffer.toString());

    // Restore to hot store
    // Ensure we pass expectedVersion=0 or bypass concurrency for restore
    await this.hotStore.appendEvents(executionId, events, 0n);
    
    // Clear archive flag
    await this.hotStore.updateExecution(executionId, { metadata: { archiveUri: null } }, -1, 0n);
  }
}
