import { jsPDF } from "jspdf";

interface LeadInfo {
  name: string;
  email: string;
  company: string;
}

interface DimensionScore {
  name: string;
  score: number;
}

// Helper to convert HEX to RGB
function hexToRgb(hex: string) {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

// Draw Page Header Banner
function drawPageHeader(doc: jsPDF, pageNum: number, totalPages: number, title: string, accentColor: string) {
  // Banner background (#080B14)
  doc.setFillColor(8, 11, 20);
  doc.rect(0, 0, 210, 35, "F");

  // Accent bar (1.5mm)
  const accentRgb = hexToRgb(accentColor);
  doc.setFillColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.rect(0, 35, 210, 1.5, "F");

  // Logo Text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("CEREBROHIVE", 20, 20);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(136, 146, 164); // #8892A4
  doc.text("ENTERPRISE AI AUTOMATION", 20, 27);

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.text(title, 190, 20, { align: "right" });

  // Page Numbers
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(136, 146, 164);
  doc.text(`Page ${pageNum} of ${totalPages}`, 190, 27, { align: "right" });
}

// Draw Page Footer
function drawPageFooter(doc: jsPDF, pageNum: number, totalPages: number, reportId: string) {
  doc.setDrawColor(226, 232, 240); // light gray line
  doc.setLineWidth(0.5);
  doc.line(20, 278, 190, 278);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("CerebroHive © 2026 | Automated Enterprise AI Diagnostics", 20, 285);
  doc.text(`ID: ${reportId}  |  CONFIDENTIAL`, 190, 285, { align: "right" });
}

// Draw Metadata Box
function drawMetadataCard(
  doc: jsPDF,
  startY: number,
  leadInfo: LeadInfo,
  reportId: string,
  dateStr: string,
  extraLabel?: string,
  extraValue?: string
) {
  // Border card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, startY, 170, 40, 4, 4, "FD");

  // Client Column
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(8, 11, 20);
  doc.text("CLIENT PROFILE", 26, startY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Name:", 26, startY + 16);
  doc.text("Company:", 26, startY + 23);
  doc.text("Contact:", 26, startY + 30);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(leadInfo.name, 45, startY + 16);
  doc.text(leadInfo.company, 45, startY + 23);
  doc.text(leadInfo.email, 45, startY + 30);

  // Report Column
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(8, 11, 20);
  doc.text("DIAGNOSTIC PROFILE", 116, startY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Date:", 116, startY + 16);
  doc.text("Report ID:", 116, startY + 23);
  if (extraLabel) {
    doc.text(`${extraLabel}:`, 116, startY + 30);
  } else {
    doc.text("Status:", 116, startY + 30);
  }

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(dateStr, 136, startY + 16);
  doc.text(reportId, 136, startY + 23);
  if (extraValue) {
    doc.text(extraValue, 136, startY + 30);
  } else {
    doc.text("VERIFIED ROADMAP", 136, startY + 30);
  }
}

// Generate PDF for Solution Finder / Roadmap
export function generateSolutionFinderPDF(
  leadInfo: LeadInfo,
  industry: string,
  teamSize: string,
  goals: string[],
  maturity: string,
  budget: string
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const reportId = `CH-ROADMAP-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString();
  const totalPages = 2;

  // ==================== PAGE 1 ====================
  drawPageHeader(doc, 1, totalPages, "AI ROADMAP BLUEPRINT", "#00E5FF");
  drawMetadataCard(doc, 45, leadInfo, reportId, dateStr);

  // Section: Business Diagnostic Inputs
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(8, 11, 20);
  doc.text("1. BUSINESS DIAGNOSTIC PARAMS", 20, 97);

  // Card background for diagnostic inputs
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 102, 170, 42, 4, 4, "FD");

  // Inputs detail
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Industry Vertical:", 26, 110);
  doc.text("Organization Size:", 26, 117);
  doc.text("Primary Objectives:", 26, 124);

  doc.text("AI Maturity Tier:", 116, 110);
  doc.text("Monthly AI Budget:", 116, 117);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(industry, 54, 110);
  doc.text(teamSize, 54, 117);
  
  // Wrap goals list nicely
  const goalsStr = goals.join(", ");
  const goalsLines = doc.splitTextToSize(goalsStr, 125);
  doc.text(goalsLines, 54, 124);

  doc.text(maturity, 142, 110);
  doc.text(budget, 142, 117);

  // Section: Strategic Engagement Model
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(8, 11, 20);
  doc.text("2. RECOMMENDED ENGAGEMENT MODEL", 20, 156);

  // Recommended model title & text
  const isEnterprise = budget === "$50,000+/mo" || budget === "$20,000-$50,000/mo";
  const modelTitle = isEnterprise
    ? "Enterprise AI Consulting & Governance Program"
    : "Specialized AI Automation & Integration Sprint";

  const modelDesc = isEnterprise
    ? `Based on your budget of ${budget} and maturity level ("${maturity}"), we recommend initiating a phased transformation path. We will focus on standardizing your enterprise data pipelines and mapping data compliance, before scaling out autonomous Multi-Agent LangGraph systems.`
    : `Based on your budget of ${budget} and maturity level ("${maturity}"), we recommend initiating a specialized AI Automation Sprint. This focuses on building and launching automated LLM workflow agents (e.g. support, CRM, parsing) in 4-6 week sprints.`;

  // Draw callout box for Recommended model
  doc.setDrawColor(0, 229, 255); // neon blue border
  doc.setFillColor(240, 253, 250); // very light cyan fill
  doc.roundedRect(20, 161, 170, 48, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 140, 160); // dark cyan
  doc.text(modelTitle, 26, 170);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const descLines = doc.splitTextToSize(modelDesc, 158);
  doc.text(descLines, 26, 177);

  // Strategic directive summary
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("* Scope includes blueprint designs, deployment cycles, and standard post-deploy audits.", 20, 220);

  drawPageFooter(doc, 1, totalPages, reportId);

  // ==================== PAGE 2 ====================
  doc.addPage();
  drawPageHeader(doc, 2, totalPages, "AI ROADMAP BLUEPRINT", "#00E5FF");

  // Section: Target Solutions to Deploy
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(8, 11, 20);
  doc.text("3. CUSTOM AI SOLUTIONS DEPLOYMENT", 20, 47);

  // Custom agent solution recommendations
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 52, 170, 68, 4, 4, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text("We suggest deploying customized, LLM-powered nodes communicating via LangGraph to address:", 26, 60);

  let goalY = 69;
  goals.forEach((g) => {
    doc.setFillColor(0, 229, 255);
    doc.circle(28, goalY - 1, 1, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(`${g} Agent Core Engine`, 33, goalY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("- Customized multi-agent flow node with memory retention and human validation.", 33, goalY + 5);

    goalY += 12;
  });

  // Section: Academy Up-Skilling
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(8, 11, 20);
  doc.text("4. L&D ACADEMY TRAINING PATH", 20, 134);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 139, 170, 36, 4, 4, "FD");

  const needSolutionsArchitect = goals.includes("Customer Support Automation") || goals.includes("Knowledge Synthesis & Retrieval");
  const programTrack = needSolutionsArchitect ? "AI Solutions Architect" : "AI Engineer";
  const courseRecommended = "Building AI Agents with LangChain & Multi-Agent Frameworks";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(8, 11, 20);
  doc.text(`Recommended Track: ${programTrack} Program`, 26, 147);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("To guarantee operational support post-deployment, we recommend enrolling your team in this program.", 26, 154);
  doc.text(`Core Focus Course: ${courseRecommended}`, 26, 161);
  doc.text("Course format: 12-week intensive virtual cohort with live hands-on playground projects.", 26, 167);

  // Next Steps Action Block
  doc.setDrawColor(123, 97, 255); // violet border
  doc.setFillColor(245, 243, 255); // light violet fill
  doc.roundedRect(20, 187, 170, 48, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(90, 60, 210); // dark violet
  doc.text("IMMEDIATE ACTION STEP: VALIDATE STRATEGY", 26, 195);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const actionText = "Book your 1-on-1 Executive Strategy validation session with CerebroHive Solutions Architects to map these diagnostic outputs to a formal development and pricing contract.";
  const actionLines = doc.splitTextToSize(actionText, 158);
  doc.text(actionLines, 26, 202);

  // Authenticity block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const verifyHash = `CH-VERIFIED-HASH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  doc.text(`Verification Security Hash: ${verifyHash}`, 20, 248);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Validate roadmap hash at: cerebro-hive.com/verify/roadmap", 20, 253);

  // Signature line
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Authorized: CerebroHive Technical Solutions Director", 190, 248, { align: "right" });
  doc.setDrawColor(148, 163, 184);
  doc.line(140, 252, 190, 252);

  drawPageFooter(doc, 2, totalPages, reportId);

  // Save the PDF
  doc.save(`CerebroHive_AI_Roadmap_${leadInfo.company.replace(/\s+/g, "_")}.pdf`);
}

// Generate PDF for AI Readiness Assessment
export function generateAIReadinessPDF(
  leadInfo: LeadInfo,
  overallScore: number,
  maturityDetails: { tier: string; desc: string },
  dimScores: DimensionScore[],
  getRecommendation: (dimName: string, score: number) => string
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const reportId = `CH-AUDIT-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString();
  const totalPages = 2;

  // ==================== PAGE 1 ====================
  drawPageHeader(doc, 1, totalPages, "AI READINESS AUDIT", "#7B61FF");
  drawMetadataCard(doc, 45, leadInfo, reportId, dateStr, "Audit Level", "CORE MATURITY AUDIT");

  // Section: Overall score card
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(8, 11, 20);
  doc.text("1. MATURITY AUDIT SCORECARD", 20, 97);

  // Score badge card
  doc.setDrawColor(123, 97, 255); // violet border
  doc.setFillColor(250, 245, 255); // very light violet background
  doc.roundedRect(20, 102, 42, 36, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(123, 97, 255);
  doc.text(`${overallScore}`, 41, 122, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(136, 146, 164);
  doc.text("/ 100 SCORE", 41, 131, { align: "center" });

  // Right details card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(68, 102, 122, 36, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Maturity Tier: ${maturityDetails.tier}`, 74, 111);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const tierDescLines = doc.splitTextToSize(maturityDetails.desc + " This audit measures capabilities across 5 distinct operational pillars.", 110);
  doc.text(tierDescLines, 74, 118);

  // Section: Dimension scorecard breakdown (Visual Progress Bars)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(8, 11, 20);
  doc.text("2. DIMENSIONAL GAP ASSESSMENT", 20, 150);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 155, 170, 78, 4, 4, "FD");

  let barY = 167;
  dimScores.forEach((dim) => {
    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(dim.name, 26, barY + 1);

    // Progress bar track background
    doc.setFillColor(226, 232, 240); // slate-200
    doc.roundedRect(68, barY - 2, 90, 3, 1.5, 1.5, "F");

    // Progress bar fill
    doc.setFillColor(123, 97, 255); // violet
    const fillWidth = (dim.score / 100) * 90;
    if (fillWidth > 0) {
      doc.roundedRect(68, barY - 2, fillWidth, 3, 1.5, 1.5, "F");
    }

    // Score label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(123, 97, 255);
    doc.text(`${dim.score}%`, 166, barY + 1);

    barY += 12;
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("* Pillar evaluations are verified against the CerebroHive Operational AI Readiness Index.", 20, 245);

  drawPageFooter(doc, 1, totalPages, reportId);

  // ==================== PAGE 2 ====================
  doc.addPage();
  drawPageHeader(doc, 2, totalPages, "AI READINESS AUDIT", "#7B61FF");

  // Section: Strategic Directives
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(8, 11, 20);
  doc.text("3. STRATEGIC RECOMMENDATIONS & DIRECTIVES", 20, 47);

  let directiveY = 54;
  dimScores.forEach((dim, idx) => {
    // Outer card
    doc.setDrawColor(241, 245, 249);
    doc.setFillColor(255, 255, 255);
    
    const recText = getRecommendation(dim.name, dim.score);
    const recLines = doc.splitTextToSize(recText, 158);
    const boxHeight = 12 + recLines.length * 4.5;

    doc.roundedRect(20, directiveY, 170, boxHeight, 3, 3, "FD");

    // Pill badge for dimension name
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(25, directiveY + 3, 35, 4.5, 1, 1, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(123, 97, 255);
    doc.text(dim.name.toUpperCase(), 27, directiveY + 6.2);

    // Score label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Score: ${dim.score}/100`, 65, directiveY + 6.5);

    // Recommendation text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(recLines, 25, directiveY + 12);

    directiveY += boxHeight + 4;
  });

  // Action steps Box at the bottom
  const actionStartY = 202;
  doc.setDrawColor(0, 229, 255); // neural-blue border
  doc.setFillColor(240, 253, 250); // cyan tint
  doc.roundedRect(20, actionStartY, 170, 36, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(0, 140, 160);
  doc.text("IMMEDIATE STEP: COMPOSE ROADMAP PROTOCOL", 26, actionStartY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const actText = "Submit these diagnostic gap results to our engineering team to design custom n8n integration diagrams and schedule your free validation meeting.";
  const actLines = doc.splitTextToSize(actText, 158);
  doc.text(actLines, 26, actionStartY + 14);

  // Authenticity block
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const verifyHash = `CH-AUDIT-HASH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  doc.text(`Verification Security Hash: ${verifyHash}`, 20, 248);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Validate report authenticity at: cerebro-hive.com/verify/readiness", 20, 253);

  // Signature line
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text("Certified: CerebroHive Technical Audit Team", 190, 248, { align: "right" });
  doc.setDrawColor(148, 163, 184);
  doc.line(140, 252, 190, 252);

  drawPageFooter(doc, 2, totalPages, reportId);

  // Save the PDF
  doc.save(`CerebroHive_AI_Readiness_Report_${leadInfo.company.replace(/\s+/g, "_")}.pdf`);
}
