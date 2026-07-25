"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type Tab = "prompts" | "sandbox" | "tools";
const TEMPLATES = [
  { name: "Financial Analyst", description: "FP&A agent with Bloomberg connector, SQL access, and CerebroFinance integration", tools: ["Bloomberg API","PostgreSQL","CerebroFinance"], model: "claude-opus-5" },
  { name: "Compliance Monitor", description: "Continuous control monitoring agent pulling from audit logs and policy repository", tools: ["Audit Log API","Policy Registry","CerebroCompliance"], model: "claude-sonnet-5" },
  { name: "Code Reviewer", description: "Pull request reviewer with AST analysis, security scanning, and HiveKnowledge RAG", tools: ["GitHub API","SonarQube","HiveKnowledge"], model: "claude-sonnet-5" },
  { name: "Customer Success", description: "CRM-integrated agent for churn prediction and next best action recommendations", tools: ["CerebroCRM","HiveKnowledge","Email API"], model: "claude-haiku-4-5" },
];
const [PROMPT, setPromptExt] = [
  `You are a Financial Analyst agent for CerebroHive.\n\nYour responsibilities:\n- Analyze financial data from connected data sources\n- Identify anomalies, trends, and cost optimization opportunities\n- Generate executive-ready narratives with cited data\n- Proactively flag budget variances exceeding 10%\n\nTools available: Bloomberg API, CerebroFinance, PostgreSQL\n\nAlways cite your data sources. Maintain professional tone.`,
  null
];
export default function HiveForgePage() {
  const [tab, setTab] = useState<Tab>("prompts");
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [prompt, setPrompt] = useState(PROMPT);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const runSandbox = async () => {
    if (!input.trim()) return;
    setRunning(true);
    await new Promise(r=>setTimeout(r,1200));
    setOutput(`[Sandbox run — ${selectedTemplate.name} · ${new Date().toLocaleTimeString()}]\n\nInput: "${input}"\n\nAgent reasoning:\n→ Parsing query intent...\n→ Fetching relevant data via ${selectedTemplate.tools[0]}...\n→ Applying context from ${selectedTemplate.tools[1]}...\n→ Generating response with ${selectedTemplate.model}...\n\nOutput:\nBased on the latest data from ${selectedTemplate.tools[0]}, I've analyzed your query. The key findings are:\n1. Primary insight derived from structured data analysis\n2. Anomaly detected in the relevant time window\n3. Recommended action: review the flagged items\n\n[Token usage: 1,847 | Latency: 1.2s | Model: ${selectedTemplate.model}]`);
    setRunning(false);
  };
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link href="/platform" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"><ArrowLeft size={14} /> Platform</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">HiveForge™ · Tier 3</p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">Developer environment — Prompt Studio, sandbox testing, tool registry</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">HiveForge is the AI developer environment. Build agents using the Prompt Studio, bind tools from the registry, test in an isolated sandbox with full token and latency telemetry, then push to HiveAgents for production deployment.</p>
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border">
        {(["prompts","sandbox","tools"] as Tab[]).map(t=><button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm font-semibold capitalize transition-colors ${tab===t?"border-b-2 border-primary-accent text-primary-accent":"text-text-secondary hover:text-text-primary"}`}>{t}</button>)}
      </div>
      {tab==="prompts" && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {TEMPLATES.map(t=>(
              <button key={t.name} onClick={()=>setSelectedTemplate(t)} className={`rounded-xl border p-4 text-left transition-colors ${selectedTemplate.name===t.name?"border-primary-accent/50 bg-primary-accent/5":"border-border bg-surface/40 hover:bg-surface-elevated/40"}`}>
                <p className="font-semibold text-text-primary">{t.name}</p>
                <p className="mt-1 text-xs text-text-secondary">{t.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">{t.tools.map(tool=><span key={tool} className="rounded-full border border-border px-2 py-0.5 text-xs text-text-secondary">{tool}</span>)}</div>
              </button>
            ))}
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-text-secondary">System prompt — {selectedTemplate.name}</p>
            <textarea className="w-full rounded-xl border border-border bg-surface-elevated/40 px-4 py-3 font-mono text-xs text-text-primary" rows={12} value={prompt} onChange={e=>setPrompt(e.target.value)} />
          </div>
          <button className="rounded-md border border-primary-accent px-4 py-2 text-xs font-semibold text-primary-accent">Save prompt version</button>
        </div>
      )}
      {tab==="sandbox" && (
        <div className="mt-6 space-y-4">
          <p className="text-xs text-text-secondary">Testing: <span className="font-semibold text-text-primary">{selectedTemplate.name}</span> · Model: <span className="font-mono text-primary-accent">{selectedTemplate.model}</span></p>
          <div>
            <label className="text-xs font-semibold text-text-secondary">User input</label>
            <textarea className="mt-1 w-full rounded-xl border border-border bg-surface-elevated/40 px-4 py-3 text-sm text-text-primary" rows={3} placeholder="Enter a test prompt for the agent…" value={input} onChange={e=>setInput(e.target.value)} />
          </div>
          <button onClick={runSandbox} disabled={running||!input.trim()} className="rounded-md border border-primary-accent px-4 py-2 text-xs font-semibold text-primary-accent disabled:opacity-40">{running?"Running…":"Run in sandbox"}</button>
          {output&&<pre className="rounded-xl border border-border bg-surface/40 p-4 text-xs text-text-secondary whitespace-pre-wrap font-mono">{output}</pre>}
        </div>
      )}
      {tab==="tools" && (
        <div className="mt-6 space-y-2">
          <p className="text-xs text-text-secondary">Tool registry — bind these to any agent. Each tool is a typed function definition that the LLM can call as a JSON action.</p>
          {[
            ["bloomberg_data","Finance","Fetch real-time and historical market data from Bloomberg B-PIPE"],
            ["postgres_query","Database","Execute read-only SQL queries against production PostgreSQL"],
            ["hiveknowledge_search","AI / RAG","Semantic search over the HiveKnowledge document corpus"],
            ["cerebrofinance_entry","ERP","Read and write double-entry journal entries in CerebroFinance"],
            ["send_email","Communication","Send email via SendGrid with structured recipients and template"],
            ["github_pr","DevTools","Read pull requests and post review comments via GitHub API"],
            ["slack_message","Communication","Post messages to Slack channels or DMs"],
            ["web_search","Search","Fetch live web search results via Brave Search API"],
          ].map(([name,category,desc])=>(
            <div key={String(name)} className="flex items-start gap-3 rounded-xl border border-border bg-surface/40 p-4">
              <div className="flex-1 min-w-0"><p className="font-mono text-sm font-semibold text-text-primary">{name}</p><p className="mt-0.5 text-xs text-text-secondary">{desc}</p></div>
              <span className="rounded-full border border-border px-2 py-0.5 text-xs text-text-secondary shrink-0">{category}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
