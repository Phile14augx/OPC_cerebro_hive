import { NextRequest, NextResponse } from "next/server";
import { getAudit } from "@/lib/agent-os/store";

export const dynamic = "force-dynamic";

// GET /api/nexarch/events?entityType=&entityId=&limit=50&offset=0
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const entityType = searchParams.get("entityType") ?? undefined;
  const entityId   = searchParams.get("entityId")   ?? undefined;
  const limit      = Number(searchParams.get("limit")  ?? 50);
  const offset     = Number(searchParams.get("offset") ?? 0);

  const events = await getAudit({ entityType, entityId, limit, offset });
  return NextResponse.json({ data: events, count: events.length });
}
