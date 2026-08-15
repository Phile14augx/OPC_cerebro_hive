import { NextResponse } from "next/server";
import { getDb } from "@/lib/data";
import { getRuntime } from "@/lib/agents";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const skill = getDb().skills.getBySlug(slug);
  if (!skill) return NextResponse.json({ error: "unknown skill" }, { status: 404 });
  const run = await getRuntime(getDb()).run(skill.agentId);
  return NextResponse.json({ skill, run });
}
