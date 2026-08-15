import { NextResponse } from "next/server";
import { getDb } from "@/lib/data";
import { getRuntime } from "@/lib/agents";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = getDb();
  const wf = db.workflows.get(id);
  if (!wf) return NextResponse.json({ error: "unknown workflow" }, { status: 404 });
  const steps = JSON.parse(wf.stepsJson) as string[];
  const runtime = getRuntime(db);
  const results = [];
  for (const agentId of steps) {
    results.push(await runtime.run(agentId));
  }
  const summary = results.map((r) => `${r.agentId}:${r.ok ? "ok" : "fail"}`).join(" → ");
  db.workflows.recordRun(id, summary);
  return NextResponse.json({ summary, results });
}
