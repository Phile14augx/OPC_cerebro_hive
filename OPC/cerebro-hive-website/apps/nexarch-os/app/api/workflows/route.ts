import { NextResponse } from "next/server";
import { getDb } from "@/lib/data";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ workflows: getDb().workflows.list() });
}
