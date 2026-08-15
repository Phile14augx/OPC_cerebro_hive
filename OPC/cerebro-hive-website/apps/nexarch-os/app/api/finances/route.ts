import { NextResponse } from "next/server";
import { getDb } from "@/lib/data";
import { computePulse, ledgerTotals } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export function GET() {
  const db = getDb();
  const entries = db.ledger.list();
  return NextResponse.json({ entries, totals: ledgerTotals(entries), pulse: computePulse(db) });
}
