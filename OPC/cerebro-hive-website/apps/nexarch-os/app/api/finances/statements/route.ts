import { NextResponse } from "next/server";
import { getDb } from "@/lib/data";
import { parseLedgerCsv } from "@/lib/pulse";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const text = await req.text();
  const parsed = parseLedgerCsv(text);
  if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const db = getDb();
  for (const entry of parsed.entries) db.ledger.insert(entry);
  return NextResponse.json({ inserted: parsed.entries.length });
}
