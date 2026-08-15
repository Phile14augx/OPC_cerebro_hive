import type { NexarchDb } from "./db";
import type { LedgerEntry } from "./schemas";

export type PulseLive = {
  agentsActive: number;
  openComms: number;
  openTasks: number;
  runwayMonths: number;
};

export function ledgerTotals(entries: LedgerEntry[]) {
  let income = 0;
  let spend = 0;
  const byCategory: Record<string, number> = {};
  for (const e of entries) {
    if (e.direction === "in") income += e.amountUsd;
    else {
      spend += e.amountUsd;
      byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amountUsd;
    }
  }
  return { income, spend, net: income - spend, byCategory };
}

export function computePulse(db: NexarchDb): PulseLive {
  const agentsActive = db.agents.list().filter((a) => a.status === "active").length;
  const openComms = db.comms.list().filter((c) => c.status === "open").length;
  const openTasks = db.tasks.list().filter((t) => t.status !== "done").length;
  const { income, spend } = ledgerTotals(db.ledger.list());
  const monthlySpend = Math.max(spend / 2, 1);
  const cash = Math.max(income - spend, 0) + 8000;
  const runwayMonths = cash / monthlySpend;
  return { agentsActive, openComms, openTasks, runwayMonths };
}

export function parseLedgerCsv(text: string): { entries: Omit<LedgerEntry, "id">[]; error?: string } {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return { entries: [], error: "CSV needs a header and at least one row." };
  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idx = {
    date: header.indexOf("date"),
    description: header.indexOf("description"),
    category: header.indexOf("category"),
    amount: header.indexOf("amount"),
    direction: header.indexOf("direction"),
  };
  if (Object.values(idx).some((i) => i < 0)) {
    return { entries: [], error: "Header must include date,description,category,amount,direction." };
  }
  const entries: Omit<LedgerEntry, "id">[] = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(",").map((c) => c.trim());
    const direction = cols[idx.direction];
    const amount = Number(cols[idx.amount]);
    if (direction !== "in" && direction !== "out") {
      return { entries: [], error: `Invalid direction "${direction}". Use in or out.` };
    }
    if (!Number.isFinite(amount)) {
      return { entries: [], error: `Invalid amount "${cols[idx.amount]}".` };
    }
    entries.push({
      date: cols[idx.date],
      description: cols[idx.description],
      category: cols[idx.category],
      amountUsd: Math.abs(amount),
      direction,
    });
  }
  return { entries };
}
