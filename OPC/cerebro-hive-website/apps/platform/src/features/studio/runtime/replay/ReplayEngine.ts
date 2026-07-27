/**
 * M24 — ReplayEngine
 *
 * Deterministic replay from an ExecutionRecording.
 * Foundation for the time-travel debugger (Chrome DevTools-style).
 * M25 will add the interactive UI; this provides the data contract.
 */
import { ExecutionRecording, RecordedEvent } from './Recording';
import { ExecutionSnapshot } from './SnapshotManager';

export type ReplayPosition = { eventIndex: number; snapshot?: ExecutionSnapshot };

export class ReplayEngine {
  private recording: ExecutionRecording;
  private position = 0;
  private listeners: ((pos: ReplayPosition, event: RecordedEvent) => void)[] = [];

  constructor(recording: ExecutionRecording) {
    this.recording = recording;
  }

  get totalEvents(): number { return this.recording.events.length; }
  get currentPosition(): number { return this.position; }
  get isAtStart(): boolean { return this.position === 0; }
  get isAtEnd(): boolean { return this.position >= this.recording.events.length; }

  onStep(listener: (pos: ReplayPosition, event: RecordedEvent) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  stepForward(): RecordedEvent | null {
    if (this.isAtEnd) return null;
    const event = this.recording.events[this.position];
    this.position++;
    const snap = this.getNearestSnapshot();
    this.listeners.forEach(l => l({ eventIndex: this.position, snapshot: snap }, event));
    return event;
  }

  stepBackward(): RecordedEvent | null {
    if (this.isAtStart) return null;
    this.position--;
    const event = this.recording.events[this.position];
    const snap = this.getNearestSnapshot();
    this.listeners.forEach(l => l({ eventIndex: this.position, snapshot: snap }, event));
    return event;
  }

  seekTo(eventIndex: number): void {
    this.position = Math.max(0, Math.min(eventIndex, this.recording.events.length));
  }

  seekToNode(nodeId: string): void {
    const idx = this.recording.events.findIndex(e => e.nodeId === nodeId && e.type === 'NodeStarted');
    if (idx >= 0) this.seekTo(idx);
  }

  getEventsUpTo(eventIndex: number): RecordedEvent[] {
    return this.recording.events.slice(0, eventIndex);
  }

  private getNearestSnapshot(): ExecutionSnapshot | undefined {
    return [...this.recording.snapshots].reverse().find(s => s.eventIndex <= this.position);
  }
}
