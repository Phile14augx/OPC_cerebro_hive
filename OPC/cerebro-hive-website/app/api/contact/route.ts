import { NextResponse } from "next/server";
import { insertItem } from "@/lib/db";
import { guardMutatingRequest, parseJsonBody } from "@/lib/security/guard";
import { contactSchema } from "@/lib/security/schemas";

export async function POST(request: Request) {
  const guard = await guardMutatingRequest(request, { routeName: "contact", limit: 5, windowMs: 60_000 });
  if (!guard.ok) return guard.response;

  const parsedBody = await parseJsonBody(request);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = contactSchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const newContact = await insertItem("contacts", parsed.data);
    return NextResponse.json({ contact: newContact }, { status: 201 });
  } catch (error) {
    console.error("API Error in POST /api/contact:", error);
    return NextResponse.json({ error: "Failed to record contact request" }, { status: 500 });
  }
}
