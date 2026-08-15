import { NextResponse } from "next/server";
import { getDb } from "@/lib/data";
import { computePulse } from "@/lib/pulse";
import { listEnvConnections } from "@/lib/connectors";

export const dynamic = "force-dynamic";

export function GET() {
  const db = getDb();
  return NextResponse.json({
    pulse: computePulse(db),
    history: db.pulse.list(),
    connections: listEnvConnections().map((c) => ({ id: c.id, status: c.status })),
    source: "seed-history + live env connectors",
  });
}
