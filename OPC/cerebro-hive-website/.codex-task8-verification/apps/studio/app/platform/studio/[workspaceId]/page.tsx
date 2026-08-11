"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  api, checkOnline, KEY,
  type Workspace, type Prompt, type Agent, type Flow, type Notebook, type Dataset, type Run,
} from "../lib";

type Tab = "prompts" | "agents" | "flows" | "notebooks" | "datasets" | "runs";
const TABS: { id: Tab; label: string }[] = [
  { id: "prompts", label: "Prompts" }, { id: "agents", label: "Agents" }, { id: "flows", label: "Flows" },
  { id: "notebooks", label: "Notebooks" }, { id: "datasets", label: "Datasets" }, { id: "runs", label: "Runs" },
];

export default function WorkspaceIdePage() {
  const params = useParams<{ workspaceId: string }>();
  const workspaceId = params.workspaceId;
  const [online, setOnline] = useState<boolean | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tab, setTab] = useState<Tab>("prompts");

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);

  const refresh = useCallback(async () => {
    const ok = await checkOnline();
    setOnline(ok);
    if (!ok || !KEY) return;
    try {
      const [w, p, a, f, n, d, r] = await Promise.all([
        api<Workspace>(`/v1/cerebrostudio/workspaces/${workspaceId}`),
        api<{ prompts: Prompt[] }>(`/v1/cerebrostudio/workspaces/${workspaceId}/prompts`),
        api<{ agents: Agent[] }>(`/v1/cerebrostudio/workspaces/${workspaceId}/agents`),
        api<{ flows: Flow[] }>(`/v1/cerebrostudio/workspaces/${workspaceId}/flows`),
        api<{ notebooks: Notebook[] }>(`/v1/cerebrostudio/workspaces/${workspaceId}/notebooks`),
        api<{ datasets: Dataset[] }>(`/v1/cerebrostudio/workspaces/${workspaceId}/datasets`),
        api<{ runs: Run[] }>(`/v1/cerebrostudio/workspaces/${workspaceId}/runs`),
      ]);
      setWorkspace(w); setPrompts(p.prompts); setAgents(a.agents); setFlows(f.flows);
      setNotebooks(n.notebooks); setDatasets(d.datasets); setRuns(r.runs);
    } catch { /* noop */ }
  }, [workspaceId]);

  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform/studio" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors">
        <ArrowLeft size={14} /> CerebroStudio™
      </Link>
      <h1 className="mt-5 text-3xl font-bold text-text-primary md:text-4xl">{workspace?.name ?? "Workspace"}</h1>
      {workspace?.description && <p className="mt-3 max-w-2xl text-text-secondary">{workspace.description}</p>}

      <div className="mt-5 flex items-center gap-2 text-sm">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${online === null ? "bg-border" : online ? "bg-primary-accent" : "bg-red-500"}`} />
        <span className="text-text-secondary">{online === null ? "Checking platform…" : online ? "Platform online" : "Platform unreachable"}</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-border">
        {TABS.map(t => (
          <button
            key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === t.id ? "border-b-2 border-primary-accent text-primary-accent" : "text-text-secondary hover:text-text-primary"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "prompts" && <PromptsTab workspaceId={workspaceId} prompts={prompts} online={!!online} refresh={refresh} />}
        {tab === "agents" && <AgentsTab workspaceId={workspaceId} agents={agents} online={!!online} refresh={refresh} />}
        {tab === "flows" && <FlowsTab workspaceId={workspaceId} flows={flows} prompts={prompts} agents={agents} online={!!online} refresh={refresh} />}
        {tab === "notebooks" && <NotebooksTab workspaceId={workspaceId} notebooks={notebooks} online={!!online} refresh={refresh} />}
        {tab === "datasets" && <DatasetsTab workspaceId={workspaceId} datasets={datasets} online={!!online} refresh={refresh} />}
        {tab === "runs" && <RunsTab runs={runs} />}
      </div>
    </main>
  );
}

// ---------------- Prompts ----------------

function PromptsTab({ workspaceId, prompts, online, refresh }: { workspaceId: string; prompts: Prompt[]; online: boolean; refresh: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [runInputs, setRunInputs] = useState<Record<string, string>>({});
  const [runOutputs, setRunOutputs] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    if (!name.trim() || !template.trim()) return;
    setBusy("create"); setError(null);
    try {
      await api(`/v1/cerebrostudio/workspaces/${workspaceId}/prompts`, { method: "POST", body: JSON.stringify({ name, template }) });
      setName(""); setTemplate(""); await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  };

  const run = async (id: string) => {
    setBusy(id);
    try {
      const res = await api<{ output: string }>(`/v1/cerebrostudio/prompts/${id}/run`, { method: "POST", body: JSON.stringify({ input: runInputs[id] ?? "" }) });
      setRunOutputs(prev => ({ ...prev, [id]: res.output }));
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface/40 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">New prompt</h3>
        <p className="mt-1 text-xs text-text-secondary">Use <code>{"{{variable}}"}</code> syntax — variables are extracted automatically.</p>
        <div className="mt-3 space-y-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Prompt name" className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <textarea value={template} onChange={e => setTemplate(e.target.value)} placeholder="Hi {{name}}, welcome to {{company}}!" rows={3} className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <button onClick={() => void create()} disabled={busy !== null || !online || !name.trim() || !template.trim()} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">
            {busy === "create" ? "Creating…" : "Create prompt"}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="space-y-3">
        {prompts.map(p => (
          <div key={p.id} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-text-primary">{p.name} <span className="text-xs text-text-secondary">· v{p.versions.length}</span></div>
              {p.variables.length > 0 && <span className="text-xs text-text-secondary">vars: {p.variables.join(", ")}</span>}
            </div>
            <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-surface-elevated px-3 py-2 text-xs text-text-secondary">{p.template}</pre>
            <div className="mt-2 flex gap-2">
              <input value={runInputs[p.id] ?? ""} onChange={e => setRunInputs(prev => ({ ...prev, [p.id]: e.target.value }))} placeholder="Run input" className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-primary" />
              <button onClick={() => void run(p.id)} disabled={busy !== null} className="rounded-lg border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">{busy === p.id ? "…" : "Run"}</button>
            </div>
            {runOutputs[p.id] && <p className="mt-2 rounded-lg border border-primary-accent/40 bg-primary-accent/5 px-3 py-2 text-xs text-text-primary">{runOutputs[p.id]}</p>}
          </div>
        ))}
        {prompts.length === 0 && <p className="text-sm text-text-secondary">No prompts yet.</p>}
      </div>
    </div>
  );
}

// ---------------- Agents ----------------

function AgentsTab({ workspaceId, agents, online, refresh }: { workspaceId: string; agents: Agent[]; online: boolean; refresh: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [tools, setTools] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [runInputs, setRunInputs] = useState<Record<string, string>>({});
  const [runOutputs, setRunOutputs] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    if (!name.trim() || !systemPrompt.trim()) return;
    setBusy("create"); setError(null);
    try {
      await api(`/v1/cerebrostudio/workspaces/${workspaceId}/agents`, {
        method: "POST",
        body: JSON.stringify({ name, systemPrompt, tools: tools.split(",").map(t => t.trim()).filter(Boolean) }),
      });
      setName(""); setSystemPrompt(""); setTools(""); await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  };

  const run = async (id: string) => {
    setBusy(id);
    try {
      const res = await api<{ output: string }>(`/v1/cerebrostudio/agents/${id}/run`, { method: "POST", body: JSON.stringify({ input: runInputs[id] ?? "" }) });
      setRunOutputs(prev => ({ ...prev, [id]: res.output }));
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface/40 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">New agent</h3>
        <div className="mt-3 space-y-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Agent name" className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} placeholder="System prompt — e.g. You are a helpful support agent." rows={3} className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <input value={tools} onChange={e => setTools(e.target.value)} placeholder="Tools, comma separated (optional)" className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <button onClick={() => void create()} disabled={busy !== null || !online || !name.trim() || !systemPrompt.trim()} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">
            {busy === "create" ? "Creating…" : "Create agent"}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="space-y-3">
        {agents.map(a => (
          <div key={a.id} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="text-sm font-semibold text-text-primary">{a.name} <span className="text-xs text-text-secondary">· {a.model}</span></div>
            <p className="mt-1 text-xs text-text-secondary">{a.systemPrompt}</p>
            {a.tools.length > 0 && <p className="mt-1 text-xs text-text-secondary">Tools: {a.tools.join(", ")}</p>}
            <div className="mt-2 flex gap-2">
              <input value={runInputs[a.id] ?? ""} onChange={e => setRunInputs(prev => ({ ...prev, [a.id]: e.target.value }))} placeholder="Run input" className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-primary" />
              <button onClick={() => void run(a.id)} disabled={busy !== null} className="rounded-lg border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">{busy === a.id ? "…" : "Run"}</button>
            </div>
            {runOutputs[a.id] && <p className="mt-2 rounded-lg border border-primary-accent/40 bg-primary-accent/5 px-3 py-2 text-xs text-text-primary">{runOutputs[a.id]}</p>}
          </div>
        ))}
        {agents.length === 0 && <p className="text-sm text-text-secondary">No agents yet.</p>}
      </div>
    </div>
  );
}

// ---------------- Flows ----------------

function FlowsTab({ workspaceId, flows, prompts, agents, online, refresh }: { workspaceId: string; flows: Flow[]; prompts: Prompt[]; agents: Agent[]; online: boolean; refresh: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [selectedSteps, setSelectedSteps] = useState<{ kind: "prompt" | "agent"; refId: string }[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [runInputs, setRunInputs] = useState<Record<string, string>>({});
  const [runOutputs, setRunOutputs] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const addStep = (kind: "prompt" | "agent", refId: string) => {
    if (!refId) return;
    setSelectedSteps(prev => [...prev, { kind, refId }]);
  };

  const create = async () => {
    if (!name.trim() || selectedSteps.length === 0) return;
    setBusy("create"); setError(null);
    try {
      await api(`/v1/cerebrostudio/workspaces/${workspaceId}/flows`, { method: "POST", body: JSON.stringify({ name, steps: selectedSteps }) });
      setName(""); setSelectedSteps([]); await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  };

  const run = async (id: string) => {
    setBusy(id);
    try {
      const res = await api<{ output: string }>(`/v1/cerebrostudio/flows/${id}/run`, { method: "POST", body: JSON.stringify({ input: runInputs[id] ?? "" }) });
      setRunOutputs(prev => ({ ...prev, [id]: res.output }));
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  };

  const nameFor = (kind: "prompt" | "agent", refId: string) =>
    (kind === "prompt" ? prompts.find(p => p.id === refId)?.name : agents.find(a => a.id === refId)?.name) ?? refId;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface/40 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">New flow</h3>
        <p className="mt-1 text-xs text-text-secondary">Chain prompts and agents in order — each step's output feeds the next.</p>
        <div className="mt-3 space-y-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Flow name" className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <div className="flex flex-wrap gap-2">
            <select onChange={e => { addStep("prompt", e.target.value); e.target.value = ""; }} defaultValue="" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs text-text-primary">
              <option value="" disabled>+ Add prompt step</option>
              {prompts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select onChange={e => { addStep("agent", e.target.value); e.target.value = ""; }} defaultValue="" className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs text-text-primary">
              <option value="" disabled>+ Add agent step</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          {selectedSteps.length > 0 && (
            <ol className="space-y-1 text-xs text-text-secondary">
              {selectedSteps.map((s, i) => <li key={i}>{i + 1}. [{s.kind}] {nameFor(s.kind, s.refId)}</li>)}
            </ol>
          )}
          <button onClick={() => void create()} disabled={busy !== null || !online || !name.trim() || selectedSteps.length === 0} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">
            {busy === "create" ? "Creating…" : "Create flow"}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="space-y-3">
        {flows.map(f => (
          <div key={f.id} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="text-sm font-semibold text-text-primary">{f.name}</div>
            <ol className="mt-1 space-y-0.5 text-xs text-text-secondary">
              {f.steps.map(s => <li key={s.id}>{s.order + 1}. [{s.kind}] {nameFor(s.kind, s.refId)}</li>)}
            </ol>
            <div className="mt-2 flex gap-2">
              <input value={runInputs[f.id] ?? ""} onChange={e => setRunInputs(prev => ({ ...prev, [f.id]: e.target.value }))} placeholder="Run input" className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-primary" />
              <button onClick={() => void run(f.id)} disabled={busy !== null} className="rounded-lg border border-primary-accent px-3 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">{busy === f.id ? "…" : "Run"}</button>
            </div>
            {runOutputs[f.id] && <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-primary-accent/40 bg-primary-accent/5 px-3 py-2 text-xs text-text-primary">{runOutputs[f.id]}</pre>}
          </div>
        ))}
        {flows.length === 0 && <p className="text-sm text-text-secondary">No flows yet.</p>}
      </div>
    </div>
  );
}

// ---------------- Notebooks ----------------

function NotebooksTab({ workspaceId, notebooks, online, refresh }: { workspaceId: string; notebooks: Notebook[]; online: boolean; refresh: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [cellDrafts, setCellDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    if (!name.trim()) return;
    setBusy("create"); setError(null);
    try {
      await api(`/v1/cerebrostudio/workspaces/${workspaceId}/notebooks`, { method: "POST", body: JSON.stringify({ name }) });
      setName(""); await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  };

  const addCell = async (notebookId: string, type: "markdown" | "code") => {
    setBusy(notebookId);
    try {
      await api(`/v1/cerebrostudio/notebooks/${notebookId}/cells`, { method: "POST", body: JSON.stringify({ type, content: cellDrafts[notebookId] ?? "" }) });
      setCellDrafts(prev => ({ ...prev, [notebookId]: "" }));
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  };

  const runCell = async (notebookId: string, cellId: string) => {
    setBusy(cellId);
    try {
      await api(`/v1/cerebrostudio/notebooks/${notebookId}/cells/${cellId}/run`, { method: "POST" });
      await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface/40 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">New notebook</h3>
        <div className="mt-3 flex gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Notebook name" className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <button onClick={() => void create()} disabled={busy !== null || !online || !name.trim()} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">
            {busy === "create" ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="space-y-4">
        {notebooks.map(n => (
          <div key={n.id} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="text-sm font-semibold text-text-primary">{n.name}</div>
            <div className="mt-2 space-y-2">
              {n.cells.map(c => (
                <div key={c.id} className="rounded-lg border border-border bg-surface-elevated px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-text-secondary">{c.type}</span>
                    <button onClick={() => void runCell(n.id, c.id)} disabled={busy !== null} className="text-[10px] font-semibold text-primary-accent disabled:opacity-40">{busy === c.id ? "…" : "Run cell"}</button>
                  </div>
                  <pre className="mt-1 whitespace-pre-wrap text-xs text-text-primary">{c.content}</pre>
                  {c.output && <p className="mt-1 whitespace-pre-wrap rounded bg-primary-accent/5 px-2 py-1 text-xs text-text-secondary">{c.output}</p>}
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input value={cellDrafts[n.id] ?? ""} onChange={e => setCellDrafts(prev => ({ ...prev, [n.id]: e.target.value }))} placeholder="Cell content" className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-text-primary" />
              <button onClick={() => void addCell(n.id, "markdown")} disabled={busy !== null} className="rounded-lg border border-border px-2 py-1.5 text-xs text-text-secondary disabled:opacity-40">+ Markdown</button>
              <button onClick={() => void addCell(n.id, "code")} disabled={busy !== null} className="rounded-lg border border-primary-accent px-2 py-1.5 text-xs font-semibold text-primary-accent disabled:opacity-40">+ Code</button>
            </div>
          </div>
        ))}
        {notebooks.length === 0 && <p className="text-sm text-text-secondary">No notebooks yet.</p>}
      </div>
    </div>
  );
}

// ---------------- Datasets ----------------

function DatasetsTab({ workspaceId, datasets, online, refresh }: { workspaceId: string; datasets: Dataset[]; online: boolean; refresh: () => Promise<void> }) {
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"csv" | "jsonl" | "txt">("csv");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true); setError(null);
    try {
      await api(`/v1/cerebrostudio/workspaces/${workspaceId}/datasets`, { method: "POST", body: JSON.stringify({ name, format }) });
      setName(""); await refresh();
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface/40 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">New dataset</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Dataset name" className="flex-1 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary" />
          <select value={format} onChange={e => setFormat(e.target.value as "csv" | "jsonl" | "txt")} className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary">
            <option value="csv">CSV</option>
            <option value="jsonl">JSONL</option>
            <option value="txt">TXT</option>
          </select>
          <button onClick={() => void create()} disabled={busy || !online || !name.trim()} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">
            {busy ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {datasets.map(d => (
          <div key={d.id} className="rounded-xl border border-border bg-surface/40 p-4">
            <div className="text-sm font-semibold text-text-primary">{d.name} <span className="text-xs text-text-secondary uppercase">{d.format}</span></div>
            <div className="mt-1 text-xs text-text-secondary">{d.rows.toLocaleString()} rows · {d.sizeKb.toFixed(1)} KB</div>
          </div>
        ))}
        {datasets.length === 0 && <p className="text-sm text-text-secondary">No datasets yet.</p>}
      </div>
    </div>
  );
}

// ---------------- Runs ----------------

function RunsTab({ runs }: { runs: Run[] }) {
  return (
    <div className="space-y-3">
      {runs.map(r => (
        <div key={r.id} className="rounded-xl border border-border bg-surface/40 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-text-primary">{r.targetName} <span className="text-xs text-text-secondary">· {r.targetType}</span></span>
            <span className="text-xs text-primary-accent">{r.status}</span>
          </div>
          <div className="mt-1 text-xs text-text-secondary">{new Date(r.createdAt).toLocaleString()} · {r.tokensUsed} tokens · {r.latencyMs}ms</div>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-surface-elevated px-3 py-2 text-xs text-text-secondary">{r.output}</pre>
        </div>
      ))}
      {runs.length === 0 && <p className="text-sm text-text-secondary">No runs yet — run a prompt, agent, or flow to see its history here.</p>}
    </div>
  );
}
