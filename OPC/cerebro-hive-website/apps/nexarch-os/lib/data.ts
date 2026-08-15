import { openDb, type NexarchDb } from "./db";
import { seedNexarch } from "./seed";

let singleton: NexarchDb | null = null;

export function getDb(): NexarchDb {
  if (!singleton) {
    singleton = openDb();
    seedNexarch(singleton);
  }
  return singleton;
}

export function resetDbSingleton(): void {
  if (singleton) {
    singleton.close();
    singleton = null;
  }
}
