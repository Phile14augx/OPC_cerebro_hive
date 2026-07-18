import { NextResponse } from "next/server";
import { getCollection, insertItem } from "@/lib/db";
import { guardMutatingRequest, guardReadRequest, parseJsonBody } from "@/lib/security/guard";
import { academyEnrollSchema } from "@/lib/security/schemas";
import { z } from "zod";

const emailQuerySchema = z.string().trim().email().max(320);

export async function GET(request: Request) {
  const guard = await guardReadRequest(request, { routeName: "academy-enroll:get", limit: 60, windowMs: 60_000 });
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const emailParam = url.searchParams.get("email");
  const parsedEmail = emailQuerySchema.safeParse(emailParam);
  if (!parsedEmail.success) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  try {
    const enrollments = await getCollection("enrollments");
    const userEnrollments = enrollments.filter((e) => e.email.toLowerCase() === parsedEmail.data.toLowerCase());
    const courseSlugs = userEnrollments.map((e) => e.courseSlug);

    return NextResponse.json({ courseSlugs });
  } catch (error) {
    console.error("API Error in GET /api/academy/enroll:", error);
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const guard = await guardMutatingRequest(request, { routeName: "academy-enroll:post", limit: 10, windowMs: 60_000 });
  if (!guard.ok) return guard.response;

  const parsedBody = await parseJsonBody(request);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = academyEnrollSchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { email, courseSlug } = parsed.data;

  try {
    const enrollments = await getCollection("enrollments");
    const exists = enrollments.some(
      (e) => e.email.toLowerCase() === email.toLowerCase() && e.courseSlug === courseSlug
    );

    if (exists) {
      return NextResponse.json({ message: "Already enrolled", courseSlug });
    }

    const newEnrollment = await insertItem("enrollments", { email, courseSlug });

    return NextResponse.json({ enrollment: newEnrollment }, { status: 201 });
  } catch (error) {
    console.error("API Error in POST /api/academy/enroll:", error);
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}
