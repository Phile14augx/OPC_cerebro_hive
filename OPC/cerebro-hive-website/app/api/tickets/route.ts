import { NextResponse } from "next/server";
import { getCollection, insertItem } from "@/lib/db";

export async function GET() {
  try {
    const tickets = await getCollection("tickets");
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("API Error in GET /api/tickets:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, message } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }

    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = await insertItem("tickets", {
      id: ticketId,
      subject,
      message,
      status: "Open",
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })
    });

    return NextResponse.json({ ticket: newTicket }, { status: 201 });
  } catch (error) {
    console.error("API Error in POST /api/tickets:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
