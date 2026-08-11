import { NextResponse } from "next/server";
import { insertItem } from "@/lib/db";
import { guardMutatingRequest, parseJsonBody } from "@/lib/security/guard";
import { leadSchema } from "@/lib/security/schemas";

export async function POST(request: Request) {
  const guard = await guardMutatingRequest(request, { routeName: "leads", limit: 10, windowMs: 60_000 });
  if (!guard.ok) return guard.response;

  const parsedBody = await parseJsonBody(request);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = leadSchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const newLead = await insertItem("leads", parsed.data);
    return NextResponse.json({ lead: newLead }, { status: 201 });
  } catch (error) {
    console.error("API Error in POST /api/leads:", error);
    return NextResponse.json({ error: "Failed to log lead" }, { status: 500 });
  }
}
