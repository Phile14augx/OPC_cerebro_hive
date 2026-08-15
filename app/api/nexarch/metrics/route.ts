import { NextResponse } from "next/server";
import { getMetrics } from "@/lib/agent-os/store";

export const dynamic = "force-dynamic";

// GET /api/nexarch/metrics
// Returns aggregated platform-level metrics for the Command Center dashboard.
export async function GET() {
  try {
    const metrics = await getMetrics();
    return NextResponse.json({ data: metrics });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
