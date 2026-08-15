import { NextResponse } from "next/server";
import { getDb } from "@/lib/data";
import { searchBrain } from "@/lib/brain";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q) {
    return NextResponse.json({
      nodes: getDb().knowledge.nodes(),
      provider: "grep",
      detail: "Pass ?q= for search. pgvector runs only when DATABASE_URL and OPENAI_API_KEY are set.",
    });
  }
  const result = await searchBrain(q);
  return NextResponse.json(result);
}
