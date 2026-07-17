"use server";

import { runAgentTask } from "@/lib/agentos";
import { getSnapshot, resetSession } from "@/lib/agentos/memory";
import { AgentRunResult, MemorySnapshot } from "@/lib/agentos/types";

export async function runAgentOSTask(input: string, sessionId: string): Promise<{ data?: AgentRunResult; error?: string }> {
  if (!input || input.trim().length === 0) {
    return { error: "Task cannot be empty." };
  }
  if (input.length > 2000) {
    return { error: "Task is too long (max 2000 characters)." };
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
  try {
    await resetSession(sessionId);
    return { ok: true };
  } catch (error) {
    console.error("AgentOS memory reset error:", error);
    return { ok: false };
  }
}
