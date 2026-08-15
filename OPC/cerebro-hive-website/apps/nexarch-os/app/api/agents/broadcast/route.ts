import { NextResponse } from "next/server";
import { getDb } from "@/lib/data";
import { getRuntime } from "@/lib/agents";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as { message?: string };
  const message = body.message?.trim();
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });
  const result = await getRuntime(getDb()).broadcast(message);
  return NextResponse.json(result);
}
