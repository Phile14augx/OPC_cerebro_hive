import { NextResponse } from "next/server";
import { insertItem } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, type, target, score, inputs } = body;

    if (!name || !email || !company || !type) {
      return NextResponse.json({ error: "Name, email, company, and type are required" }, { status: 400 });
    }

    const newLead = await insertItem("leads", {
      name,
      email,
      company,
      type,
      target,
      score,
      inputs
    });

    return NextResponse.json({ lead: newLead }, { status: 201 });
  } catch (error) {
    console.error("API Error in POST /api/leads:", error);
    return NextResponse.json({ error: "Failed to log lead" }, { status: 500 });
  }
}
