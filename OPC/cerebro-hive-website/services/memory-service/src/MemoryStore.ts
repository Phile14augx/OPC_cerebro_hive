
import { WorkingMemory, EpisodicMemory } from '@cerebro/memory-sdk';

export class MemoryStore {
  private workingDb = new Map<string, WorkingMemory>();
  private episodicDb = new Map<string, EpisodicMemory>();

  // Working Memory is ephemeral
  saveWorkingMemory(mem: WorkingMemory) {
    this.workingDb.set(mem.ownerId, mem);
  }
  
  getWorkingMemory(ownerId: string) {
    return this.workingDb.get(ownerId);
  }

  deleteWorkingMemory(ownerId: string) {
    this.workingDb.delete(ownerId);
  }

  // Episodic Memory is persistent
  saveEpisodicMemory(mem: EpisodicMemory) {
    this.episodicDb.set(mem.id, mem);
  }
}
