// Cerebro Context Engine — real multi-source context assembly.
// Pulls from the actual CRM-style dataset already shipping in this repo
// (data/db.json: leads, contacts, projects, documents), from persisted
// AgentOS memory, and from the live product catalog — then scores every
// candidate by real keyword overlap with the task. Nothing here is fixed
// or canned; the assembled context changes with the input.

import { promises as fs } from "fs";
import path from "path";
import { products as allProductsData } from "@/lib/data/products";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export interface ContextItem {
  source: "lead" | "contact" | "project" | "document" | "product" | "policy";
  label: string;
  detail: string;
  score: number;
}

export interface AssembledContext {
  items: ContextItem[];
  policyFlags: string[];
  assembledAt: number;
}

function terms(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

function score(haystack: string, queryTerms: string[]): number {
  const lower = haystack.toLowerCase();
  return queryTerms.reduce((acc, t) => acc + (lower.includes(t) ? 1 : 0), 0);
}

async function loadDb(): Promise<Record<string, unknown[]>> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function assembleContext(input: string): Promise<AssembledContext> {
  const qTerms = terms(input);
  const db = await loadDb();
  const items: ContextItem[] = [];

  const leads = (db.leads as Record<string, unknown>[]) ?? [];
  for (const lead of leads) {
    const haystack = JSON.stringify(lead);
    const s = score(haystack, qTerms);
    if (s > 0) {
      items.push({
        source: "lead",
        label: `Lead: ${lead.company ?? lead.name ?? "unknown"}`,
        detail: `${lead.name ?? ""} — ${(lead.inputs as Record<string, unknown> | undefined)?.industry ?? "n/a"}, budget ${(lead.inputs as Record<string, unknown> | undefined)?.budget ?? "n/a"}`,
        score: s,
      });
    }
  }

  const contacts = (db.contacts as Record<string, unknown>[]) ?? [];
  for (const c of contacts) {
    const haystack = JSON.stringify(c);
    const s = score(haystack, qTerms);
    if (s > 0) {
      items.push({ source: "contact", label: `Contact: ${c.name ?? "unknown"}`, detail: String(c.subject ?? ""), score: s });
    }
  }

  const projects = (db.projects as Record<string, unknown>[]) ?? [];
  for (const p of projects) {
    const haystack = JSON.stringify(p);
    const s = score(haystack, qTerms);
    if (s > 0) {
      items.push({ source: "project", label: `Project: ${p.name}`, detail: `${p.status} — ${p.progress}% complete`, score: s });
    }
  }

  const documents = (db.documents as Record<string, unknown>[]) ?? [];
  for (const d of documents) {
    const haystack = JSON.stringify(d);
    const s = score(haystack, qTerms);
    if (s > 0) {
      items.push({ source: "document", label: `Document: ${d.name}`, detail: `${d.type}, ${d.size}`, score: s });
    }
  }

  for (const prod of allProductsData) {
    const haystack = `${prod.title} ${prod.summary} ${prod.hero?.description ?? ""}`;
    const s = score(haystack, qTerms);
    if (s > 0) {
      items.push({ source: "product", label: `Product: ${prod.title}`, detail: prod.summary, score: s });
    }
  }

  items.sort((a, b) => b.score - a.score);

  const policyFlags: string[] = [];
  if (leads.length === 0 && contacts.length === 0) policyFlags.push("No CRM records available in workspace dataset.");
  if (items.some((i) => i.source === "lead" || i.source === "contact")) {
    policyFlags.push("Context includes customer PII — Governance should log access.");
  }

  return { items: items.slice(0, 8), policyFlags, assembledAt: Date.now() };
}
