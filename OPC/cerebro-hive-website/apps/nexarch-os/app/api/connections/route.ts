import { NextResponse } from "next/server";
import { listConnections, listEnvConnections } from "@/lib/connectors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("probe") === "0") {
    return NextResponse.json({ connections: listEnvConnections() });
  }
  return NextResponse.json({ connections: await listConnections() });
}
