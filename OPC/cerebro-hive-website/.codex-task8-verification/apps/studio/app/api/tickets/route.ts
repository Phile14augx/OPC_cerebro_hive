import { NextResponse } from "next/server";
import { getCollection, insertItem } from "@/lib/db";
import { guardMutatingRequest, guardReadRequest, parseJsonBody } from "@/lib/security/guard";
import { ticketSchema } from "@/lib/security/schemas";

export async function GET(request: Request) {
  const guard = await guardReadRequest(request, { routeName: "tickets:get", limit: 60, windowMs: 60_000 });
  if (!guard.ok) return guard.response;

  try {
    const tickets = await getCollection("tickets");
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("API Error in GET /api/tickets:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await guardMutatingRequest(request, { routeName: "tickets:post", limit: 10, windowMs: 60_000 });
  if (!guard.ok) return guard.response;

  const parsedBody = await parseJsonBody(request);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = ticketSchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = await insertItem("tickets", {
      id: ticketId,
      subject: parsed.data.subject,
      message: parsed.data.message,
      status: "Open",
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" }),
    });

    return NextResponse.json({ ticket: newTicket }, { status: 201 });
  } catch (error) {
    console.error("API Error in POST /api/tickets:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
