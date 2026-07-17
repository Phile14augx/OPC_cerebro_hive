// Cerebro Memory Fabric — a real, disk-persisted, multi-tier memory store.
// Records are written to data/agentos-memory.json on every run and survive
// server restarts. This is intentionally file-based (matching the existing
// data/db.json pattern in this repo) rather than an in-memory mock.

import { promises as fs } from "fs";
import path from "path";
import { MemoryRecord, MemorySnapshot } from "./types";

const STORE_PATH = path.join(process.cwd(), "data", "agentos-memory.json");
const MAX_RECORDS = 2000; // simple retention cap so the demo file doesn't grow unbounded

async function loadAll(): Promise<MemoryRecord[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.records) ? parsed.records : [];
  } catch {
    return [];
  }
}

async function saveAll(records: MemoryRecord[]): Promise<void> {
  const trimmed = records.slice(-MAX_RECORDS);
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify({ records: trimmed }, null, 2), "utf-8");
}

let idCounter = 0;
function makeId(): string {
  idCounter += 1;
  return `mem_${Date.now().toString(36)}_${idCounter}`;
}

export async function writeMemory(
  tier: MemoryRecord["tier"],
  sessionId: string,
  content: string
): Promise<MemoryRecord> {
  const records = await loadAll();
  const record: MemoryRecord = { id: makeId(), tier, sessionId, content, createdAt: Date.now() };
  records.push(record);
  await saveAll(records);
  return record;
}

function keywordScore(haystack: string, query: string): number {
  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
  const lower = haystack.toLowerCase();
  return terms.reduce((acc, t) => acc + (lower.includes(t) ? 1 : 0), 0);
}

export async function getSnapshot(sessionId: string, queryForSemanticSearch: string): Promise<MemorySnapshot> {
  const records = await loadAll();

  const shortTerm = records
    .filter((r) => r.tier === "shortTerm" && r.sessionId === sessionId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 6);

  const episodic = records
    .filter((r) => r.tier === "episodic" && r.sessionId === sessionId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);

  const semanticPool = records.filter((r) => r.tier === "semantic");
  const semantic = semanticPool
    .map((r) => ({ record: r, score: keywordScore(r.content, queryForSemanticSearch) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((s) => s.record);

  // Organizational memory: real aggregate computed across every session on disk.
  const allEpisodic = records.filter((r) => r.tier === "episodic");
  const totalRuns = allEpisodic.length;
  const strategyCounts: Record<string, number> = {};
  for (const r of allEpisodic) {
    const match = r.content.match(/strategy=([^\s|]+)/);
    if (match) strategyCounts[match[1]] = (strategyCounts[match[1]] ?? 0) + 1;
  }
  const topStrategy = Object.entries(strategyCounts).sort((a, b) => b[1] - a[1])[0];
  const organizational: MemoryRecord[] = [
    {
      id: "org_summary",
      tier: "organizational",
      sessionId: "*",
      content: totalRuns
        ? `${totalRuns} total run(s) recorded across all sessions. Most common strategy: ${topStrategy?.[0] ?? "n/a"} (${topStrategy?.[1] ?? 0}x).`
        : "No runs recorded yet.",
      createdAt: Date.now(),
    },
  ];

  return {
    shortTerm,
    episodic,
    semantic,
    organizational,
    totalRecords: records.length,
  };
}

export async function resetSession(sessionId: string): Promise<void> {
  const records = await loadAll();
  const filtered = records.filter((r) => r.sessionId !== sessionId);
  await saveAll(filtered);
}
