/* eslint-disable @typescript-eslint/no-require-imports */
/*
 * Builds the internal CerebroHive handbook from the repository's Markdown
 * sources. Run: node scripts/generate-handbook-pdf.js
 */
const fs = require("fs");
const path = require("path");
const { jsPDF } = require("jspdf");

const ROOT = path.resolve(__dirname, "..");
const DOCS = path.join(ROOT, "docs");
const OUTPUT = path.join(ROOT, "public", "downloads", "cerebrohive-company-handbook.pdf");
const MAX_PAGES = 500;

const chapterOrder = [
  ["01-company-foundation", "Part I — Company Foundation"],
  ["02-brand-messaging", "Part II — Brand & Messaging"],
  ["03-services", "Part III — Service Portfolio"],
  ["04-industries", "Part IV — Industry Verticals"],
  ["05-frameworks", "Part V — Proprietary Frameworks"],
  ["06-go-to-market", "Part VI — Go-to-Market System"],
  ["07-sales-playbook", "Part VII — Sales Playbook"],
  ["08-delivery-operations", "Part VIII — Delivery & Operations"],
  ["09-templates", "Part IX — Templates & Documents"],
  ["10-technology", "Part X — Technology Architecture"],
  ["11-ai-governance", "Part XI — AI Governance & Responsible AI"],
  ["12-thought-leadership", "Part XII — Thought Leadership & Insights"],
  ["company", "Part XIII — Organization & Company"],
  ["consulting-services", "Part XIV — Advisory & Client Delivery"],
  ["automation-services", "Part XV — Automation & Agent Delivery"],
  ["tech-stack", "Part XVI — Engineering & Technology"],
  ["labs", "Part XVII — Research & Innovation"],
  ["products", "Part XVIII — Product Portfolio"],
  ["solutions", "Part XIX — Solution Playbooks"],
  ["engagement-models", "Part XX — Commercial Models & Partnerships"],
  ["academy", "Part XXI — Learning & Enablement"],
  ["whitepapers", "Part XXII — Research Library"],
  ["appendices", "Part XXIII — Governance & Reference"],
];

function filesIn(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(full) : entry.name.endsWith(".md") ? [full] : [];
  }).sort((a, b) => a.localeCompare(b));
}

