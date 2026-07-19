
import fs from "fs";
import path from "path";

const phases = [
  {
    phase: "Phase 1 - Foundation",
    epic: "Brand & Design System",
    tasks: [
      { title: "Define Company Vision", status: "Done", priority: "High" },
      { title: "Design Brand Identity & Logo", status: "Done", priority: "High" },
      { title: "Establish Color System (Enterprise Green)", status: "Done", priority: "High" },
      { title: "Define Typography (Inter/Space Grotesk)", status: "Done", priority: "Medium" },
      { title: "Establish Enterprise Design Language", status: "Done", priority: "High" },
    ]
  },
  {
    phase: "Phase 1 - Foundation",
    epic: "Infrastructure Setup",
    tasks: [
      { title: "Initialize Git Repository", status: "Done", priority: "High" },
      { title: "Configure Next.js 14 App Router", status: "Done", priority: "High" },
      { title: "Migrate to Tailwind CSS v4", status: "Done", priority: "High" },
      { title: "Setup next-themes for Light/Dark Mode", status: "Done", priority: "Medium" },
      { title: "Configure Prettier & ESLint", status: "Done", priority: "Low" },
    ]
  },
  {
    phase: "Phase 2 - Website",
    epic: "Marketing Site",
    tasks: [
      { title: "Develop Landing Page", status: "Done", priority: "High" },
      { title: "Implement Animated Globe Visualization", status: "Done", priority: "Medium" },
      { title: "Develop Company / About Page", status: "Done", priority: "Medium" },
      { title: "Build Services Engine UI", status: "Done", priority: "High" },
      { title: "Build Industry Verticals Pages", status: "Done", priority: "Medium" },
      { title: "Build Products Showcase", status: "Done", priority: "Medium" },
      { title: "Develop Research Lab Hub", status: "Done", priority: "Low" },
      { title: "Establish Trust Center", status: "Done", priority: "Medium" },
      { title: "Create Careers Portal", status: "Done", priority: "Low" },
      { title: "Implement Contact Form", status: "Done", priority: "Medium" },
    ]
  },
  {
    phase: "Phase 3 - AI Platform",
    epic: "Core Intelligence",
    tasks: [
      { title: "Design Cerebro Chat Interface", status: "Done", priority: "High" },
      { title: "Build Enterprise Intelligence OS UI", status: "Done", priority: "High" },
      { title: "Define Multi-Agent Architecture", status: "Done", priority: "High" },
      { title: "Implement Agent OS Workflows", status: "Done", priority: "Medium" },
      { title: "Setup Neo4j Knowledge Graph schema", status: "Done", priority: "Medium" },
      { title: "Implement pgvector Vector Search", status: "Done", priority: "High" },
      { title: "Create System Prompt Library", status: "Done", priority: "Medium" },
      { title: "Build AI Playground for Devs", status: "Done", priority: "Low" },
    ]
  },
  {
    phase: "Phase 4 - Enterprise Modules",
    epic: "Consulting Capabilities",
    tasks: [
      { title: "Document AI Strategy Framework", status: "Done", priority: "Medium" },
      { title: "Create AI Agents Deployment Guide", status: "Done", priority: "High" },
      { title: "Define ERP Modernization Strategy", status: "Done", priority: "High" },
      { title: "Establish Cloud Architecture Best Practices", status: "Done", priority: "Medium" },
      { title: "Outline Data Engineering Pipeline", status: "Done", priority: "Medium" },
      { title: "Define Zero Trust Security Posture", status: "Done", priority: "High" },
      { title: "Create AI Governance Framework", status: "Done", priority: "High" },
    ]
  },
  {
    phase: "Phase 5 - PM Agent",
    epic: "Project Management Backend",
    tasks: [
      { title: "Design PM Agent Architecture", status: "Done", priority: "High" },
      { title: "Implement Sprint Planning APIs", status: "Done", priority: "High" },
      { title: "Build Automated Task Generator", status: "Done", priority: "High" },
      { title: "Implement Epic Management", status: "Done", priority: "Medium" },
      { title: "Integrate GitHub Actions webhook", status: "Done", priority: "Medium" },
      { title: "Design Progress Dashboard", status: "Done", priority: "Low" },
    ]
  },
  {
    phase: "Phase 6 - Quantiva ERP",
    epic: "ERP Foundations",
    tasks: [
      { title: "Design HRMS Module", status: "Done", priority: "Medium" },
      { title: "Design CRM Pipeline", status: "Done", priority: "Medium" },
      { title: "Implement Core Accounting Logic", status: "Done", priority: "High" },
      { title: "Add GST Tax Compliance Rules", status: "Done", priority: "High" },
      { title: "Add TDS Calculations", status: "Done", priority: "High" },
      { title: "Design Payroll Processing", status: "Done", priority: "Medium" },
      { title: "Build Inventory Management", status: "Done", priority: "High" },
      { title: "Design Fleet Tracking UI", status: "Done", priority: "Low" },
      { title: "Implement Procurement Workflows", status: "Done", priority: "Medium" },
      { title: "Setup Fixed Assets Ledger", status: "Done", priority: "Medium" },
    ]
  },
  {
    phase: "Phase 7 - Research",
    epic: "Knowledge Acquisition",
    tasks: [
      { title: "Automate Daily AI Briefings", status: "Done", priority: "Medium" },
      { title: "Create Infographic Generation Pipeline", status: "Done", priority: "Low" },
      { title: "Setup arXiv Paper Automation", status: "Done", priority: "Medium" },
      { title: "Maintain Benchmark Library", status: "Done", priority: "Low" },
      { title: "Curate Internal Knowledge Base", status: "Done", priority: "High" },
    ]
  },
  {
    phase: "Phase 8 - Current (v3.2)",
    epic: "Platform Expansion",
    tasks: [
      { title: "Refine Enterprise Intelligence OS", status: "Done", priority: "High" },
      { title: "Fix Light/Dark Theme contrast", status: "Done", priority: "High" },
      { title: "Polish Chat UI Components", status: "Done", priority: "High" },
      { title: "Develop Architecture Canvas", status: "Done", priority: "Medium" },
      { title: "Implement Workflow Visualization", status: "Done", priority: "Medium" },
      { title: "Setup Enterprise Identity Platform", status: "Done", priority: "High" },
      { title: "Implement Multi-tenant Backend logic", status: "Done", priority: "High" },
      { title: "Configure PostgreSQL + Prisma", status: "Done", priority: "High" },
      { title: "Integrate BullMQ + Redis", status: "Done", priority: "High" },
      { title: "Implement JWT Authentication", status: "Done", priority: "High" },
      { title: "Establish RAG Foundation", status: "Done", priority: "High" },
    ]
  },
  {
    phase: "Phase 9 - Upcoming",
    epic: "Future Capabilities",
    tasks: [
      { title: "Integrate Azure OpenAI Models", status: "Todo", priority: "High" },
      { title: "Integrate Anthropic Claude 3.5", status: "Todo", priority: "Medium" },
      { title: "Integrate Google Gemini 1.5", status: "Todo", priority: "Medium" },
      { title: "Build Agent Marketplace UI", status: "Todo", priority: "Low" },
      { title: "Launch MCP Server Endpoints", status: "Todo", priority: "High" },
      { title: "Implement Enterprise Memory via Redis", status: "Todo", priority: "High" },
      { title: "Develop Visual Workflow Builder", status: "Todo", priority: "Medium" },
      { title: "Build VS Code AI Copilot Extension", status: "Todo", priority: "Low" },
      { title: "Design Mobile Companion App", status: "Todo", priority: "Low" },
      { title: "Finalize Production Deployment on Vercel", status: "Todo", priority: "High" },
    ]
  }
];

let csv = "Title,Status,Priority,Epic,Phase\n";

phases.forEach(p => {
  p.tasks.forEach(t => {
    csv += `"${t.title}","${t.status}","${t.priority}","${p.epic}","${p.phase}"\n`;
  });
});

fs.writeFileSync("roadmap.csv", csv);
console.log("Created roadmap.csv");

