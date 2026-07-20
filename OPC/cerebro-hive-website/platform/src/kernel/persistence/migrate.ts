import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

/** Plain-SQL, ordered, recorded migrations (no engine downloads, CI-friendly). */
export async function migrate(databaseUrl: string, dir?: string): Promise<string[]> {
  const migrationsDir = dir ?? join(dirname(fileURLToPath(import.meta.url)), "../../../migrations");
  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  const applied: string[] = [];
  try {
    await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
    const done = new Set((await client.query("SELECT name FROM schema_migrations")).rows.map(r => r.name as string));
    const files = readdirSync(migrationsDir).filter(f => f.endsWith(".sql")).sort();
    for (const file of files) {
      if (done.has(file)) continue;
      const sqlText = readFileSync(join(migrationsDir, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sqlText);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
        await client.query("COMMIT");
        applied.push(file);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`migration ${file} failed: ${String(err)}`);
      }
    }
  } finally {
    await client.end();
  }
  return applied;
}

if (process.argv[1] && process.argv[1].endsWith("migrate.ts")) {
  const url = process.env.DATABASE_URL ?? "postgresql://cerebrohive:dev@127.0.0.1:5433/cerebro_platform";
  migrate(url).then(a => { console.log("applied:", a.length ? a : "(none)"); process.exit(0); })
    .catch(err => { console.error(err); process.exit(1); });
}