function cleanMarkdown(source) {
  let text = source.replace(/^---[\s\S]*?---\s*/m, "");
  text = text.split("\n").filter((line) => {
    const placeholder = /\[.*(?:Expand with specific detail|Comprehensive documentation|DRAFT).*\]/i.test(line);
    return !placeholder && !/^Related documents:/i.test(line.trim());
  }).join("\n");
  return text.replace(/\r/g, "").replace(/\*\*/g, "").replace(/`/g, "").replace(/â€”/g, "—").replace(/â€“/g, "–");
}

function documentTitle(text, fallback) {
  return (text.match(/^#\s+(.+)$/m) || [null, fallback])[1].replace(/\*+/g, "").trim();
}

function main() {
  const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = 54;
  const contentWidth = width - margin * 2;
  const footerY = height - 32;
  const tocPages = 3;
  const entries = [];
  let page = 1;
  let y = 110;
  let activePart = "";

  const footer = () => {
    pdf.setDrawColor(210, 220, 230);
    pdf.line(margin, footerY - 13, width - margin, footerY - 13);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(105, 120, 140);
    pdf.text("CerebroHive — Internal & Confidential", margin, footerY);
    pdf.text(String(page), width - margin, footerY, { align: "right" });
  };
  const nextPage = () => {
    footer();
    if (page >= MAX_PAGES) return false;
    pdf.addPage(); page += 1; y = margin; return true;
  };
  const ensure = (needed) => { if (y + needed > footerY - 24) return nextPage(); return true; };
  const write = (text, options = {}) => {
    const { size = 10.5, style = "normal", color = [45, 55, 72], indent = 0, gap = 7 } = options;
    pdf.setFont("helvetica", style); pdf.setFontSize(size); pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(text, contentWidth - indent);
    for (const line of lines) { if (!ensure(size * 1.45)) return false; pdf.text(line, margin + indent, y); y += size * 1.45; }
    y += gap; return true;
  };
  const heading = (text, level = 1) => {
    const settings = level === 1 ? { size: 22, gap: 13, color: [19, 42, 62] } : level === 2 ? { size: 15, gap: 9, color: [17, 100, 118] } : { size: 12, gap: 6, color: [50, 72, 92] };
    ensure(settings.size * 2.6); pdf.setFont("helvetica", "bold"); pdf.setFontSize(settings.size); pdf.setTextColor(...settings.color);
    const lines = pdf.splitTextToSize(text, contentWidth);
    lines.forEach((line) => { pdf.text(line, margin, y); y += settings.size * 1.22; }); y += settings.gap;
  };

  // Cover
  pdf.setFillColor(10, 20, 34); pdf.rect(0, 0, width, height, "F");
  pdf.setFillColor(0, 200, 220); pdf.circle(width - 30, 55, 170, "F");
  pdf.setFillColor(99, 75, 200); pdf.circle(35, height - 20, 150, "F");
  pdf.setTextColor(214, 247, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(15); pdf.text("CEREBROHIVE", margin, 115);
  pdf.setTextColor(255, 255, 255); pdf.setFontSize(38); pdf.text("Company Handbook", margin, 188);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(16); pdf.setTextColor(205, 220, 235); pdf.text("The operating system for how we build, learn, and scale.", margin, 222);
  pdf.setFontSize(11); pdf.text("Internal — Confidential  |  Version 1.0  |  July 2026", margin, height - 100);
  page = 1;
  // Reserved TOC pages
  for (let i = 0; i < tocPages; i += 1) { pdf.addPage(); page += 1; }
  pdf.addPage(); page += 1; y = margin;

  for (const [folder, part] of chapterOrder) {
    if (page >= MAX_PAGES) break;
    const files = filesIn(path.join(DOCS, folder));
    if (!files.length) continue;
    if (part !== activePart) { activePart = part; if (y > margin + 20) nextPage(); entries.push({ part, page }); heading(part, 1); write("Authoritative internal reference material compiled from the CerebroHive documentation library.", { size: 9.5, color: [90, 105, 120], gap: 12 }); }
    for (const file of files) {
      if (page >= MAX_PAGES) break;
      const text = cleanMarkdown(fs.readFileSync(file, "utf8"));
      if (text.length < 350) continue;
      const title = documentTitle(text, path.basename(file, ".md"));
      entries.push({ title, page, part });
      heading(title, 2);
      const lines = text.split("\n");
      let tableBuffer = [];
      const flushTable = () => { if (tableBuffer.length) { write(tableBuffer.map((line) => line.replace(/\|/g, " · ").replace(/\s{2,}/g, " ").trim()).join("\n"), { size: 8.7, color: [70, 85, 100], indent: 10, gap: 8 }); tableBuffer = []; } };
      for (const raw of lines) {
        if (page >= MAX_PAGES) break;
        const line = raw.trim();
        if (!line || /^#\s/.test(line)) { flushTable(); continue; }
        if (line.startsWith("|")) { tableBuffer.push(line); continue; }
        flushTable();
        const headingMatch = line.match(/^(#{2,4})\s+(.+)$/);
        if (headingMatch) { heading(headingMatch[2], headingMatch[1].length - 1); continue; }
        const bullet = line.match(/^[-*]\s+(.+)/) || line.match(/^\d+\.\s+(.+)/);
        write(bullet ? `• ${bullet[1]}` : line, { indent: bullet ? 12 : 0 });
      }
      flushTable();
    }
  }
  footer();

  // Fill reserved TOC pages after actual content page numbers are known.
  for (let toc = 0; toc < tocPages; toc += 1) {
    const tocPage = toc + 2;
    pdf.setPage(tocPage); pdf.setFillColor(248, 251, 253); pdf.rect(0, 0, width, height, "F");
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(toc === 0 ? 24 : 14); pdf.setTextColor(19, 42, 62);
    pdf.text(toc === 0 ? "Contents" : "Contents (continued)", margin, 70);
    let tocY = 108; const start = toc * 36; const slice = entries.slice(start, start + 36);
    for (const item of slice) {
      const isPart = Boolean(item.part && !item.title);
      pdf.setFont("helvetica", isPart ? "bold" : "normal"); pdf.setFontSize(isPart ? 10.5 : 8.8); pdf.setTextColor(...(isPart ? [17, 100, 118] : [55, 67, 82]));
      const label = item.part || item.title; const trimmed = label.length > 74 ? `${label.slice(0, 71)}...` : label;
      pdf.text(trimmed, margin + (isPart ? 0 : 12), tocY); pdf.setTextColor(110, 125, 140); pdf.text(String(item.page), width - margin, tocY, { align: "right" }); tocY += isPart ? 17 : 13;
    }
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(105, 120, 140); pdf.text("CerebroHive — Internal & Confidential", margin, footerY); pdf.text(String(tocPage), width - margin, footerY, { align: "right" });
  }
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  pdf.save(OUTPUT);
  console.log(`Created ${path.relative(ROOT, OUTPUT)} (${page} pages, ${entries.length} indexed sections).`);
}

main();
