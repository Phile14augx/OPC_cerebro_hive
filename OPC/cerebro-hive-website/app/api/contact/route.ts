export const dynamic = "force-static";
import { NextResponse } from "next/server";
import { insertItem } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Name, email, subject, and message are required" }, { status: 400 });
    }

    const newContact = await insertItem("contacts", {
      name,
      email,
      subject,
      message
    });

    return NextResponse.json({ contact: newContact }, { status: 201 });
  } catch (error) {
    console.error("API Error in POST /api/contact:", error);
    return NextResponse.json({ error: "Failed to record contact request" }, { status: 500 });
  }
}
