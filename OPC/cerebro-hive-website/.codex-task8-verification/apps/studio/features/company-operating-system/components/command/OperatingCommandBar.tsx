"use client";

import { useState } from "react";
import { parseLocalCommand } from "../../commands/parseLocalCommand";
import { useOperatingWorkspaceStore } from "../../workspace/store";

type CommandState = "parsing" | "validating" | "dispatch" | "running" | "completed" | "failed" | "cancelled";

export function OperatingCommandBar() {
  const [text, setText] = useState(""); const [state, setState] = useState<CommandState>("parsing"); const [message, setMessage] = useState("");
  const setQuery = useOperatingWorkspaceStore((store) => store.setQuery);
  const setFocusId = useOperatingWorkspaceStore((store) => store.setFocusId);
  const setInspectorId = useOperatingWorkspaceStore((store) => store.setInspectorId);
  async function submit(event: React.FormEvent) { event.preventDefault(); setState("validating"); const local = parseLocalCommand(text); if (local) { if (local.kind === "find") setQuery(local.target); if (local.kind === "focus" || local.kind === "open") { setFocusId(local.target); setInspectorId(local.target); } setMessage(`${local.kind} applied locally`); setState("completed"); return; } setState("dispatch"); try { const response = await fetch("/api/operating-system/commands", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) }); if (!response.ok) throw new Error((await response.json()).error ?? "Command failed"); setState("running"); setMessage("Command dispatched"); } catch (error) { setState("failed"); setMessage(error instanceof Error ? error.message : "Command failed"); } }
  return <form aria-label="Operating command" className="flex min-w-0 items-center gap-2" onSubmit={submit}><label className="sr-only" htmlFor="operating-command">Command</label><input id="operating-command" className="min-w-0 flex-1 border border-[var(--company-os-border)] bg-[var(--company-os-canvas)] px-2 py-1.5 font-inter text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--company-os-border-focus)]" onChange={(event) => { setText(event.target.value); setState("parsing"); }} placeholder="focus research · execute-agent &lt;id&gt; &lt;message&gt;" value={text} /><button className="border border-[var(--company-os-border-focus)] px-2 py-1.5 font-plex text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--company-os-border-focus)]" type="submit">Run</button><output aria-live="polite" className="hidden text-xs sm:block">{state}{message ? `: ${message}` : ""}</output></form>;
}
