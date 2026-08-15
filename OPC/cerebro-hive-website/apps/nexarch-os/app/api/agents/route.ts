import { NextResponse } from "next/server";
import { getDb } from "@/lib/data";
import { agentSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

export function GET() {
  const agents = getDb().agents.list().map((a) => agentSchema.parse(a));
  return NextResponse.json({ agents });
}
