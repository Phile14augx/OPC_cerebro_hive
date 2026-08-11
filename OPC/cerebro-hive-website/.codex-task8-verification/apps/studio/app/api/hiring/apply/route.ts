import { NextResponse } from "next/server";
import { insertItem } from "@/lib/db";
import { guardMutatingRequest, parseJsonBody } from "@/lib/security/guard";
import { jobApplicationSchema } from "@/lib/security/schemas";
import { runHiringPipeline } from "@/lib/hiring/pipeline";

/**
 * Fully automated hiring pipeline endpoint. An applicant submits their resume
 * text + LinkedIn URL for a role; the AI screens them against the role, and —
 * with no human intervention — the pipeline runs straight through 7 technical
 * rounds and 3 HR rounds to either an automatically generated offer or a
 * rejection at whichever stage they didn't clear. The full stage-by-stage
 * result is returned synchronously and persisted for audit purposes.
 */
export async function POST(request: Request) {
  const guard = await guardMutatingRequest(request, { routeName: "hiring-apply", limit: 5, windowMs: 60_000, maxBodyBytes: 60_000 });
  if (!guard.ok) return guard.response;

  const parsedBody = await parseJsonBody(request);
  if (!parsedBody.ok) return parsedBody.response;

  const parsed = jobApplicationSchema.safeParse(parsedBody.body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = runHiringPipeline(parsed.data);

    const saved = await insertItem("applications", {
      applicantName: parsed.data.applicantName,
      applicantEmail: parsed.data.applicantEmail,
      roleTitle: parsed.data.roleTitle,
      resumeText: parsed.data.resumeText,
      linkedinUrl: parsed.data.linkedinUrl,
      status: result.status,
      screening: result.screening,
      technicalRounds: result.technicalRounds,
      hrRounds: result.hrRounds,
      offer: result.offer,
      summary: result.summary,
    });

    return NextResponse.json({ application: saved, pipeline: result }, { status: 201 });
  } catch (error) {
    console.error("API Error in POST /api/hiring/apply:", error);
    return NextResponse.json({ error: "Failed to process application" }, { status: 500 });
  }
}
