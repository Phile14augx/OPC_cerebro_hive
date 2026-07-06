"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles, Play, RefreshCw, Plus, ArrowRight, ArrowLeft, Download, Check, AlertTriangle,
  ShieldAlert, Mail, FileText, Database, UserCheck, CheckCircle2, DollarSign, Award, Clock,
  ArrowUpRight, Zap, Code, ShieldCheck, BookOpen, Layers, Bot, Workflow, HelpCircle, ChevronRight
} from "lucide-react";

interface SandboxItem {
  id: string;
  category: "product" | "service" | "solution";
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ComponentType<any>;
  color: string;
  bullets: string[];
}

export default function FreeTierDashboard() {
  const [activeSandbox, setActiveSandbox] = useState<string | null>(null);

  // List of all Sandboxes
  const sandboxes: SandboxItem[] = [
    // Products
    {
      id: "flow",
      category: "product",
      title: "CerebroFlow",
      subtitle: "Visual Pipeline Builder",
      desc: "Drag-and-drop workflow builder using LangGraph nodes. Run a live simulation of a fault-tolerant prompt-routing agent.",
      icon: Workflow,
      color: "var(--neural-blue)",
      bullets: ["Drag-and-drop node simulator", "Live console log feed", "JSON configuration exports"]
    },
    {
      id: "agent",
      category: "product",
      title: "CerebroAgent",
      subtitle: "Multi-Agent Swarm",
      desc: "Deploy a persistent multi-agent swarm. Run custom tasks and watch agents converse, delegate, and generate report briefs.",
      icon: Bot,
      color: "var(--violet)",
      bullets: ["Multi-agent collaboration logs", "Custom prompts & target objectives", "Generated output previewer"]
    },
    {
      id: "learn",
      category: "product",
      title: "CerebroLearn",
      subtitle: "LMS & Certification Quiz",
      desc: "Test your AI knowledge in a proctored mini-course quiz. Score 100% to instantly issue a downloadable verifiable digital certification.",
      icon: BookOpen,
      color: "var(--hot-pink)",
      bullets: ["Gated knowledge validation", "Instant grading & review key", "Verifiable digital credential badge"]
    },
    {
      id: "erp_product",
      category: "product",
      title: "CerebroERP",
      subtitle: "AI Ledger Auditor",
      desc: "A preview of the SME ERP solution. View recent ledger transactions audited in real-time by AI models flagging cost anomalies.",
      icon: Layers,
      color: "var(--hive-orange)",
      bullets: ["Live transaction registers", "AI spend variance diagnostics", "Approve & Flag auditing workflow"]
    },
    // Services
    {
      id: "readiness",
      category: "service",
      title: "AI Readiness Assessment",
      subtitle: "Maturity Diagnostic Scanner",
      desc: "A diagnostic assessment of your company's AI maturity. Computes an overall scorecard and generates an strategic roadmap report.",
      icon: Award,
      color: "var(--neural-blue)",
      bullets: ["4-dimension maturity scorecard", "Custom recommendations matrix", "Plain text report exporter"]
    },
    {
      id: "roi",
      category: "service",
      title: "Workflow ROI Calculator",
      subtitle: "Automation Savings Evaluator",
      desc: "Calculate exact cost and time savings of replacing manual tasks with automated agent networks. Computes annual cash flows.",
      icon: DollarSign,
      color: "var(--violet)",
      bullets: ["Dynamic team size & hours sliders", "Payback timeline tracker", "Tailored stack recommendations"]
    },
    // Solutions
    {
      id: "support",
      category: "solution",
      title: "Customer Support AI",
      subtitle: "Inbound Email Auto-Responder",
      desc: "Analyze support emails, classify intent, extract metadata, track sentiment, and auto-draft personalized polite response emails.",
      icon: Mail,
      color: "var(--neural-blue)",
      bullets: ["Sentiment & priority scorer", "Key invoice entity extractor", "Polite response draft compiler"]
    },
    {
      id: "rag",
      category: "solution",
      title: "Enterprise Semantic RAG",
      subtitle: "Vector Search & Retrieval Tracer",
      desc: "Ingest security policies and query a RAG pipeline. Traces vector similarities, grounding prompts, and cited answers.",
      icon: Database,
      color: "var(--violet)",
      bullets: ["Vector similarity scorecard", "LLM context builder", "Inline cited document links"]
    },
    {
      id: "recruiter",
      category: "solution",
      title: "AI HR Recruiter",
      subtitle: "Resume Screening Agent",
      desc: "Parse and screen applicant profiles against custom job descriptions. Ranks candidates and lists detailed AI pros, cons, and red flags.",
      icon: UserCheck,
      color: "var(--hot-pink)",
      bullets: ["Match percentage indexer", "AI resume parameter parser", "Shortlist & Reject action hooks"]
    },
    {
      id: "matcher",
      category: "solution",
      title: "Invoice 3-Way Matcher",
      subtitle: "Ledger Discrepancy Auditor",
      desc: "Compare invoices against Purchase Orders and Goods Received Notes. Detect price/quantity mismatches and auto-flag ledger warnings.",
      icon: ShieldCheck,
      color: "var(--hive-orange)",
      bullets: ["Simulated OCR parsing", "3-way comparison checks", "Debit note compiler triggers"]
    }
  ];

  // -------------------------------------------------------------
  // SIMULATOR 1: CerebroFlow Visual Builder
  // -------------------------------------------------------------
  const [flowNodes, setFlowNodes] = useState<{ id: string; type: string; label: string; color: string }[]>([
    { id: "1", type: "Trigger", label: "Form Submit", color: "var(--hive-orange)" },
    { id: "2", type: "AI Node", label: "Analyze Lead", color: "var(--neural-blue)" },
    { id: "3", type: "Action", label: "Sync CRM", color: "var(--violet)" }
  ]);
  const [flowLogs, setFlowLogs] = useState<string[]>([]);
  const [flowRunning, setFlowRunning] = useState(false);

  const addFlowNode = (type: string, label: string, color: string) => {
    if (flowNodes.length >= 6) return;
    setFlowNodes(prev => [...prev, { id: Date.now().toString(), type, label, color }]);
  };

  const clearFlowCanvas = () => {
    setFlowNodes([]);
    setFlowLogs([]);
  };

  const runFlowSimulation = () => {
    if (flowRunning || flowNodes.length === 0) return;
    setFlowRunning(true);
    setFlowLogs([]);

    const steps = [
      `[LOG] Initializing CerebroFlow runtime graph...`,
      `[LOG] Ingesting trigger data from point: ${flowNodes[0]?.label || "Start"}`,
      ...flowNodes.slice(1).map(node => `[LOG] Executing ${node.type}: ${node.label}... Successfully routed payload.`),
      `[STATUS] ✓ Success: Workflow executed in 4.82s. Estimated human time saved: 0.12 hours.`
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setFlowLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) setFlowRunning(false);
      }, (idx + 1) * 700);
    });
  };

  // -------------------------------------------------------------
  // SIMULATOR 2: CerebroAgent Swarm
  // -------------------------------------------------------------
  const [agentObjective, setAgentObjective] = useState("Draft competitor audit of enterprise RAG systems");
  const [agentLogs, setAgentLogs] = useState<{ sender: string; text: string; color: string }[]>([]);
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentResult, setAgentResult] = useState("");

  const runAgentSimulation = () => {
    if (agentRunning) return;
    setAgentRunning(true);
    setAgentLogs([]);
    setAgentResult("");

    const transcript = [
      { sender: "Coordinator Agent", text: `Objective initialized: "${agentObjective}". Delegating tasks to research nodes.`, color: "var(--neural-blue)" },
      { sender: "Web Research Agent", text: "Searching indexed web documents... Compiling feature maps for Pinecone Serverless and pgvector. Analysis complete, routing to Writer.", color: "var(--violet)" },
      { sender: "SEO Copywriter Agent", text: "Writing report layout. Emphasizing CerebroHive's custom private model gateway parameters. Applying readability edits.", color: "var(--hot-pink)" },
      { sender: "Coordinator Agent", text: "Reviewing generated output draft. Verification check passed. Generating final brief markdown.", color: "var(--neural-blue)" }
    ];

    transcript.forEach((log, idx) => {
      setTimeout(() => {
        setAgentLogs(prev => [...prev, log]);
        if (idx === transcript.length - 1) {
          setAgentRunning(false);
          setAgentResult(`# Competitor RAG Systems Assessment
Compiled by: CerebroHive Agent Swarm
Objective: ${agentObjective}
Date: ${new Date().toLocaleDateString()}

## 1. Executive Summary
Enterprise RAG architectures require low-latency indexing, compliance-first PII scrubbing, and custom private LLM gateways.

## 2. Platform Comparison Matrix
* **Pinecone Serverless**: High concurrency, high metadata indexing capabilities, but runs in third-party clouds.
* **pgvector (Postgres)**: High-security compliance, local database execution, standard SQL support.
* **CerebroOS Private RAG Gateway**: VPC isolated, auto PII filters, integrated semantic cache.

## 3. Deployment Recommendation
For financial and healthcare verticals, deploy pgvector inside secure VPC nodes governed by CerebroFlow orchestration pipelines.`);
        }
      }, (idx + 1) * 900);
    });
  };

  // -------------------------------------------------------------
  // SIMULATOR 3: CerebroLearn LMS Quiz
  // -------------------------------------------------------------
  const [quizStep, setQuizStep] = useState(0); // 0: start, 1: q1, 2: q2, 3: q3, 4: results
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizPassed, setQuizPassed] = useState(false);

  const quizQuestions = [
    {
      id: 1,
      q: "What is the primary benefit of Retrieval-Augmented Generation (RAG)?",
      options: [
        { key: "a", text: "It decreases API model calls by pre-training raw model parameters." },
        { key: "b", text: "It grounds generation in company documents to reduce hallucinations." },
        { key: "c", text: "It automatically rewrites code from python to NextJS." }
      ],
      correct: "b"
    },
    {
      id: 2,
      q: "What does Few-Shot Prompting supply that Zero-Shot Prompting does not?",
      options: [
        { key: "a", text: "Examples of inputs paired with expected output targets." },
        { key: "b", text: "Continuous weights updates inside the vector layers." },
        { key: "c", text: "Direct SQL connection permissions to company tables." }
      ],
      correct: "a"
    },
    {
      id: 3,
      q: "Which framework is optimized for creating state-based multi-agent graphs?",
      options: [
        { key: "a", text: "Tailwind CSS v4 framework." },
        { key: "b", text: "NextJS static server rendering routes." },
        { key: "c", text: "LangGraph orchestration system." }
      ],
      correct: "c"
    }
  ];

  const submitQuizAnswers = () => {
    let allCorrect = true;
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] !== q.correct) allCorrect = false;
    });
    setQuizPassed(allCorrect);
    setQuizStep(4);
  };

  const handleDownloadCert = () => {
    const certText = `
=========================================================
          CEREBROHIVE ACADEMY CERTIFICATE OF MERIT
=========================================================
This certifies that: guest@cerebro-hive.com
Has successfully completed the proctored assessment:
Prompt Engineering & Autonomous Agent Architectures

Date of Issue: ${new Date().toLocaleDateString()}
Credential ID: CH-CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}
Verification Check: https://cerebro-hive.com/verify/academy
=========================================================
    `;
    const blob = new Blob([certText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CerebroHive_Academy_Certificate.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // -------------------------------------------------------------
  // SIMULATOR 4: CerebroERP Ledger Auditor
  // -------------------------------------------------------------
  const [ledger, setLedger] = useState([
    { id: "TXN-772", desc: "API compute hosting node Vanguard", amount: "$14,500.00", status: "Anomaly Detected", reason: "Variance is +45% compared to baseline", state: "pending" },
    { id: "TXN-773", desc: "Consulting retainer - sprint 3 pipeline", amount: "$20,000.00", status: "Audit Pass", reason: "Matches verified SOW contract schedules", state: "approved" },
    { id: "TXN-774", desc: "Customer service auto-responder API", amount: "$420.00", status: "Audit Pass", reason: "Fits typical monthly spend margins", state: "approved" },
    { id: "TXN-775", desc: "Duplicate payment check - database audit", amount: "$12,500.00", status: "Anomaly Detected", reason: "Matches invoice INV-2026-004 exactly", state: "pending" }
  ]);

  const auditAction = (id: string, action: "approve" | "flag") => {
    setLedger(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: action === "approve" ? "Audit Pass" : "Flagged for Manual Review",
          state: action === "approve" ? "approved" : "flagged"
        };
      }
      return item;
    }));
  };

  // -------------------------------------------------------------
  // SIMULATOR 5: AI Readiness Assessment (Service)
  // -------------------------------------------------------------
  const [readinessAnswers, setReadinessAnswers] = useState<Record<number, number>>({});
  const [readinessStep, setReadinessStep] = useState(0); // 0: start, 1..4: questions, 5: report
  const readinessQs = [
    { id: 1, text: "How is your company's operational data currently stored?", options: [{ text: "Segmented silos (spreadsheets, emails)", score: 30 }, { text: "Shared directories or localized SQL servers", score: 60 }, { text: "Modern Data Warehouses (Snowflake, BigQuery)", score: 90 }] },
    { id: 2, text: "How do you handle unstructured texts (PDFs, support logs)?", options: [{ text: "Completely manual entry or no tracking", score: 30 }, { text: "Basic keyword parsing or scanner scripts", score: 65 }, { text: "Vector databases feeding RAG pipelines", score: 95 }] },
    { id: 3, text: "What level of AI literacy is active in the company?", options: [{ text: "No training, staff is skeptical", score: 25 }, { text: "Basic assistant prompts used for writing", score: 60 }, { text: "Core team actively building agents", score: 95 }] },
    { id: 4, text: "What security measures cover external model APIs?", options: [{ text: "No protocols, copy-pasting is unregulated", score: 20 }, { text: "Direct developer keys without proxy audits", score: 55 }, { text: "Private enterprise proxies with data filtering", score: 95 }] }
  ];

  const handleReadinessScore = () => {
    let total = 0;
    readinessQs.forEach(q => {
      total += readinessAnswers[q.id] || 0;
    });
    return Math.round(total / readinessQs.length);
  };

  const downloadReadinessReport = () => {
    const score = handleReadinessScore();
    const tier = score < 40 ? "Ad-Hoc" : score < 70 ? "Exploring" : "AI-Native";
    const reportText = `
=========================================================
          CEREBROHIVE — AI READINESS AUDIT REPORT
=========================================================
Overall Score: ${score}/100
Maturity Level: ${tier} Tier
Date: ${new Date().toLocaleDateString()}

Directives:
1. Data Storage: Upgrade segmented folders to structured data lakes.
2. Unstructured Ingestion: Connect vector indexes to Pinecone layers.
3. Talent: Deliver targeted prompt engineering bootcamps.
4. Security: Enforce private LLM proxies to limit PII leak vulnerabilities.
=========================================================
    `;
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CerebroHive_AI_Readiness_Report.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // -------------------------------------------------------------
  // SIMULATOR 6: Workflow ROI Calculator (Service)
  // -------------------------------------------------------------
  const [roiTeamSize, setRoiTeamSize] = useState(15);
  const [roiHoursDaily, setRoiHoursDaily] = useState(3);
  const [roiHourlyRate, setRoiHourlyRate] = useState(45);

  const calculateROI = () => {
    const dailyManualCost = roiTeamSize * roiHoursDaily * roiHourlyRate;
    const annualManualCost = dailyManualCost * 250; // 250 business days
    const annualAutomatedCost = annualManualCost * 0.1; // 90% savings
    const annualSavings = annualManualCost - annualAutomatedCost;
    const hoursSavedYearly = roiTeamSize * roiHoursDaily * 250;
    return {
      manual: Math.round(annualManualCost),
      automated: Math.round(annualAutomatedCost),
      savings: Math.round(annualSavings),
      hours: hoursSavedYearly
    };
  };

  const roiMetrics = calculateROI();

  // -------------------------------------------------------------
  // SIMULATOR 7: Customer Support AI Classifier
  // -------------------------------------------------------------
  const supportTemplates = [
    { label: "Delivery Delay Inquiry", text: "I ordered integration modules three weeks ago (order reference #OR-994). Where is the shipment? I haven't received updates." },
    { label: "API Key Authentication Error", text: "Hey support, I am getting a persistent 401 Unauthorized status code when triggering the LangGraph agent proxy. Need assistance." },
    { label: "Refund Request", text: "Invoice INV-2026-004 has duplicate billing. This is unacceptable. I request a complete credit refund." }
  ];

  const [supportText, setSupportText] = useState(supportTemplates[0].text);
  const [supportOutput, setSupportOutput] = useState<{ category: string; sentiment: string; priority: string; reply: string } | null>(null);
  const [supportRunning, setSupportRunning] = useState(false);

  const runSupportSimulation = () => {
    if (supportRunning) return;
    setSupportRunning(true);
    setSupportOutput(null);

    setTimeout(() => {
      let category = "General Support";
      let sentiment = "Negative (Irritated)";
      let priority = "High";
      let reply = "";

      if (supportText.includes("OR-994")) {
        category = "Shipping & Logistics";
        sentiment = "Neutral-Negative";
        priority = "Medium";
        reply = `Dear Partner,

Thank you for reaching out to CerebroHive. We have audited order reference #OR-994 and verified it is currently in transit. The node shipment will arrive within 2 business days.

Warm regards,
Cerebro Support Agent`;
      } else if (supportText.includes("401")) {
        category = "Technical API Infrastructure";
        sentiment = "Neutral (Technical)";
        priority = "High";
        reply = `Hello,

Our monitoring indicates a 401 Unauthorized code is caused by an expired proxy token. Please log into the CerebroFlow control panel to regenerate your client credentials.

Best,
Cerebro Systems Node`;
      } else {
        category = "Billing & Refund Ledger";
        sentiment = "Negative (Anger)";
        priority = "Critical";
        reply = `Dear Partner,

We sincerely apologize for the invoice discrepancy on INV-2026-004. Our financial auditor has confirmed the duplicate charge. A credit adjustment has been initiated and will clear in 24 hours.

Regards,
Billing Audit Node`;
      }

      setSupportOutput({ category, sentiment, priority, reply });
      setSupportRunning(false);
    }, 1200);
  };

  // -------------------------------------------------------------
  // SIMULATOR 8: Enterprise Semantic RAG
  // -------------------------------------------------------------
  const [ragQuery, setRagQuery] = useState("What are the database backup rules?");
  const [ragSteps, setRagSteps] = useState<{ label: string; details: string }[]>([]);
  const [ragAnswer, setRagAnswer] = useState("");
  const [ragRunning, setRagRunning] = useState(false);

  const runRagSimulation = () => {
    if (ragRunning) return;
    setRagRunning(true);
    setRagSteps([]);
    setRagAnswer("");

    const steps = [
      { label: "Ingesting Question", details: `Generating vector embeddings for: "${ragQuery}"` },
      { label: "Vector DB Scan", details: "Scanning index nodes... Found matches in: 'Corporate SOP Section 9 - Database Rules' (score: 0.94)" },
      { label: "Prompt Construction", details: "Injecting matching text chunks as grounded context into prompt guidelines." },
      { label: "LLM Answer Generation", details: "Synthesizing finalized cited response output." }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setRagSteps(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setRagAnswer("According to Corporate SOP Section 9, database systems are configured with automated hourly incremental snapshot backups. Full image snapshots are backed up every 24 hours to secure off-site cloud storage. [SOP-Section-9.txt]");
          setFlowRunning(false);
          setRagRunning(false);
        }
      }, (idx + 1) * 800);
    });
  };

  // -------------------------------------------------------------
  // SIMULATOR 9: AI HR Recruiter
  // -------------------------------------------------------------
  const [hrJob, setHrJob] = useState("Senior Frontend Architect");
  const [hrCandidates, setHrCandidates] = useState<{ name: string; score: number; notes: string; status: string }[]>([]);
  const [hrRunning, setHrRunning] = useState(false);

  const runHrSimulation = () => {
    if (hrRunning) return;
    setHrRunning(true);
    setHrCandidates([]);

    setTimeout(() => {
      if (hrJob === "Senior Frontend Architect") {
        setHrCandidates([
          { name: "Jane Connor", score: 96, notes: "5 years React/NextJS experience. Built custom vector search UIs. Strong match.", status: "undecided" },
          { name: "Sarah Connor", score: 72, notes: "Strong leadership, but limited NextJS v16 experience. Relies heavily on legacy templates.", status: "undecided" },
          { name: "T-800 Node", score: 12, notes: "Candidate is a hardware compiler. Lacks human UI layout validation skillsets.", status: "undecided" }
        ]);
      } else {
        setHrCandidates([
          { name: "Miles Dyson", score: 98, notes: "Deep learning expert. Built core neural architectures. Exceptional math backgrounds.", status: "undecided" },
          { name: "Peter Silberman", score: 55, notes: "Focuses on prompt management tools. Lacks Python microservices experience.", status: "undecided" },
          { name: "John Connor", score: 84, notes: "Experienced with LangGraph networks and n8n triggers. Fits role targets well.", status: "undecided" }
        ]);
      }
      setHrRunning(false);
    }, 1000);
  };

  const hrAction = (name: string, status: "Shortlisted" | "Rejected") => {
    setHrCandidates(prev => prev.map(c => {
      if (c.name === name) return { ...c, status };
      return c;
    }));
  };

  // -------------------------------------------------------------
  // SIMULATOR 10: Invoice 3-Way Matcher
  // -------------------------------------------------------------
  const invoiceData = [
    { field: "Vendor Name", invoice: "AeroSpace Systems Ltd", po: "AeroSpace Systems Ltd", grn: "AeroSpace Systems Ltd", status: "Match" },
    { field: "Billed Quantity", invoice: "100 Units", po: "100 Units", grn: "80 Units", status: "Mismatch" },
    { field: "Unit Rate", invoice: "$125.00", po: "$125.00", grn: "$125.00", status: "Match" },
    { field: "Billed Total", invoice: "$12,500.00", po: "$12,500.00", grn: "$10,000.00", status: "Mismatch" }
  ];
  const [matchAudited, setMatchAudited] = useState(false);
  const [matchResult, setMatchResult] = useState<string | null>(null);

  const runMatchAudit = () => {
    setMatchAudited(true);
    setMatchResult("Audit Warning: 3-way match failed. Invoiced billed quantity (100 units) exceeds verified items received (80 units). Initiating debit note request flow.");
  };

  return (
    <div style={{ minHeight: "450px" }}>
      {/* -------------------------------------------------------------
          DIRECTORY VIEW
         ------------------------------------------------------------- */}
      {activeSandbox === null && (
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          <div>
            <div className="section-label">
              <Sparkles size={11} style={{ marginRight: "4px" }} /> Free Sandbox Suite
            </div>
            <h2 className="font-orbitron" style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Interactive Product Trials
            </h2>
            <p className="font-exo" style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Explore hands-on interactive simulations of CerebroHive's software products, consulting tools, and business solutions.
            </p>
          </div>

          {/* Group 1: Products */}
          <div>
            <h3 className="font-orbitron" style={{ fontSize: "0.95rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--neural-blue)", marginBottom: "20px" }}>
              1. Proprietary Products trials
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {sandboxes.filter(s => s.category === "product").map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.id} className="card-glass" style={{ padding: "28px 24px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${s.color}14`, border: `1px solid ${s.color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={18} color={s.color} />
                      </div>
                      <span style={{ fontSize: "0.6rem", fontFamily: "Orbitron", fontWeight: 700, color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase" }}>
                        trial
                      </span>
                    </div>
                    <h4 className="font-orbitron" style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "8px" }}>{s.title}</h4>
                    <p className="font-exo" style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px", flex: 1 }}>{s.desc}</p>
                    <button
                      onClick={() => setActiveSandbox(s.id)}
                      className="btn-ghost"
                      style={{ padding: "8px 16px", fontSize: "0.75rem", width: "100%", justifyContent: "center" }}
                    >
                      Launch Sandbox
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 2: Services */}
          <div>
            <h3 className="font-orbitron" style={{ fontSize: "0.95rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--violet)", marginBottom: "20px" }}>
              2. Strategic Service Diagnostics
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {sandboxes.filter(s => s.category === "service").map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.id} className="card-glass" style={{ padding: "28px 24px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${s.color}14`, border: `1px solid ${s.color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={18} color={s.color} />
                      </div>
                      <span style={{ fontSize: "0.6rem", fontFamily: "Orbitron", fontWeight: 700, color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase" }}>
                        diagnostic
                      </span>
                    </div>
                    <h4 className="font-orbitron" style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "8px" }}>{s.title}</h4>
                    <p className="font-exo" style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px", flex: 1 }}>{s.desc}</p>
                    <button
                      onClick={() => setActiveSandbox(s.id)}
                      className="btn-ghost"
                      style={{ padding: "8px 16px", fontSize: "0.75rem", width: "100%", justifyContent: "center", color: s.color, borderColor: s.color }}
                    >
                      Launch Sandbox
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group 3: Solutions */}
          <div>
            <h3 className="font-orbitron" style={{ fontSize: "0.95rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--hive-orange)", marginBottom: "20px" }}>
              3. Vertical Solutions Sandbox
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
              {sandboxes.filter(s => s.category === "solution").map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.id} className="card-glass" style={{ padding: "28px 24px", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${s.color}14`, border: `1px solid ${s.color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={18} color={s.color} />
                      </div>
                      <span style={{ fontSize: "0.6rem", fontFamily: "Orbitron", fontWeight: 700, color: "var(--text-muted)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: "100px", textTransform: "uppercase" }}>
                        solution
                      </span>
                    </div>
                    <h4 className="font-orbitron" style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "8px" }}>{s.title}</h4>
                    <p className="font-exo" style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px", flex: 1 }}>{s.desc}</p>
                    <button
                      onClick={() => setActiveSandbox(s.id)}
                      className="btn-ghost"
                      style={{ padding: "8px 16px", fontSize: "0.75rem", width: "100%", justifyContent: "center", color: s.color, borderColor: s.color }}
                    >
                      Launch Sandbox
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          PLAYGROUND VIEWS
         ------------------------------------------------------------- */}
      {activeSandbox !== null && (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Back button */}
          <button
            onClick={() => {
              setActiveSandbox(null);
              setMatchAudited(false);
              setMatchResult(null);
              setQuizStep(0);
              setQuizAnswers({});
              setReadinessStep(0);
              setReadinessAnswers({});
              setSupportOutput(null);
              setRagAnswer("");
              setRagSteps([]);
              setHrCandidates([]);
            }}
            className="btn-ghost"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", padding: "6px 14px", marginBottom: "28px" }}
          >
            <ArrowLeft size={12} /> Back to Sandbox Directory
          </button>

          {/* SIMULATOR: CerebroFlow */}
          {activeSandbox === "flow" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h3 className="font-orbitron text-glow-blue" style={{ fontSize: "1.25rem", color: "var(--neural-blue)" }}>CerebroFlow Visual Simulator</h3>
                <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Configure pipeline nodes and run execution logs.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                <div className="card-glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <span className="font-orbitron" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Add Pipeline Nodes</span>
                  <button onClick={() => addFlowNode("Trigger", "Webhook API Received", "var(--hive-orange)")} className="btn-ghost" style={{ padding: "8px", fontSize: "0.75rem", borderColor: "rgba(255,138,0,0.3)", color: "var(--hive-orange)" }}>+ Webhook Trigger</button>
                  <button onClick={() => addFlowNode("AI Node", "Sentiment Router", "var(--neural-blue)")} className="btn-ghost" style={{ padding: "8px", fontSize: "0.75rem", borderColor: "rgba(0,229,255,0.3)", color: "var(--neural-blue)" }}>+ AI Node</button>
                  <button onClick={() => addFlowNode("Action", "Slack Alerts Node", "var(--violet)")} className="btn-ghost" style={{ padding: "8px", fontSize: "0.75rem", borderColor: "rgba(123,97,255,0.3)", color: "var(--violet)" }}>+ Action Node</button>
                  <button onClick={clearFlowCanvas} className="btn-ghost" style={{ padding: "8px", fontSize: "0.75rem", color: "var(--text-muted)", borderColor: "rgba(255,255,255,0.1)" }}>Clear Nodes</button>
                </div>

                <div className="card-glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", flex: 2 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="font-orbitron" style={{ fontSize: "0.75rem", color: "var(--text-primary)" }}>Canvas Map</span>
                    <button onClick={runFlowSimulation} disabled={flowRunning || flowNodes.length === 0} className="btn-primary" style={{ padding: "6px 14px", fontSize: "0.75rem" }}>
                      <Play size={10} fill="#080B14" /> {flowRunning ? "Executing..." : "Run Pipeline"}
                    </button>
                  </div>

                  {/* Node canvas blocks */}
                  <div style={{ minHeight: "80px", display: "flex", gap: "12px", alignItems: "center", overflowX: "auto", background: "rgba(0,0,0,0.2)", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: "8px", padding: "12px" }}>
                    {flowNodes.length === 0 ? (
                      <span className="font-exo" style={{ fontSize: "0.8rem", color: "var(--text-dim)", margin: "0 auto" }}>Canvas empty. Click parameters left.</span>
                    ) : (
                      flowNodes.map((node, i) => (
                        <React.Fragment key={node.id}>
                          <div style={{ padding: "8px 12px", border: `1px solid ${node.color}`, borderRadius: "6px", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                            <span className="font-mono" style={{ fontSize: "0.55rem", color: node.color, textTransform: "uppercase", display: "block" }}>{node.type}</span>
                            <span className="font-orbitron" style={{ fontSize: "0.75rem", color: "var(--text-primary)" }}>{node.label}</span>
                          </div>
                          {i < flowNodes.length - 1 && <span className="font-mono" style={{ color: "var(--text-dim)" }}>→</span>}
                        </React.Fragment>
                      ))
                    )}
                  </div>

                  {/* Terminal log logs */}
                  <div className="font-mono" style={{ background: "#04060A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", padding: "12px", height: "120px", overflowY: "auto", fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {flowLogs.length === 0 ? (
                      <span style={{ color: "var(--text-dim)" }}>Logs empty. Launch pipeline execution trace.</span>
                    ) : (
                      flowLogs.map((log, i) => (
                        <div key={i} style={{ color: log.includes("Success") ? "var(--neural-blue)" : "var(--text-muted)" }}>{log}</div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR: CerebroAgent Swarm */}
          {activeSandbox === "agent" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h3 className="font-orbitron text-glow-blue" style={{ fontSize: "1.25rem", color: "var(--violet)" }}>CerebroAgent Swarm</h3>
                <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Simulate a multi-agent workflow solving strategic briefings.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "20px" }}>
                <div className="card-glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label className="font-orbitron" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Configure Swarm Target</label>
                    <input
                      type="text"
                      value={agentObjective}
                      onChange={(e) => setAgentObjective(e.target.value)}
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "10px", color: "var(--text-primary)", fontSize: "0.8rem", marginTop: "6px", fontFamily: "var(--font-exo)" }}
                    />
                  </div>
                  <button onClick={runAgentSimulation} disabled={agentRunning} className="btn-primary" style={{ width: "100%", background: "linear-gradient(135deg, var(--violet), var(--hot-pink))", boxShadow: "0 0 20px rgba(123,97,255,0.3)" }}>
                    {agentRunning ? "Simulating Swarm..." : "Deploy Swarm"}
                  </button>

                  <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                    <span className="font-orbitron" style={{ fontSize: "0.65rem", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>Active Swarm Members</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}><span className="font-orbitron" style={{ color: "var(--neural-blue)" }}>Research Node</span><span className="font-mono text-xs text-[#8892A4]">Claude-3.5</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}><span className="font-orbitron" style={{ color: "var(--violet)" }}>Lead Planner</span><span className="font-mono text-xs text-[#8892A4]">GPT-4o</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}><span className="font-orbitron" style={{ color: "var(--hot-pink)" }}>Copywriter Node</span><span className="font-mono text-xs text-[#8892A4]">Gemini-1.5</span></div>
                    </div>
                  </div>
                </div>

                <div className="card-glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <span className="font-orbitron" style={{ fontSize: "0.75rem", color: "var(--text-primary)" }}>Console Feed & Outputs</span>

                  <div className="font-mono" style={{ background: "#04060A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", padding: "12px", height: "150px", overflowY: "auto", fontSize: "0.72rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {agentLogs.length === 0 ? (
                      <span style={{ color: "var(--text-dim)" }}>Swarm inactive. Configure prompt objective and click Deploy.</span>
                    ) : (
                      agentLogs.map((log, i) => (
                        <div key={i}>
                          <span style={{ color: log.color, fontWeight: "bold" }}>[{log.sender}]:</span> {log.text}
                        </div>
                      ))
                    )}
                  </div>

                  {agentResult && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <span className="font-orbitron" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Final Markdown Output</span>
                      <textarea
                        readOnly
                        value={agentResult}
                        style={{ width: "100%", height: "120px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", padding: "10px", color: "var(--text-primary)", fontSize: "0.75rem", fontFamily: "monospace", resize: "none" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR: CerebroLearn Quiz */}
          {activeSandbox === "learn" && (
            <div className="card-glass" style={{ padding: "32px", border: "1px solid rgba(255,46,209,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "16px", marginBottom: "24px" }}>
                <div>
                  <h3 className="font-orbitron" style={{ fontSize: "1.25rem", color: "var(--hot-pink)" }}>CerebroLearn Proctored Certification</h3>
                  <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Knowledge verification assessment module.</p>
                </div>
                {quizStep > 0 && quizStep <= 3 && (
                  <span className="font-orbitron" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Question {quizStep} of 3</span>
                )}
              </div>

              {/* Start step */}
              {quizStep === 0 && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Award size={48} color="var(--hot-pink)" style={{ margin: "0 auto 16px auto" }} />
                  <h4 className="font-orbitron" style={{ fontSize: "1.05rem", marginBottom: "8px" }}>Academy Certification Assessment</h4>
                  <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto 24px auto", lineHeight: 1.6 }}>
                    This mini quiz validates prompt architecture and multi-agent workflow integration concepts. Answer 100% correctly to generate your digital credentials.
                  </p>
                  <button onClick={() => setQuizStep(1)} className="btn-primary" style={{ background: "linear-gradient(135deg, var(--hot-pink), var(--violet))", boxShadow: "0 0 20px rgba(255,46,209,0.3)" }}>
                    Begin Assessment
                  </button>
                </div>
              )}

              {/* Q1, Q2, Q3 steps */}
              {quizStep >= 1 && quizStep <= 3 && (() => {
                const question = quizQuestions[quizStep - 1];
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h4 className="font-orbitron" style={{ fontSize: "1rem", color: "var(--text-primary)" }}>{question.q}</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {question.options.map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => {
                            setQuizAnswers(prev => ({ ...prev, [question.id]: opt.key }));
                            if (quizStep < 3) {
                              setQuizStep(quizStep + 1);
                            } else {
                              submitQuizAnswers();
                            }
                          }}
                          className="btn-ghost"
                          style={{
                            textAlign: "left",
                            padding: "14px 20px",
                            justifyContent: "flex-start",
                            color: "var(--text-muted)",
                            borderColor: "rgba(255,255,255,0.06)",
                            background: quizAnswers[question.id] === opt.key ? "rgba(255,46,209,0.08)" : "rgba(255,255,255,0.02)"
                          }}
                        >
                          <span className="font-orbitron" style={{ fontWeight: "bold", marginRight: "12px", color: "var(--hot-pink)" }}>{opt.key.toUpperCase()}</span>
                          <span className="font-exo">{opt.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Results step */}
              {quizStep === 4 && (
                <div style={{ textAlign: "center", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  {quizPassed ? (
                    <>
                      <Award size={48} color="var(--amber)" style={{ margin: "0 auto" }} />
                      <h4 className="font-orbitron text-glow-orange" style={{ fontSize: "1.3rem", color: "var(--amber)" }}>Assessment Passed! 100% Score</h4>
                      <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "450px", margin: "0 auto" }}>
                        Congratulations. Your answers match verification benchmarks. Your digital certification hash has been compiled.
                      </p>
                      {/* Certified box */}
                      <div className="card-glass" style={{ padding: "24px", maxWidth: "400px", margin: "12px auto", border: "1px solid var(--border-blue)", background: "rgba(0,229,255,0.02)" }}>
                        <span className="font-orbitron" style={{ fontSize: "0.55rem", color: "var(--amber)", letterSpacing: "0.15em", textTransform: "uppercase", display: "block" }}>CerebroHive Academy</span>
                        <strong className="font-orbitron" style={{ fontSize: "0.95rem", color: "var(--text-primary)", display: "block", marginTop: "4px" }}>Prompt & Agent Orchestration</strong>
                        <span className="font-mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>Credential: CH-CERT-VERIFY-PASS</span>
                        <span className="font-exo" style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "6px" }}>Recipient: guest@cerebro-hive.com</span>
                      </div>
                      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                        <button onClick={handleDownloadCert} className="btn-primary" style={{ background: "linear-gradient(135deg, var(--amber), var(--hive-orange))" }}>
                          Download Certificate File
                        </button>
                        <button onClick={() => setQuizStep(0)} className="btn-ghost" style={{ color: "var(--text-primary)", borderColor: "rgba(255,255,255,0.1)" }}>
                          Reset Quiz
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={48} color="var(--hive-orange)" style={{ margin: "0 auto" }} />
                      <h4 className="font-orbitron" style={{ fontSize: "1.15rem", color: "var(--hive-orange)" }}>Audit Failed - Incorrect Answers</h4>
                      <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto" }}>
                        Verification standards require a score of 100%. Review prompt engineering and LangGraph document files.
                      </p>
                      <button onClick={() => { setQuizStep(0); setQuizAnswers({}); }} className="btn-primary" style={{ margin: "12px auto 0 auto" }}>
                        Retry Assessment
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SIMULATOR: CerebroERP Ledger */}
          {activeSandbox === "erp_product" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h3 className="font-orbitron text-glow-blue" style={{ fontSize: "1.25rem", color: "var(--hive-orange)" }}>CerebroERP Transaction Auditor</h3>
                <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Review automated cost anomaly detections inside ERP general ledgers.</p>
              </div>

              <div className="card-glass" style={{ overflowX: "auto", padding: "16px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                      <th style={{ padding: "12px" }}>Reference</th>
                      <th style={{ padding: "12px" }}>Description</th>
                      <th style={{ padding: "12px" }}>Total</th>
                      <th style={{ padding: "12px" }}>Anomaly Status</th>
                      <th style={{ padding: "12px" }}>Auditor Findings</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map(row => (
                      <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td className="font-mono" style={{ padding: "12px", color: "var(--text-primary)" }}>{row.id}</td>
                        <td className="font-exo" style={{ padding: "12px", color: "var(--text-muted)" }}>{row.desc}</td>
                        <td className="font-mono" style={{ padding: "12px", color: "var(--neural-blue)", fontWeight: "bold" }}>{row.amount}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{
                            padding: "2px 8px", borderRadius: "100px", fontSize: "0.65rem", fontFamily: "Orbitron", fontWeight: "bold",
                            background: row.status.includes("Anomaly") ? "rgba(255,138,0,0.1)" : row.status.includes("Pass") ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)",
                            color: row.status.includes("Anomaly") ? "var(--hive-orange)" : row.status.includes("Pass") ? "#10B981" : "var(--text-muted)",
                            border: `1px solid ${row.status.includes("Anomaly") ? "var(--hive-orange)" : row.status.includes("Pass") ? "#10B981" : "rgba(255,255,255,0.06)"}`
                          }}>
                            {row.status}
                          </span>
                        </td>
                        <td className="font-exo" style={{ padding: "12px", color: "var(--text-muted)" }}>{row.reason}</td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          {row.state === "pending" ? (
                            <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                              <button onClick={() => auditAction(row.id, "approve")} className="btn-primary" style={{ padding: "4px 8px", fontSize: "0.65rem", background: "#10B981", boxShadow: "none" }}>Approve</button>
                              <button onClick={() => auditAction(row.id, "flag")} className="btn-ghost" style={{ padding: "4px 8px", fontSize: "0.65rem", color: "var(--hive-orange)", borderColor: "var(--hive-orange)" }}>Flag</button>
                            </div>
                          ) : (
                            <span className="font-mono" style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SIMULATOR: AI Readiness Assessment */}
          {activeSandbox === "readiness" && (
            <div className="card-glass" style={{ padding: "32px", border: "1px solid rgba(0,229,255,0.15)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "16px", marginBottom: "24px" }}>
                <div>
                  <h3 className="font-orbitron" style={{ fontSize: "1.25rem", color: "var(--neural-blue)" }}>AI Readiness Diagnostic Scanner</h3>
                  <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Evaluate operational parameters to blueprint an AI strategy.</p>
                </div>
                {readinessStep > 0 && readinessStep <= 4 && (
                  <span className="font-orbitron" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Question {readinessStep} of 4</span>
                )}
              </div>

              {readinessStep === 0 && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Award size={48} color="var(--neural-blue)" style={{ margin: "0 auto 16px auto" }} />
                  <h4 className="font-orbitron" style={{ fontSize: "1.05rem", marginBottom: "8px" }}>AI Maturity Assessment</h4>
                  <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "450px", margin: "0 auto 24px auto", lineHeight: 1.6 }}>
                    Evaluate your infrastructure across Data, Technology, Talent, and Process dimensions. Takes 2 minutes to generate audit roadmaps.
                  </p>
                  <button onClick={() => setReadinessStep(1)} className="btn-primary" style={{ background: "linear-gradient(135deg, var(--neural-blue), var(--violet))" }}>
                    Start Diagnostic
                  </button>
                </div>
              )}

              {readinessStep >= 1 && readinessStep <= 4 && (() => {
                const question = readinessQs[readinessStep - 1];
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h4 className="font-orbitron" style={{ fontSize: "1rem", color: "var(--text-primary)" }}>{question.text}</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {question.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setReadinessAnswers(prev => ({ ...prev, [question.id]: opt.score }));
                            if (readinessStep < 4) {
                              setReadinessStep(readinessStep + 1);
                            } else {
                              setReadinessStep(5);
                            }
                          }}
                          className="btn-ghost"
                          style={{
                            textAlign: "left",
                            padding: "14px 20px",
                            justifyContent: "flex-start",
                            color: "var(--text-muted)",
                            borderColor: "rgba(255,255,255,0.06)",
                            background: "rgba(255,255,255,0.02)"
                          }}
                        >
                          <span className="font-exo">{opt.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {readinessStep === 5 && (
                <div style={{ textAlign: "center", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <Award size={48} color="var(--neural-blue)" style={{ margin: "0 auto" }} />
                  <h4 className="font-orbitron text-glow-blue" style={{ fontSize: "1.3rem", color: "var(--neural-blue)" }}>Readiness Score: {handleReadinessScore()}/100</h4>
                  <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto" }}>
                    Diagnostics complete. Your company registers at the <strong style={{ color: "var(--text-primary)" }}>{handleReadinessScore() < 40 ? "Ad-Hoc" : handleReadinessScore() < 70 ? "Exploring" : "AI-Native"} Tier</strong>.
                  </p>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "12px" }}>
                    <button onClick={downloadReadinessReport} className="btn-primary">
                      Download Readiness Report
                    </button>
                    <button onClick={() => { setReadinessStep(0); setReadinessAnswers({}); }} className="btn-ghost" style={{ color: "var(--text-primary)", borderColor: "rgba(255,255,255,0.1)" }}>
                      Reset Audit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SIMULATOR: Workflow ROI Calculator */}
          {activeSandbox === "roi" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h3 className="font-orbitron text-glow-blue" style={{ fontSize: "1.25rem", color: "var(--violet)" }}>Automation Savings ROI Calculator</h3>
                <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Estimate operational savings from deploying CerebroFlow agent pipelines.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", alignItems: "center" }}>
                <div className="card-glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span className="font-orbitron" style={{ fontSize: "0.75rem", color: "var(--text-primary)" }}>Team Size (Employees)</span>
                      <span className="font-mono" style={{ fontSize: "0.85rem", color: "var(--violet)", fontWeight: "bold" }}>{roiTeamSize} members</span>
                    </div>
                    <input type="range" min="1" max="100" value={roiTeamSize} onChange={(e) => setRoiTeamSize(Number(e.target.value))} style={{ width: "100%", height: "4px", accentColor: "var(--violet)", cursor: "pointer" }} />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span className="font-orbitron" style={{ fontSize: "0.75rem", color: "var(--text-primary)" }}>Manual Hours / Employee / Day</span>
                      <span className="font-mono" style={{ fontSize: "0.85rem", color: "var(--violet)", fontWeight: "bold" }}>{roiHoursDaily} hrs</span>
                    </div>
                    <input type="range" min="1" max="8" value={roiHoursDaily} onChange={(e) => setRoiHoursDaily(Number(e.target.value))} style={{ width: "100%", height: "4px", accentColor: "var(--violet)", cursor: "pointer" }} />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span className="font-orbitron" style={{ fontSize: "0.75rem", color: "var(--text-primary)" }}>Average Hourly Cost (INR/$)</span>
                      <span className="font-mono" style={{ fontSize: "0.85rem", color: "var(--violet)", fontWeight: "bold" }}>${roiHourlyRate}/hr</span>
                    </div>
                    <input type="range" min="10" max="150" value={roiHourlyRate} onChange={(e) => setRoiHourlyRate(Number(e.target.value))} style={{ width: "100%", height: "4px", accentColor: "var(--violet)", cursor: "pointer" }} />
                  </div>
                </div>

                <div className="card-glass" style={{ padding: "28px", background: "rgba(255,255,255,0.015)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span className="font-exo" style={{ color: "var(--text-muted)" }}>Current Manual Process Cost:</span>
                      <span className="font-mono" style={{ textDecoration: "line-through", color: "var(--text-dim)" }}>${roiMetrics.manual.toLocaleString()}/yr</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span className="font-exo" style={{ color: "var(--text-muted)" }}>CerebroFlow Automated Cost:</span>
                      <span className="font-mono" style={{ color: "var(--text-primary)", fontWeight: "bold" }}>${roiMetrics.automated.toLocaleString()}/yr</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                      <span className="font-exo" style={{ color: "var(--text-muted)" }}>Annual Time Reclaimed:</span>
                      <span className="font-mono" style={{ color: "var(--neural-blue)", fontWeight: "bold" }}>{roiMetrics.hours.toLocaleString()} hours/yr</span>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="font-orbitron" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--violet)" }}>ESTIMATED NET SAVINGS</span>
                      <span className="font-mono text-glow-blue" style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--neural-blue)" }}>${roiMetrics.savings.toLocaleString()}/yr</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR: Customer Support AI Classifier */}
          {activeSandbox === "support" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h3 className="font-orbitron text-glow-blue" style={{ fontSize: "1.25rem", color: "var(--neural-blue)" }}>Customer Support AI Responder</h3>
                <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Select or input custom emails. Ingest, score sentiment, and auto-draft reply protocols.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="card-glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <span className="font-orbitron" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Load Sample Template</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {supportTemplates.map((t, i) => (
                      <button key={i} onClick={() => setSupportText(t.text)} className="btn-ghost" style={{ padding: "8px 12px", fontSize: "0.75rem", justifyContent: "flex-start", textAlign: "left", borderColor: "rgba(255,255,255,0.06)" }}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="font-orbitron" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Inbound Support Email Text</label>
                    <textarea
                      value={supportText}
                      onChange={(e) => setSupportText(e.target.value)}
                      style={{ width: "100%", height: "100px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "10px", color: "var(--text-primary)", fontSize: "0.8rem", marginTop: "6px", fontFamily: "var(--font-exo)", resize: "none" }}
                    />
                  </div>
                  <button onClick={runSupportSimulation} disabled={supportRunning} className="btn-primary" style={{ width: "100%" }}>
                    {supportRunning ? "Analyzing Inbound..." : "Analyze & Draft Auto-Reply"}
                  </button>
                </div>

                <div className="card-glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <span className="font-orbitron" style={{ fontSize: "0.75rem", color: "var(--text-primary)" }}>Extraction Metadata & Reply</span>

                  {supportOutput ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
                        <div>
                          <span className="font-orbitron" style={{ fontSize: "0.55rem", color: "var(--text-muted)", display: "block" }}>Category Class</span>
                          <strong className="font-orbitron" style={{ fontSize: "0.75rem", color: "var(--neural-blue)" }}>{supportOutput.category}</strong>
                        </div>
                        <div>
                          <span className="font-orbitron" style={{ fontSize: "0.55rem", color: "var(--text-muted)", display: "block" }}>Sentiment Index</span>
                          <strong className="font-orbitron" style={{ fontSize: "0.75rem", color: "var(--hive-orange)" }}>{supportOutput.sentiment}</strong>
                        </div>
                        <div>
                          <span className="font-orbitron" style={{ fontSize: "0.55rem", color: "var(--text-muted)", display: "block" }}>SLA Priority</span>
                          <strong className="font-orbitron" style={{ fontSize: "0.75rem", color: "red" }}>{supportOutput.priority}</strong>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="font-orbitron" style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Compiled Response Draft</span>
                        <textarea
                          readOnly
                          value={supportOutput.reply}
                          style={{ width: "100%", height: "110px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", padding: "10px", color: "var(--text-primary)", fontSize: "0.78rem", fontFamily: "var(--font-exo)", resize: "none" }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="font-exo" style={{ fontSize: "0.8rem", color: "var(--text-dim)", margin: "auto" }}>Simulation pending analysis. Click button left.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR: Enterprise Semantic RAG */}
          {activeSandbox === "rag" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h3 className="font-orbitron text-glow-blue" style={{ fontSize: "1.25rem", color: "var(--violet)" }}>Semantic RAG Search Tracer</h3>
                <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Ask questions over simulated security policy indices and trace step-by-step vector generations.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "20px" }}>
                <div className="card-glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <span className="font-orbitron" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Select Sample Query</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <button onClick={() => setRagQuery("What are the database backup rules?")} className="btn-ghost" style={{ padding: "6px", fontSize: "0.72rem", justifyContent: "flex-start", textAlign: "left", borderColor: "rgba(255,255,255,0.05)" }}>What are the database backup rules?</button>
                    <button onClick={() => setRagQuery("What encryption protocols govern API nodes?")} className="btn-ghost" style={{ padding: "6px", fontSize: "0.72rem", justifyContent: "flex-start", textAlign: "left", borderColor: "rgba(255,255,255,0.05)" }}>What encryption protocols govern API nodes?</button>
                    <button onClick={() => setRagQuery("Who maintains access keys for production storage?")} className="btn-ghost" style={{ padding: "6px", fontSize: "0.72rem", justifyContent: "flex-start", textAlign: "left", borderColor: "rgba(255,255,255,0.05)" }}>Who maintains access keys for production storage?</button>
                  </div>

                  <button onClick={runRagSimulation} disabled={ragRunning} className="btn-primary" style={{ width: "100%", background: "linear-gradient(135deg, var(--violet), var(--neural-blue))" }}>
                    {ragRunning ? "Retrieving Embeddings..." : "Execute Semantic Search"}
                  </button>
                </div>

                <div className="card-glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <span className="font-orbitron" style={{ fontSize: "0.75rem", color: "var(--text-primary)" }}>Semantic Search Execution Tracer</span>

                  <div className="font-mono" style={{ background: "#04060A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "6px", padding: "12px", height: "130px", overflowY: "auto", fontSize: "0.7rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                    {ragSteps.length === 0 ? (
                      <span style={{ color: "var(--text-dim)" }}>Search tracer inactive. Trigger queries left to watch vector pipelines.</span>
                    ) : (
                      ragSteps.map((step, idx) => (
                        <div key={idx}>
                          <span style={{ color: "var(--neural-blue)", fontWeight: "bold" }}>[Step {idx + 1} - {step.label}]:</span> {step.details}
                        </div>
                      ))
                    )}
                  </div>

                  {ragAnswer && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="font-orbitron" style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>Grounded LLM Response</span>
                      <p className="font-exo" style={{ fontSize: "0.8rem", color: "var(--text-primary)", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "6px", padding: "8px 12px", lineHeight: 1.5 }}>
                        {ragAnswer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR: AI HR Recruiter */}
          {activeSandbox === "recruiter" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h3 className="font-orbitron text-glow-blue" style={{ fontSize: "1.25rem", color: "var(--hot-pink)" }}>AI Recruitment & Resume Screener</h3>
                <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Select job configurations to trigger automated applicant resume rankings and scoring.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "20px" }}>
                <div className="card-glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label className="font-orbitron" style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Select Job Role</label>
                    <select
                      value={hrJob}
                      onChange={(e) => setHrJob(e.target.value)}
                      style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "10px", color: "var(--text-primary)", fontSize: "0.8rem", marginTop: "6px", fontFamily: "var(--font-exo)" }}
                    >
                      <option value="Senior Frontend Architect" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>Senior Frontend Architect</option>
                      <option value="Lead MLOps Engineer" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>Lead MLOps Engineer</option>
                    </select>
                  </div>
                  <button onClick={runHrSimulation} disabled={hrRunning} className="btn-primary" style={{ width: "100%", background: "linear-gradient(135deg, var(--hot-pink), var(--violet))" }}>
                    {hrRunning ? "Screening Resumes..." : "Screen Applicants"}
                  </button>
                </div>

                <div className="card-glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <span className="font-orbitron" style={{ fontSize: "0.75rem", color: "var(--text-primary)" }}>Ranked Candidates list</span>

                  {hrCandidates.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {hrCandidates.map(c => (
                        <div key={c.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "10px" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <strong className="font-orbitron" style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>{c.name}</strong>
                              <span className="font-mono" style={{ fontSize: "0.75rem", color: c.score >= 80 ? "var(--neural-blue)" : c.score >= 60 ? "var(--amber)" : "var(--hive-orange)" }}>{c.score}% Match</span>
                            </div>
                            <span className="font-exo" style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "4px" }}>{c.notes}</span>
                          </div>

                          <div style={{ marginLeft: "12px" }}>
                            {c.status === "undecided" ? (
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button onClick={() => hrAction(c.name, "Shortlisted")} className="btn-primary" style={{ padding: "4px 8px", fontSize: "0.6rem", background: "var(--neural-blue)", boxShadow: "none" }}>Shortlist</button>
                                <button onClick={() => hrAction(c.name, "Rejected")} className="btn-ghost" style={{ padding: "4px 8px", fontSize: "0.6rem", color: "var(--text-dim)", borderColor: "rgba(255,255,255,0.1)" }}>Reject</button>
                              </div>
                            ) : (
                              <span className="font-orbitron" style={{ fontSize: "0.65rem", color: c.status === "Shortlisted" ? "var(--neural-blue)" : "var(--text-dim)", textTransform: "uppercase" }}>{c.status}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="font-exo" style={{ fontSize: "0.8rem", color: "var(--text-dim)", margin: "auto" }}>Select a job role and trigger parsing.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR: Invoice 3-Way Matcher */}
          {activeSandbox === "matcher" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div>
                <h3 className="font-orbitron text-glow-blue" style={{ fontSize: "1.25rem", color: "var(--hive-orange)" }}>Invoice 3-Way Matcher</h3>
                <p className="font-exo" style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Compare scanned invoices against Purchase Orders and Goods Received Notes.</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}>
                <div className="card-glass" style={{ padding: "24px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "10px" }}>Parameter Field</th>
                        <th style={{ padding: "10px" }}>Inbound Invoice</th>
                        <th style={{ padding: "10px" }}>Purchase Order</th>
                        <th style={{ padding: "10px" }}>Goods Received Note</th>
                        <th style={{ padding: "10px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.map(row => (
                        <tr key={row.field} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <td className="font-orbitron" style={{ padding: "10px", color: "var(--text-primary)" }}>{row.field}</td>
                          <td className="font-mono" style={{ padding: "10px", color: "var(--text-muted)" }}>{row.invoice}</td>
                          <td className="font-mono" style={{ padding: "10px", color: "var(--text-muted)" }}>{row.po}</td>
                          <td className="font-mono" style={{ padding: "10px", color: "var(--text-muted)" }}>{row.grn}</td>
                          <td style={{ padding: "10px" }}>
                            <span style={{
                              padding: "2px 8px", borderRadius: "100px", fontSize: "0.6rem", fontFamily: "Orbitron", fontWeight: "bold",
                              background: row.status === "Mismatch" ? "rgba(255,138,0,0.1)" : "rgba(16,185,129,0.1)",
                              color: row.status === "Mismatch" ? "var(--hive-orange)" : "#10B981",
                              border: `1px solid ${row.status === "Mismatch" ? "var(--hive-orange)" : "#10B981"}`
                            }}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="card-glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <span className="font-orbitron" style={{ fontSize: "0.75rem", color: "var(--text-primary)" }}>Matcher Audit Findings</span>

                  {!matchAudited ? (
                    <button onClick={runMatchAudit} className="btn-primary" style={{ width: "100%", background: "linear-gradient(135deg, var(--hive-orange), var(--violet))" }}>
                      Run Match Audit
                    </button>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div className="font-exo" style={{ fontSize: "0.8rem", color: "var(--hive-orange)", background: "rgba(255,138,0,0.08)", border: "1px solid var(--hive-orange)", borderRadius: "6px", padding: "12px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                        <span>{matchResult}</span>
                      </div>
                      <button className="btn-primary" style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-primary)", boxShadow: "none" }}>
                        Create Debit Note Ticket
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
