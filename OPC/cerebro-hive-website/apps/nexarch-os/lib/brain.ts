import fs from "node:fs";
import path from "node:path";
import { searchPgvector, type VectorHit } from "./hive";

export function docsRoot(): string {
  if (process.env.NEXARCH_DOCS_ROOT) return process.env.NEXARCH_DOCS_ROOT;
  return path.resolve(process.cwd(), "..", "..", "docs");
}

const SEARCH_DIRS = ["architecture", "audits", "technology", "operations/runbooks", "development"];

export type DocHit = { path: string; snippet: string };

export function searchDocs(query: string, root = docsRoot()): DocHit[] {
  const q = query.trim().toLowerCase();
  if (!q || !fs.existsSync(root)) return [];
  const hits: DocHit[] = [];
  for (const rel of SEARCH_DIRS) {
    const dir = path.join(root, rel);
    if (!fs.existsSync(dir)) continue;
    walk(dir, (file) => {
      if (hits.length >= 20) return;
      if (!file.endsWith(".md")) return;
      let text = "";
      try {
        text = fs.readFileSync(file, "utf8");
      } catch {
        return;
      }
      const idx = text.toLowerCase().indexOf(q);
      if (idx === -1) return;
      const start = Math.max(0, idx - 40);
      const snippet = text.slice(start, start + 140).replace(/\s+/g, " ").trim();
      hits.push({ path: path.relative(root, file).replaceAll("\\", "/"), snippet });
    });
    if (hits.length >= 20) break;
  }
  return hits.slice(0, 20);
}

export async function searchBrain(query: string, root = docsRoot()): Promise<{
  hits: DocHit[];
  provider: "pgvector" | "grep";
  detail: string;
  vector?: VectorHit[];
}> {
  const grep = searchDocs(query, root);
  const vector = await searchPgvector(query);
  if (vector.ok && vector.data.length > 0) {
    return {
      hits: vector.data.map((h) => ({ path: h.path, snippet: h.snippet })),
      provider: "pgvector",
      detail: `pgvector returned ${vector.data.length} hits. Grep also found ${grep.length}.`,
      vector: vector.data,
    };
  }
  const vectorDetail = vector.ok
    ? "pgvector connected but Embedding table returned 0 rows."
    : `${vector.status}: ${vector.detail}`;
  return {
    hits: grep,
    provider: "grep",
    detail: grep.length
      ? `Keyword grep over Hive docs (${grep.length} hits). ${vectorDetail}`
      : `Grep empty. ${vectorDetail}`,
  };
}

function walk(dir: string, visit: (file: string) => void, depth = 0) {
  if (depth > 4) return;
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit, depth + 1);
    else visit(full);
  }
}
