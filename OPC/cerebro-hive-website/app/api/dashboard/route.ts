import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { guardReadRequest } from "@/lib/security/guard";

// SECURITY NOTE: same caveat as app/api/enterprise/employees/route.ts — this
// returns demo/seed data with no authentication. Flagged in the security
// roadmap doc as a P0 before any real customer data lands here.

export async function GET(request: Request) {
  const guard = await guardReadRequest(request, { routeName: "dashboard:get", limit: 60, windowMs: 60_000 });
  if (!guard.ok) return guard.response;

  try {
    const projects = await getCollection("projects");
    const invoices = await getCollection("invoices");
    const documents = await getCollection("documents");
    return NextResponse.json({ projects, invoices, documents });
  } catch (error) {
    console.error("API Error in /api/dashboard:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
