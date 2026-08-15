import { openDb } from "../lib/db";
import { seedNexarch } from "../lib/seed";

const db = openDb(":memory:");
seedNexarch(db, { force: true });
console.log(`Seeded ${db.agents.list().length} agents for ${db.meta.get("company")}.`);
db.close();
