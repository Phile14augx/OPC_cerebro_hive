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
const STYLE = {
  margin: 54,
  bodySize: 10.5,
  bodyLeading: 15.5,
  paragraphGap: 10,
  h1Size: 22,
  h2Size: 15,
  h3Size: 12,
};

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

function plainText(text) {
  return text.replace(/[•‣]/g, "-").replace(/[–—]/g, "-")
    .replace(/→|â†’/g, " to ").replace(/←|â†/g, " from ")
    .replace(/[├└]/g, "-").replace(/│/g, " ")
    .replace(/[┌┐┘┬┴┼]/g, " ").replace(/─/g, "-")
    .replace(/[▼►◄]/g, ">")
    .replace(/â€”|â€“|Ã¢â‚¬â€|Ã¢â‚¬â€œ/g, "-");
}

function main() {
  const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
  pdf.setProperties({
    title: "CerebroHive Company Handbook",
    subject: "Internal operating handbook",
    author: "CerebroHive — Philemon V. Nath, CEO",
    keywords: "CerebroHive, handbook, Bengaluru, India, AI",
    creator: "CerebroHive handbook generator",
  });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const margin = STYLE.margin;
  const contentWidth = width - margin * 2;
  const footerY = height - 32;
  const tocPages = 1;
  const entries = [];
  const seenContent = new Set();
  let page = 1;
  let y = 110;
  let activePart = "";

  const footer = () => {
    pdf.setDrawColor(210, 220, 230);
    pdf.line(margin, footerY - 13, width - margin, footerY - 13);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(105, 120, 140);
    pdf.text("CerebroHive  |  Bengaluru, India  |  Internal & Confidential", margin, footerY);
    pdf.text(String(page), width - margin, footerY, { align: "right" });
  };
  const pageHeader = () => {
    pdf.setDrawColor(220, 226, 233);
    pdf.line(margin, 36, width - margin, 36);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(82, 101, 119);
    pdf.text(activePart || "CerebroHive Company Handbook", margin, 27);
    pdf.text("CEREBROHIVE", width - margin, 27, { align: "right" });
  };
  const nextPage = () => {
    footer();
    if (page >= MAX_PAGES) return false;
    pdf.addPage(); page += 1; pageHeader(); y = 60; return true;
  };
  const ensure = (needed) => { if (y + needed > footerY - 24) return nextPage(); return true; };
  const write = (text, options = {}) => {
    const { size = STYLE.bodySize, style = "normal", color = [45, 55, 72], indent = 0, gap = STYLE.paragraphGap } = options;
    pdf.setFont("helvetica", style); pdf.setFontSize(size); pdf.setTextColor(...color);
    const lines = pdf.splitTextToSize(text, contentWidth - indent);
    for (const line of lines) { if (!ensure(STYLE.bodyLeading)) return false; pdf.text(line, margin + indent, y); y += STYLE.bodyLeading; }
    y += gap; return true;
  };
  const heading = (text, level = 1) => {
    const settings = level === 1 ? { size: STYLE.h1Size, gap: 15, color: [19, 42, 62] } : level === 2 ? { size: STYLE.h2Size, gap: 10, color: [17, 100, 118] } : { size: STYLE.h3Size, gap: 8, color: [50, 72, 92] };
    const before = level === 1 ? 20 : level === 2 ? 16 : 12;
    ensure(before + settings.size * 2.6);
    if (y > 80) y += before;
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(settings.size); pdf.setTextColor(...settings.color);
    const lines = pdf.splitTextToSize(text, contentWidth);
    lines.forEach((line) => { pdf.text(line, margin, y); y += settings.size * 1.22; }); y += settings.gap;
  };
  const renderTable = (tableLines) => {
    const rows = tableLines
      .filter((line) => !/^\s*\|?\s*:?-{3,}/.test(line.replace(/\|/g, "").trim()))
      .map((line) => line.split("|").map((cell) => cell.trim()).filter(Boolean));
    if (!rows.length) return;
    const columns = Math.min(Math.max(...rows.map((row) => row.length)), 4);
    const columnWidth = contentWidth / columns;
    const cellPadding = 5;
    rows.forEach((row, rowIndex) => {
      const cells = Array.from({ length: columns }, (_, index) => row[index] || "");
      const linesByCell = cells.map((cell) => pdf.splitTextToSize(plainText(cell), columnWidth - cellPadding * 2));
      const rowHeight = Math.max(...linesByCell.map((lines) => lines.length)) * 11 + cellPadding * 2;
      if (!ensure(rowHeight + 2)) return;
      cells.forEach((_, columnIndex) => {
        const x = margin + columnIndex * columnWidth;
        pdf.setFillColor(...(rowIndex === 0 ? [233, 242, 246] : [250, 252, 253]));
        pdf.setDrawColor(211, 220, 228);
        pdf.rect(x, y, columnWidth, rowHeight, "FD");
        pdf.setFont("helvetica", rowIndex === 0 ? "bold" : "normal");
        pdf.setFontSize(8.3); pdf.setTextColor(55, 72, 89);
        linesByCell[columnIndex].forEach((line, lineIndex) => pdf.text(line, x + cellPadding, y + cellPadding + 8 + lineIndex * 11));
      });
      y += rowHeight;
    });
    y += STYLE.paragraphGap;
  };

  // Cover
  pdf.setFillColor(10, 20, 34); pdf.rect(0, 0, width, height, "F");
  pdf.setFillColor(0, 200, 220); pdf.circle(width - 30, 55, 170, "F");
  pdf.setFillColor(99, 75, 200); pdf.circle(35, height - 20, 150, "F");
  pdf.setTextColor(214, 247, 255); pdf.setFont("helvetica", "bold"); pdf.setFontSize(15); pdf.text("CEREBROHIVE", margin, 115);
  pdf.setTextColor(255, 255, 255); pdf.setFontSize(38); pdf.text("Company Handbook", margin, 188);
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(16); pdf.setTextColor(205, 220, 235); pdf.text("The operating system for how we build, learn, and scale.", margin, 222);
  pdf.setFontSize(11); pdf.text("Bengaluru, India  |  Internal - Confidential  |  Version 1.1  |  July 2026", margin, height - 116);
  pdf.text("Owner: Philemon V. Nath, Chief Executive Officer", margin, height - 96);
  page = 1;
  // Reserved TOC pages
  for (let i = 0; i < tocPages; i += 1) { pdf.addPage(); page += 1; }
  pdf.addPage(); page += 1; y = margin;
  heading("A note from the CEO", 1);
  write("CerebroHive exists to help Indian enterprises turn AI ambition into useful, trusted capability. We will earn that trust by being honest about what technology can and cannot do, rigorous in how we build, and accountable for the outcomes our work creates.", { size: 13, color: [35, 54, 74], gap: 14 });
  write("This handbook is our shared operating reference. It is designed to make expectations clear, help teams take good decisions independently, and ensure that our clients experience one consistent standard of care. It is deliberately practical: use it before a decision, during delivery, and when you need to improve a process.", { size: 11.5, gap: 14 });
  write("- Philemon V. Nath\nChief Executive Officer", { size: 11, style: "bold", color: [17, 100, 118], gap: 20 });
  heading("How this handbook works", 2);
  write("Each part has a clear purpose, an accountable owner, and links to the underlying source material. We follow a handbook-first approach: update the source of truth when a decision or policy changes, instead of relying on verbal memory or copied documents. A policy is not binding until its owner has approved it.", { size: 10.5, gap: 12 });
  heading("Editorial principles", 2);
  write("One source of truth. Clear ownership. Plain language. Evidence before opinion. No duplicated policies. Review dates for controlled material. These principles are informed by the handbook-first model used by GitLab, autonomous-team principles from Atlassian, and Basecamp's emphasis on readable, practical employee guidance.", { size: 10.5, gap: 12 });
  nextPage();

  for (const [folder, part] of chapterOrder) {
    if (page >= MAX_PAGES) break;
    const files = filesIn(path.join(DOCS, folder));
    if (!files.length) continue;
    if (part !== activePart) { activePart = part; if (y > margin + 20) nextPage(); entries.push({ part, page }); heading(part, 1); write("Purpose, standards, and source material for this operating area. Content is curated to avoid duplicate guidance and to preserve a single source of truth.", { size: 9.5, color: [90, 105, 120], gap: 12 }); }
    for (const file of files) {
      if (page >= MAX_PAGES) break;
      const text = plainText(cleanMarkdown(fs.readFileSync(file, "utf8")));
      if (text.length < 350) continue;
      const title = documentTitle(text, path.basename(file, ".md"));
      heading(title, 2);
      const lines = text.split("\n");
      let tableBuffer = [];
      const flushTable = () => { if (tableBuffer.length) { renderTable(tableBuffer); tableBuffer = []; } };
      for (const raw of lines) {
        if (page >= MAX_PAGES) break;
        const line = raw.trim();
        if (!line || /^#\s/.test(line) || line.startsWith("```") || /^(text|plaintext|mermaid|bash|json|yaml|typescript)$/i.test(line)) { flushTable(); continue; }
        if (/north america|uk, australia|uae\/ksa|middle east|headquarters \| \[city/i.test(line)) { flushTable(); continue; }
        if (line.startsWith("|")) { tableBuffer.push(line); continue; }
        flushTable();
        const headingMatch = line.match(/^(#{2,4})\s+(.+)$/);
        if (headingMatch) { heading(headingMatch[2], headingMatch[1].length - 1); continue; }
        const bullet = line.match(/^[-*]\s+(.+)/) || line.match(/^\d+\.\s+(.+)/);
        const output = bullet ? `- ${bullet[1]}` : line;
        const fingerprint = output.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
        if (fingerprint.length > 45 && seenContent.has(fingerprint)) continue;
        if (fingerprint.length > 45) seenContent.add(fingerprint);
        write(output, { indent: bullet ? 12 : 0 });
      }
      flushTable();
    }
  }
  footer();

  // Fill the single reserved table-of-contents page after actual content page numbers are known.
  for (let toc = 0; toc < tocPages; toc += 1) {
    const tocPage = toc + 2;
    pdf.setPage(tocPage); pdf.setFillColor(248, 251, 253); pdf.rect(0, 0, width, height, "F");
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(toc === 0 ? 24 : 14); pdf.setTextColor(19, 42, 62);
    pdf.text(toc === 0 ? "Contents" : "Contents (continued)", margin, 70);
    let tocY = 108; const start = toc * 36; const slice = entries.slice(start, start + 36);
    for (const item of slice) {
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(10.5); pdf.setTextColor(17, 100, 118);
      const trimmed = item.part.length > 74 ? `${item.part.slice(0, 71)}...` : item.part;
      pdf.text(trimmed, margin, tocY); pdf.setTextColor(110, 125, 140); pdf.text(String(item.page), width - margin, tocY, { align: "right" }); tocY += 17;
    }
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(105, 120, 140); pdf.text("CerebroHive — Internal & Confidential", margin, footerY); pdf.text(String(tocPage), width - margin, footerY, { align: "right" });
  }
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  pdf.save(OUTPUT);
  console.log(`Created ${path.relative(ROOT, OUTPUT)} (${page} pages, ${entries.length} indexed sections).`);
}

main();
