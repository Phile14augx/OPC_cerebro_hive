"use server";

import { headers } from "next/headers";
import { runAgentTask } from "@/lib/agentos";
import { getSnapshot, resetSession } from "@/lib/agentos/memory";
import { AgentRunResult, MemorySnapshot } from "@/lib/agentos/types";
import { rateLimit } from "@/lib/security/rateLimit";

// Server Actions already get Next.js's built-in Origin-header verification
// (framework-level CSRF protection), so unlike the app/api/** route handlers
// there's no need for a manual origin check here — just abuse-rate limiting.
// The in-browser kernel actually runs the reasoning/planner/tool pipeline on
// every call, so an unlimited client could hammer this into a real CPU/IO
// abuse vector even without a "database" behind it.
async function clientKey(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

export async function runAgentOSTask(input: string, sessionId: string): Promise<{ data?: AgentRunResult; error?: string }> {
  if (!input || input.trim().length === 0) {
    return { error: "Task cannot be empty." };
  }
  if (input.length > 2000) {
    return { error: "Task is too long (max 2000 characters)." };
  }

  const key = await clientKey();
  const limited = rateLimit(`agentos-run:${key}`, 20, 60_000);
  if (!limited.ok) {
    return { error: "Too many requests — please wait a moment before running another task." };
  }

  try {
    const data = await runAgentTask(input.trim(), sessionId);
    return { data };
  } catch (error) {
    console.error("AgentOS runtime error:", error);
    return { error: "The AgentOS runtime hit an unexpected error executing that task." };
  }
}

export async function getAgentOSMemory(sessionId: string): Promise<{ data?: MemorySnapshot; error?: string }> {
  try {
    const data = await getSnapshot(sessionId, "");
    return { data };
  } catch (error) {
    console.error("AgentOS memory read error:", error);
    return { error: "Could not read Memory Fabric." };
  }
}

export async function resetAgentOSSession(sessionId: string): Promise<{ ok: boolean }> {
  const key = await clientKey();
  const limited = rateLimit(`agentos-reset:${key}`, 10, 60_000);
  if (!limited.ok) {
    return { ok: false };
  }

  try {
    await resetSession(sessionId);
    return { ok: true };
  } catch (error) {
    console.error("AgentOS memory reset error:", error);
    return { ok: false };
  }
}
