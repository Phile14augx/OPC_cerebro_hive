import { NextResponse } from "next/server";
import { getDb } from "@/lib/data";
import { computePulse } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ metrics: computePulse(getDb()) });
}
