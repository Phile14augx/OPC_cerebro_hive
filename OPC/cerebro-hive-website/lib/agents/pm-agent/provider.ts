import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { EpicDecompositionSchema, EpicDecomposition } from "./schema";
import { recordMetrics } from "./observability";

/**
 * The LLM Provider Abstraction.
 * Currently defaults to OpenAI (gpt-4o) but exposes a standardized interface
 * to allow swapping to Anthropic, Google, or local models in the future.
 */
export async function decomposeEpic(
  title: string, 
  body: string, 
  promptTemplate: string,
  requestId: string
): Promise<EpicDecomposition> {
  const startTime = Date.now();

  try {
    const { object, usage } = await generateObject({
      model: openai("gpt-4o"),
      schema: EpicDecompositionSchema,
      prompt: `
        ${promptTemplate}

        ISSUE TITLE: ${title}
        ISSUE BODY: ${body}
      `,
    });

    // Capture observability metrics
    recordMetrics({
      requestId,
      model: "gpt-4o",
      durationMs: Date.now() - startTime,
      tokens: usage.totalTokens,
      success: true,
    });

    return object;
  } catch (error) {
    recordMetrics({
      requestId,
      model: "gpt-4o",
      durationMs: Date.now() - startTime,
      tokens: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}
