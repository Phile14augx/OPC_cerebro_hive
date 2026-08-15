import { PageHeader } from "@/components/PageHeader";
import { BrainQuery } from "@/components/BrainQuery";
import { PromoteButton } from "@/components/PromoteButton";
import { Badge, Panel, SectionHead } from "@/components/terminal";
import { getDb } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function BrainPage() {
  const db = getDb();
  const nodes = db.knowledge.nodes();
  const edges = db.knowledge.edges();
  const claims = db.claims.list();

  return (
    <div>
      <PageHeader eyebrow="Intelligence" title="Nexarch Brain" />
      <p className="mb-6 text-[12px] text-os-muted">
        Source → Signal → Claim → Fact → Memory. Agents write claims. You promote facts.
        pgvector runs only when Postgres and OPENAI_API_KEY are live; otherwise keyword grep.
      </p>
      <Panel className="mb-6">
        <SectionHead>Query</SectionHead>
        <div className="mt-4">
          <BrainQuery />
        </div>
      </Panel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <SectionHead>Graph</SectionHead>
          <ul className="mt-3 space-y-2">
            {nodes.map((n) => (
              <li key={n.id}>
                <div className="text-[12px] uppercase">{n.title}</div>
                <div className="text-[11px] text-os-dim">
                  {n.kind}
                  {n.path ? ` · ${n.path}` : ""}
                </div>
                <p className="text-[11px] text-os-muted">{n.summary}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-[11px] text-os-dim">
            {edges.length} edges: {edges.map((e) => `${e.fromId}→${e.toId}`).join(" · ")}
          </div>
        </Panel>
        <Panel>
          <SectionHead>Truth lifecycle</SectionHead>
          <ul className="mt-3 space-y-3">
            {claims.map((c) => (
              <li key={c.id} className="border border-os-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge>{c.status}</Badge>
                  <span className="text-[11px] text-os-dim">{c.createdBy}</span>
                </div>
                <p className="mt-2 text-[12px]">{c.text}</p>
                {c.status === "claim" || c.status === "signal" ? (
                  <div className="mt-2">
                    <PromoteButton claimId={c.id} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
