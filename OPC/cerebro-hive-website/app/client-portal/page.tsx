"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, LayoutDashboard, FileText, Landmark, MessageSquare, LineChart, CheckCircle2, Clock, Download, ArrowUpRight, Send, Check, Building, FlaskConical, LogOut, RefreshCw } from "lucide-react";
import FreeTierDashboard from "@/components/dashboard/FreeTierDashboard";
import AuthGate from "@/components/dashboard/AuthGate";

interface Project {
  name: string;
  progress: number;
  status: "Completed" | "In Progress" | "Planned";
  lastUpdate: string;
  milestones: { name: string; date: string; status: "completed" | "active" | "pending" }[];
}

interface Invoice {
  id: string;
  description: string;
  amount: string;
  status: string;
  date: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  date: string;
}

const PROJECTS_DATA: Project[] = [
  {
    name: "Enterprise RAG Pipeline & Semantic Knowledge Base",
    progress: 80,
    status: "In Progress",
    lastUpdate: "June 14, 2026",
    milestones: [
      { name: "SOP Document Ingestion & PII Filtering Pipeline", date: "May 10", status: "completed" },
      { name: "Vector Database Setup (Pinecone) & Schema Design", date: "May 25", status: "completed" },
      { name: "Custom LLM API Proxy Gateway Deployment", date: "June 08", status: "completed" },
      { name: "LangGraph Multi-Agent Retrieval Routing Layer", date: "June 25", status: "active" },
      { name: "User Interface Integration & UAT Validation", date: "July 15", status: "pending" }
    ]
  },
  {
    name: "Customer Support email Classifier & Auto-responder",
    progress: 100,
    status: "Completed",
    lastUpdate: "May 28, 2026",
    milestones: [
      { name: "Intent Classification Prompts Optimization", date: "April 05", status: "completed" },
      { name: "n8n Webhook Orchestration Development", date: "April 20", status: "completed" },
      { name: "Legacy ticketing API integration hooks", date: "May 12", status: "completed" },
      { name: "Validation sandbox test cycles & sign-off", date: "May 28", status: "completed" }
    ]
  }
];

const INVOICES_DATA = [
  { id: "INV-2026-004", description: "RAG Pipeline Sprint 2", amount: "$12,500.00", status: "Paid", date: "June 05, 2026" },
  { id: "INV-2026-003", description: "RAG Pipeline Setup & Ingestion", amount: "$15,000.00", status: "Paid", date: "May 10, 2026" },
  { id: "INV-2026-002", description: "Support Automation Completed Milestone", amount: "$18,500.00", status: "Paid", date: "May 01, 2026" },
  { id: "INV-2026-001", description: "Project Initiation Retainer", amount: "$20,000.00", status: "Paid", date: "April 01, 2026" }
];

const DOCUMENTS_DATA: Document[] = [
  { id: "DOC-001", name: "Master Services Agreement (MSA)", type: "PDF", size: "2.4 MB", date: "April 01, 2026" },
  { id: "DOC-002", name: "Statement of Work (SOW) — AI Agent Pipelines", type: "PDF", size: "1.8 MB", date: "April 05, 2026" },
  { id: "DOC-003", name: "Technical Architecture Blueprint — RAG Gateway", type: "PDF", size: "4.2 MB", date: "May 18, 2026" },
  { id: "DOC-004", name: "Security Audit & PII Gateway Compliance Report", type: "PDF", size: "1.1 MB", date: "June 02, 2026" }
];

function generateInvoice(invId: string) {
  return `
=========================================================
                CEREBROHIVE — OFFICIAL INVOICE
=========================================================
Invoice Reference: ${invId}
Date: June 05, 2026
Billing Account: AeroSpace Global AI Integration
Client Email: billing@aerospace-global.com
Client Address: 500 Orbit Way, Houston, TX 77058
---------------------------------------------------------
ITEM DESCRIPTION                       AMOUNT
---------------------------------------------------------
RAG Pipeline Sprint 2 Development      $12,500.00
- Custom LLM API Proxy Gateway Deploy
- Pinecone Schema configuration
---------------------------------------------------------
SUBTOTAL                               $12,500.00
TAX (0%)                               $0.00
TOTAL PAID                             $12,500.00
---------------------------------------------------------
Payment Status: VERIFIED AND COMPLETED
Verification Code: INV-PAID-HASH-${Math.random().toString(36).substring(2, 9).toUpperCase()}
=========================================================
  `;
}

