import { NextResponse } from "next/server";
import { getCollection, insertItem } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const enrollments = await getCollection("enrollments");
    const userEnrollments = enrollments.filter((e) => e.email.toLowerCase() === email.toLowerCase());
    const courseSlugs = userEnrollments.map((e) => e.courseSlug);

    return NextResponse.json({ courseSlugs });
  } catch (error) {
    console.error("API Error in GET /api/academy/enroll:", error);
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, courseSlug } = body;

    if (!email || !courseSlug) {
      return NextResponse.json({ error: "Email and courseSlug are required" }, { status: 400 });
    }

    const enrollments = await getCollection("enrollments");
    const exists = enrollments.some(
      (e) => e.email.toLowerCase() === email.toLowerCase() && e.courseSlug === courseSlug
    );

    if (exists) {
      return NextResponse.json({ message: "Already enrolled", courseSlug });
    }

    const newEnrollment = await insertItem("enrollments", {
      email,
      courseSlug
    });

    return NextResponse.json({ enrollment: newEnrollment }, { status: 201 });
  } catch (error) {
    console.error("API Error in POST /api/academy/enroll:", error);
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}
