import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { verifyWebhookSignature, updateIssueWithPMAnalysis } from "@/lib/github/client";
import { decomposeEpic } from "@/lib/agents/pm-agent/provider";
import { EPIC_DECOMPOSITION_PROMPT_V1 } from "@/lib/agents/pm-agent/prompts/v1-epic-decomposition";
import { createDocumentationPR } from "@/lib/github/client";
import { RELEASE_NOTES_PROMPT_V1 } from "@/lib/agents/pm-agent/prompts/v1-release-notes";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    // 1. Capture Raw Body for Signature Validation
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");

    if (!signature || !(await verifyWebhookSignature(rawBody, signature))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Bad Request: Invalid JSON payload" }, { status: 400 });
    }

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Bad Request: Malformed payload" }, { status: 400 });
    }

    // 2. We handle two types of events: issues.opened and milestone.closed
    if (payload.action === "opened" && payload.issue && typeof payload.issue === "object" && payload.repository && typeof payload.repository === "object") {

      const issue = payload.issue as { number: number; title: string; body: string };
      const repo = payload.repository as { owner: { login: string }; name: string };

      waitUntil(
        (async () => {
          const requestId = `req_${Date.now()}`;
          console.log(`[PM Agent] Intercepted new issue #${issue.number}. Analyzing...`);
          
          try {
            const analysis = await decomposeEpic(
              issue.title,
              issue.body,
              EPIC_DECOMPOSITION_PROMPT_V1,
              requestId
            );

            await updateIssueWithPMAnalysis(
              repo.owner.login,
              repo.name,
              issue.number,
              analysis
            );
            
            console.log(`[PM Agent] Successfully processed issue #${issue.number}`);
          } catch (error) {
            console.error(`[PM Agent] Background processing failed for issue #${issue.number}`, error);
          }
        })()
      );
      return NextResponse.json({ message: "Accepted issue for processing" }, { status: 202 });
    }

    if (payload.action === "closed" && payload.milestone && typeof payload.milestone === "object" && payload.repository && typeof payload.repository === "object") {
      const milestone = payload.milestone as { title: string; description?: string };
      const repo = payload.repository as { owner: { login: string }; name: string };

      waitUntil(
        (async () => {
          console.log(`[PM Agent] Intercepted closed milestone: ${milestone.title}. Generating Release Notes...`);
          try {
            // Note: In a full implementation, we would query GitHub for all closed issues in this milestone.
            // For V1 architecture setup, we pass the milestone metadata.
            const { text: releaseNotesMarkdown } = await generateText({
              model: openai("gpt-4o"),
              prompt: `
                ${RELEASE_NOTES_PROMPT_V1}
                
                MILESTONE TITLE: ${milestone.title}
                MILESTONE DESCRIPTION: ${milestone.description || "No description provided."}
              `
            });

            const fileName = `docs/releases/${milestone.title.replace(/\s+/g, '-').toLowerCase()}-release-notes.md`;

            await createDocumentationPR(
              repo.owner.login,
              repo.name,
              fileName,
              releaseNotesMarkdown,
              `${milestone.title} Release Notes`
            );
            
            console.log(`[PM Agent] Successfully generated Release Notes PR for ${milestone.title}`);
          } catch (error) {
            console.error(`[PM Agent] Background processing failed for milestone ${milestone.title}`, error);
          }
        })()
      );
      return NextResponse.json({ message: "Accepted milestone for processing" }, { status: 202 });
    }

    return NextResponse.json({ message: "Ignored event type" });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
