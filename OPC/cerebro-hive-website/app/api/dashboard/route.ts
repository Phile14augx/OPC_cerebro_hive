import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";

export async function GET() {
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
