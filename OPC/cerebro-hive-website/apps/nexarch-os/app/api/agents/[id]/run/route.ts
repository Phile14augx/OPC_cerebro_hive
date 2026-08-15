import { NextResponse } from "next/server";
import { getDb } from "@/lib/data";
import { getRuntime } from "@/lib/agents";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const db = getDb();
  if (!db.agents.get(id)) {
    return NextResponse.json({ error: `unknown agent: ${id}` }, { status: 404 });
  }
  const run = await getRuntime(db).run(id);
  return NextResponse.json(run);
}
