import { NextResponse } from "next/server";
import { getTools } from "@/lib/agent-os/store";

export const dynamic = "force-dynamic";

// GET /api/nexarch/tools
export async function GET() {
  const tools = await getTools();
  return NextResponse.json({ data: tools, count: tools.length });
}