function generateDocument(docName: string) {
  return `
=========================================================
      CEREBROHIVE DOCUMENT RESOURCE DOWNLOADER
=========================================================
Document: ${docName}
Account Partner: AeroSpace Global AI Integration
Downloaded: ${new Date().toLocaleDateString()}
---------------------------------------------------------
This is a secure technical asset. Please ensure access
compliance is maintained according to the MSA terms.
=========================================================
  `;
}

export default function ClientDashboardPage() {
  const [workspaceMode, setWorkspaceMode] = useState<"enterprise" | "free">("free");
  const [activeTab, setActiveTab] = useState<"projects" | "invoices" | "documents" | "support" | "reporting">("projects");
  
  const [projects, setProjects] = useState<Project[]>(PROJECTS_DATA);
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES_DATA);
  const [documents, setDocuments] = useState<Document[]>(DOCUMENTS_DATA);
  const [supportTickets, setSupportTickets] = useState<{ id: string; subject: string; message: string; date: string; status: string }[]>([]);
  
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userSession, setUserSession] = useState<{ email: string; company: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const handleAuthSuccess = (session: { email: string; company: string }) => {
    localStorage.setItem("cerebro_user_session", JSON.stringify(session));
    setUserSession(session);
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem("cerebro_user_session");
    setUserSession(null);
    setIsAuthenticated(false);
  };

  // Fetch data and auth on mount
  useEffect(() => {
    // Check auth
    const session = localStorage.getItem("cerebro_user_session");
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed && parsed.email && parsed.company) {
          setUserSession(parsed);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Failed to parse auth session:", e);
      }
    }
    setAuthLoading(false);

    async function loadDashboardData() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.projects) setProjects(data.projects);
          if (data.invoices) setInvoices(data.invoices);
          if (data.documents) setDocuments(data.documents);
        }

        const ticketsRes = await fetch("/api/tickets");
        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json();
          if (ticketsData.tickets) setSupportTickets(ticketsData.tickets);
        }
      } catch (err) {
        console.error("Error loading dashboard API data:", err);
      }
    }
    loadDashboardData();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: ticketSubject, message: ticketMessage })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ticket) {
          setSupportTickets(prev => [data.ticket, ...prev]);
        }
        setTicketSubject("");
        setTicketMessage("");
        setTicketSubmitted(true);
        setTimeout(() => setTicketSubmitted(false), 3000);
      }
    } catch (err) {
      console.error("Failed to submit support ticket to API:", err);
    }
  };

  const handleDownloadInvoice = (invId: string) => {
    const textInvoice = generateInvoice(invId);
    const blob = new Blob([textInvoice], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${invId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocument = (docName: string) => {
    const docText = generateDocument(docName);
    const blob = new Blob([docText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "var(--bg-primary)" }}>
        <RefreshCw className="animate-spin" size={32} color="var(--neural-blue)" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", paddingBottom: "96px", paddingTop: "40px" }}>
        {/* Background Glows */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "25%", left: "25%", width: "384px", height: "384px", background: "rgba(0, 229, 255, 0.05)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />
        
        <div className="container-wide" style={{ position: "relative", zIndex: 10 }}>
          <AuthGate onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    );
  }

  const companyNameHash = userSession ? `AS-${userSession.company.toUpperCase().slice(0, 5).replace(/\s/g, "")}-AI` : "AS-77490-AI";

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", paddingBottom: "96px", paddingTop: "40px" }}>
      {/* Background Glows */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "25%", left: "25%", width: "384px", height: "384px", background: "rgba(0, 229, 255, 0.05)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />

      <div className="container-wide" style={{ position: "relative", zIndex: 10 }}>
        {/* Workspace Mode Switcher (Segmented Control style) */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "32px" }}>
          <button
            onClick={() => setWorkspaceMode("enterprise")}
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.2s",
              color: workspaceMode === "enterprise" ? "var(--neural-blue)" : "var(--text-muted)",
              background: workspaceMode === "enterprise" ? "rgba(0, 229, 255, 0.1)" : "rgba(255, 255, 255, 0.03)",
              border: workspaceMode === "enterprise" ? "1px solid var(--neural-blue)" : "1px solid rgba(255, 255, 255, 0.06)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Building size={14} /> Enterprise Portal
          </button>
          <button
            onClick={() => setWorkspaceMode("free")}
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.2s",
              color: workspaceMode === "free" ? "var(--neural-blue)" : "var(--text-muted)",
              background: workspaceMode === "free" ? "rgba(0, 229, 255, 0.1)" : "rgba(255, 255, 255, 0.03)",
              border: workspaceMode === "free" ? "1px solid var(--neural-blue)" : "1px solid rgba(255, 255, 255, 0.06)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <FlaskConical size={14} /> Free Tier Sandbox
          </button>
        </div>

        {/* Header Dashboard Banner */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", paddingBottom: "32px", marginBottom: "48px" }}>
          {workspaceMode === "enterprise" ? (
            <>
              <div>
                <div className="section-label" style={{ marginBottom: "12px" }}>
                  <Sparkles size={11} className="animate-pulse" /> Secure Client Portal
                </div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-orbitron), sans-serif", color: "var(--text-primary)" }}>
                  {userSession?.company || "AeroSpace Global"} Portal
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "var(--font-exo), sans-serif", margin: 0 }}>
                    Partner Account ID: <strong style={{ color: "var(--text-primary)" }}>{companyNameHash}</strong>
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="btn-ghost"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.7rem",
                      padding: "4px 10px",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "var(--text-muted)",
                      borderRadius: "4px"
                    }}
                  >
                    <LogOut size={12} /> Sign Out
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "12px 20px", fontSize: "0.875rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Active Projects</span>
                  <strong style={{ color: "var(--text-primary)", fontSize: "1rem" }}>1 In Progress</strong>
                </div>
                <div style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.08)", paddingLeft: "16px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Billing Status</span>
                  <strong style={{ color: "var(--neural-blue)", fontSize: "1rem", display: "flex", alignItems: "center", gap: "4px" }}>Good Standing <Check size={14} /></strong>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="section-label" style={{ marginBottom: "12px" }}>
                  <Sparkles size={11} className="animate-pulse" /> Interactive Sandbox Environment
                </div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 700, fontFamily: "var(--font-orbitron), sans-serif", color: "var(--text-primary)" }}>
                  Free Tier Sandbox
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "6px" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "var(--font-exo), sans-serif", margin: 0 }}>
                    Session Profile: <strong style={{ color: "var(--text-primary)" }}>{userSession?.email || "guest@cerebro-hive.com"}</strong>
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="btn-ghost"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "0.7rem",
                      padding: "4px 10px",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "var(--text-muted)",
                      borderRadius: "4px"
                    }}
                  >
                    <LogOut size={12} /> Sign Out
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "12px", padding: "12px 20px", fontSize: "0.875rem" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Active Trials</span>
                  <strong style={{ color: "var(--text-primary)", fontSize: "1rem" }}>10 Modules</strong>
                </div>
                <div style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.08)", paddingLeft: "16px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Plan Status</span>
                  <strong style={{ color: "var(--neural-blue)", fontSize: "1rem", display: "flex", alignItems: "center", gap: "4px" }}>Trial Active <Check size={14} /></strong>
                </div>
              </div>
            </>
          )}
        </div>

        {workspaceMode === "free" ? (
          <FreeTierDashboard />
        ) : (
          /* Dashboard Grid Workspace */
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "32px", alignItems: "start" }}>
            {/* Sidebar Tabs */}
            <div style={{ flex: "1 1 240px", minWidth: "200px", maxWidth: "280px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { id: "projects", label: "Active Projects", icon: LayoutDashboard },
                { id: "invoices", label: "Invoice Ledger", icon: Landmark },
                { id: "documents", label: "Contracts & Docs", icon: FileText },
                { id: "support", label: "Support Tickets", icon: MessageSquare },
                { id: "reporting", label: "Metrics & Logs", icon: LineChart }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "projects" | "invoices" | "documents" | "support" | "reporting")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      width: "100%",
                      padding: "14px 20px",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      fontFamily: "var(--font-orbitron), sans-serif",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      color: activeTab === tab.id ? "var(--text-primary)" : "var(--text-muted)",
                      background: activeTab === tab.id ? "rgba(0, 229, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
                      border: activeTab === tab.id ? "1px solid var(--neural-blue)" : "1px solid rgba(255, 255, 255, 0.05)",
                      boxShadow: activeTab === tab.id ? "0 0 15px rgba(0, 229, 255, 0.1)" : "none"
                    }}
                  >
                    <Icon size={16} color={activeTab === tab.id ? "var(--neural-blue)" : "var(--text-muted)"} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main workspace container */}
            <div className="card-glass" style={{ flex: "1 1 600px", minWidth: "320px", padding: "40px", minHeight: "400px" }}>
              {/* Tab 1: Projects */}
              {activeTab === "projects" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, marginBottom: "4px" }}>AI Transform Projects</h3>
                    <p style={{ fontSize: "0.85rem", fontFamily: "var(--font-exo), sans-serif", color: "var(--text-muted)" }}>Track your ongoing sprint deliverables and milestones.</p>
                  </div>

                  {projects.map((proj, idx) => (
                    <div key={idx} className="card-glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                        <h4 style={{ fontSize: "0.95rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700 }}>{proj.name}</h4>
                        <span style={{
                          fontSize: "0.6rem",
                          fontFamily: "var(--font-orbitron), sans-serif",
                          fontWeight: 700,
                          color: proj.status === "Completed" ? "var(--neural-blue)" : "var(--violet)",
                          background: proj.status === "Completed" ? "rgba(0, 229, 255, 0.08)" : "rgba(123, 97, 255, 0.08)",
                          border: proj.status === "Completed" ? "1px solid rgba(0, 229, 255, 0.2)" : "1px solid rgba(123, 97, 255, 0.2)",
                          padding: "4px 10px",
                          borderRadius: "100px",
                          textTransform: "uppercase",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}>
                          {proj.status === "Completed" ? <CheckCircle2 size={10} /> : <Clock size={10} />} {proj.status}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontFamily: "var(--font-exo), sans-serif", color: "var(--text-muted)", marginBottom: "6px" }}>
                          <span>Sprint Completion</span>
                          <span style={{ fontFamily: "var(--font-mono), monospace", fontWeight: 600, color: "var(--text-primary)" }}>{proj.progress}%</span>
                        </div>
                        <div style={{ height: "6px", width: "100%", background: "rgba(255, 255, 255, 0.05)", borderRadius: "100px", overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "linear-gradient(90deg, var(--neural-blue), var(--violet))", width: `${proj.progress}%` }} />
                        </div>
                      </div>

                      {/* Milestone List */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                        <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Sprint Milestones</span>
                        <div style={{ position: "relative", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "16px", borderLeft: "1px solid rgba(255, 255, 255, 0.05)" }}>
                          {proj.milestones.map((ms, msIdx) => (
                            <div key={msIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: "0.85rem", position: "relative" }}>
                              {/* Dot indicator */}
                              <div style={{
                                position: "absolute",
                                left: "-20px",
                                top: "6px",
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: ms.status === "completed" ? "var(--neural-blue)" : ms.status === "active" ? "var(--violet)" : "rgba(255, 255, 255, 0.1)",
                                boxShadow: ms.status === "active" ? "var(--glow-violet)" : "none"
                              }} />
                              <div style={{ paddingLeft: "8px" }}>
                                <span className="font-exo" style={{ fontWeight: 500, display: "block", color: ms.status === "completed" ? "var(--text-muted)" : "var(--text-primary)", textDecoration: ms.status === "completed" ? "line-through" : "none" }}>{ms.name}</span>
                                <span className="font-exo" style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>{ms.date}</span>
                              </div>
                              <span style={{
                                fontSize: "0.6rem",
                                fontFamily: "var(--font-orbitron), sans-serif",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                color: ms.status === "completed" ? "var(--neural-blue)" : ms.status === "active" ? "var(--violet)" : "var(--text-muted)",
                                background: ms.status === "completed" ? "rgba(0, 229, 255, 0.08)" : ms.status === "active" ? "rgba(123, 97, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
                                border: `1px solid ${ms.status === "completed" ? "rgba(0, 229, 255, 0.2)" : ms.status === "active" ? "rgba(123, 97, 255, 0.2)" : "rgba(255, 255, 255, 0.05)"}`,
                                padding: "2px 8px",
                                borderRadius: "4px"
                              }}>{ms.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Invoices */}
              {activeTab === "invoices" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, marginBottom: "4px" }}>Invoice Ledger</h3>
                    <p style={{ fontSize: "0.85rem", fontFamily: "var(--font-exo), sans-serif", color: "var(--text-muted)" }}>Billing logs and receipt downloads.</p>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", textAlign: "left", fontSize: "0.85rem", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", color: "var(--text-muted)", fontFamily: "var(--font-orbitron), sans-serif", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          <th style={{ paddingBottom: "12px", paddingRight: "16px" }}>Invoice ID</th>
                          <th style={{ paddingBottom: "12px", paddingRight: "16px" }}>Description</th>
                          <th style={{ paddingBottom: "12px", paddingRight: "16px" }}>Date</th>
                          <th style={{ paddingBottom: "12px", paddingRight: "16px" }}>Amount</th>
                          <th style={{ paddingBottom: "12px", paddingRight: "16px" }}>Status</th>
                          <th style={{ paddingBottom: "12px", textAlign: "right" }}>Download</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv) => (
                          <tr key={inv.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)", transition: "background 0.2s ease" }}>
                            <td className="font-mono" style={{ padding: "16px 16px 16px 0", fontWeight: 600, color: "var(--text-primary)" }}>{inv.id}</td>
                            <td style={{ padding: "16px 16px 16px 0", color: "var(--text-muted)" }}>{inv.description}</td>
                            <td style={{ padding: "16px 16px 16px 0", color: "var(--text-muted)" }}>{inv.date}</td>
                            <td className="font-mono" style={{ padding: "16px 16px 16px 0", fontWeight: 700, color: "var(--neural-blue)" }}>{inv.amount}</td>
                            <td style={{ padding: "16px 16px 16px 0" }}>
                              <span style={{
                                fontSize: "0.6rem",
                                fontFamily: "var(--font-orbitron), sans-serif",
                                fontWeight: 700,
                                color: "var(--neural-blue)",
                                background: "rgba(0, 229, 255, 0.08)",
                                border: "1px solid rgba(0, 229, 255, 0.2)",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                textTransform: "uppercase"
                              }}>
                                {inv.status}
                              </span>
                            </td>
                            <td style={{ padding: "16px 0", textAlign: "right" }}>
                              <button
                                onClick={() => handleDownloadInvoice(inv.id)}
                                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", transition: "color 0.2s" }}
                                onMouseEnter={(e) => e.currentTarget.style.color = "var(--neural-blue)"}
                                onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
                              >
                                <Download size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Documents */}
              {activeTab === "documents" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, marginBottom: "4px" }}>Project Documents</h3>
                    <p style={{ fontSize: "0.85rem", fontFamily: "var(--font-exo), sans-serif", color: "var(--text-muted)" }}>Secure contracts, technical blueprint templates, and compliance sign-offs.</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                    {documents.map((doc, idx) => (
                      <div key={idx} className="card-glass" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <strong style={{ fontSize: "0.875rem", color: "var(--text-primary)", display: "block" }}>{doc.name}</strong>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>Uploaded: {doc.date} · {doc.size}</span>
                        </div>
                        <button
                          onClick={() => handleDownloadDocument(doc.name)}
                          className="btn-ghost"
                          style={{ padding: "8px 12px", fontSize: "0.75rem" }}
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Support */}
              {activeTab === "support" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, marginBottom: "4px" }}>Account Support</h3>
                    <p style={{ fontSize: "0.85rem", fontFamily: "var(--font-exo), sans-serif", color: "var(--text-muted)" }}>Raise operational tickets or query your account manager.</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", alignItems: "start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      <form onSubmit={handleCreateTicket} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.7rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "6px" }}>Subject</label>
                          <input
                            type="text"
                            required
                            placeholder="API latency spikes in RAG nodes"
                            value={ticketSubject}
                            onChange={(e) => setTicketSubject(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                              color: "var(--text-primary)",
                              fontFamily: "Exo 2, sans-serif",
                              fontSize: "0.9rem",
                              outline: "none",
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = "var(--neural-blue)"}
                            onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.7rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "6px" }}>Describe Issue</label>
                          <textarea
                            required
                            rows={4}
                            placeholder="Please provide details regarding target databases, timestamps, and pipeline flow codes..."
                            value={ticketMessage}
                            onChange={(e) => setTicketMessage(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                              color: "var(--text-primary)",
                              fontFamily: "Exo 2, sans-serif",
                              fontSize: "0.9rem",
                              outline: "none",
                              resize: "none"
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = "var(--neural-blue)"}
                            onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn-primary"
                          style={{ alignSelf: "flex-start" }}
                        >
                          <Send size={14} /> Open Ticket
                        </button>
                      </form>

                      {ticketSubmitted && (
                        <div style={{ background: "rgba(0, 229, 255, 0.08)", border: "1px solid rgba(0, 229, 255, 0.2)", color: "var(--neural-blue)", fontSize: "0.85rem", padding: "12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <CheckCircle2 size={16} /> Ticket submitted successfully. An architect will respond within 2 hours.
                        </div>
                      )}
                    </div>

                    {/* Account Manager Card */}
                    <div className="card-glass" style={{ padding: "24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Your Account Manager</span>
                      <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, var(--violet), var(--neural-blue))", display: "flex", alignItems: "center", justifyContent: "center", color: "#080B14", fontWeight: 700, fontSize: "1.1rem", boxShadow: "var(--glow-blue)" }}>
                        EM
                      </div>
                      <div>
                        <strong style={{ display: "block", color: "var(--text-primary)", fontFamily: "var(--font-orbitron), sans-serif" }}>Elena Moretti</strong>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Lead AI Solutions Architect</span>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--neural-blue)" }}>elena@cerebro-hive.com</span>
                    </div>
                  </div>

                  {/* Open Ticket Logs */}
                  {supportTickets.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Ticket Logs</span>
                      {supportTickets.map((t) => (
                        <div key={t.id} className="card-glass" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <strong style={{ color: "var(--text-primary)", fontSize: "0.875rem" }}>{t.subject}</strong>
                              <span className="font-mono" style={{ fontSize: "0.65rem", padding: "2px 6px", background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", borderRadius: "4px" }}>{t.id}</span>
                            </div>
                            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "6px" }}>{t.message}</p>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-dim)", display: "block", marginTop: "8px" }}>Submitted: {t.date}</span>
                          </div>
                          <span style={{
                            fontSize: "0.6rem",
                            fontFamily: "var(--font-orbitron), sans-serif",
                            fontWeight: 700,
                            color: "var(--neural-blue)",
                            background: "rgba(0, 229, 255, 0.08)",
                            border: "1px solid rgba(0, 229, 255, 0.2)",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            textTransform: "uppercase",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <Clock size={10} className="animate-pulse" /> {t.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Reporting */}
              {activeTab === "reporting" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, marginBottom: "4px" }}>AI Usage Analytics</h3>
                    <p style={{ fontSize: "0.85rem", fontFamily: "var(--font-exo), sans-serif", color: "var(--text-muted)" }}>Monitor response metrics, system latency, and active API calls.</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                    <div className="card-glass" style={{ padding: "20px" }}>
                      <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Daily API Requests</span>
                      <strong className="font-mono" style={{ color: "var(--text-primary)", fontSize: "1.5rem", display: "block", marginTop: "4px" }}>14,280</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--neural-blue)", marginTop: "4px", display: "flex", alignItems: "center", gap: "2px" }}>↑ 12% week-on-week <ArrowUpRight size={12} /></span>
                    </div>
                    <div className="card-glass" style={{ padding: "20px" }}>
                      <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Average Latency</span>
                      <strong className="font-mono" style={{ color: "var(--text-primary)", fontSize: "1.5rem", display: "block", marginTop: "4px" }}>1.82s</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--neural-blue)", marginTop: "4px", display: "flex", alignItems: "center", gap: "2px" }}>↓ 0.4s improvement <ArrowUpRight size={12} /></span>
                    </div>
                    <div className="card-glass" style={{ padding: "20px" }}>
                      <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>Query Accuracy</span>
                      <strong className="font-mono" style={{ color: "var(--text-primary)", fontSize: "1.5rem", display: "block", marginTop: "4px" }}>98.4%</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "4px", display: "block" }}>Last 10,000 requests</span>
                    </div>
                  </div>

                  {/* Custom SVG usage chart */}
                  <div className="card-glass" style={{ padding: "24px" }}>
                    <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "16px", display: "block" }}>Weekly API Load (Requests)</span>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                      <svg viewBox="0 0 400 150" style={{ width: "100%", maxWidth: "500px", height: "auto" }}>
                        {/* Grid Lines */}
                        <line x1="40" y1="20" x2="380" y2="20" stroke="rgba(255,255,255,0.03)" />
                        <line x1="40" y1="60" x2="380" y2="60" stroke="rgba(255,255,255,0.03)" />
                        <line x1="40" y1="100" x2="380" y2="100" stroke="rgba(255,255,255,0.03)" />
                        <line x1="40" y1="120" x2="380" y2="120" stroke="rgba(255,255,255,0.08)" />

                        {/* X Axis Labels */}
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => {
                          const x = 50 + idx * 50;
                          return (
                            <text key={idx} x={x} y="138" fill="var(--text-muted)" fontSize="8" textAnchor="middle" style={{ fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 600, textTransform: "uppercase" }}>
                              {day}
                            </text>
                          );
                        })}

                        {/* Y Axis Labels */}
                        <text x="32" y="23" fill="var(--text-dim)" fontSize="8" textAnchor="end" style={{ fontFamily: "var(--font-mono), monospace" }}>15k</text>
                        <text x="32" y="63" fill="var(--text-dim)" fontSize="8" textAnchor="end" style={{ fontFamily: "var(--font-mono), monospace" }}>10k</text>
                        <text x="32" y="103" fill="var(--text-dim)" fontSize="8" textAnchor="end" style={{ fontFamily: "var(--font-mono), monospace" }}>5k</text>
                        <text x="32" y="123" fill="var(--text-dim)" fontSize="8" textAnchor="end" style={{ fontFamily: "var(--font-mono), monospace" }}>0</text>

                        {/* Line Path */}
                        <path
                          d="M 50 120 L 100 80 L 150 90 L 200 40 L 250 50 L 300 30 L 350 25"
                          fill="none"
                          stroke="url(#lineGrad)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />

                        {/* Pulsing Dots */}
                        <circle cx="350" cy="25" r="4.5" fill="var(--neural-blue)" className="animate-pulse" />
                        <circle cx="350" cy="25" r="2" fill="#FFFFFF" />

                        <defs>
                          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--violet)" />
                            <stop offset="100%" stopColor="var(--neural-blue)" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
