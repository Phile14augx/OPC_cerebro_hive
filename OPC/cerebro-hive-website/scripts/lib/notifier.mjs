/**
 * scripts/lib/notifier.mjs
 *
 * Notification support for the agent dispatch pipeline.
 *
 * Channels (activate by setting env vars):
 *   SLACK_WEBHOOK_URL   — post to a Slack incoming webhook
 *   DISCORD_WEBHOOK_URL — post to a Discord webhook
 *   NOTIFY_EMAIL        — recipient address (requires SMTP_* vars or sendmail)
 *
 * GitHub Actions:
 *   When GITHUB_STEP_SUMMARY is set (always true in Actions), events are also
 *   written to the job summary markdown file.
 *
 * Usage:
 *   import { notify } from "./notifier.mjs";
 *   await notify("success", { milestone, branch, prUrl, durationMs });
 *   await notify("failure", { milestone, branch, error, runDir });
 */

import https from "node:https";
import http from "node:http";
import fs from "node:fs";

// ─── Helpers ────────────────────────────────────────────────────────────────

function post(rawUrl, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(rawUrl);
    const data = JSON.stringify(body);
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        res.resume();
        res.on("end", () => resolve(res.statusCode));
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function emojiBadge(status) {
  return { success: "✅", failure: "❌", rollback: "⏪", started: "🚀" }[status] ?? "ℹ️";
}

function durationLabel(ms) {
  if (!ms) return "";
  const min = Math.floor(ms / 60000);
  const sec = Math.round((ms % 60000) / 1000);
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

// ─── Channel implementations ─────────────────────────────────────────────────

async function notifySlack(event, payload) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;

  const badge = emojiBadge(event);
  const title = `${badge} Agent Dispatch — ${payload.milestone ?? ""}`;
  const fields = [];

  if (payload.branch) fields.push({ title: "Branch", value: `\`${payload.branch}\``, short: true });
  if (payload.prUrl) fields.push({ title: "PR", value: `<${payload.prUrl}|View PR>`, short: true });
  if (payload.durationMs) fields.push({ title: "Duration", value: durationLabel(payload.durationMs), short: true });
  if (payload.runDir) fields.push({ title: "Run log", value: payload.runDir, short: false });
  if (payload.error) fields.push({ title: "Error", value: `\`\`\`${String(payload.error).slice(0, 500)}\`\`\``, short: false });

  const color = { success: "good", failure: "danger", rollback: "warning", started: "#439FE0" }[event] ?? "#aaa";

  try {
    await post(url, {
      attachments: [{ color, title, fields, footer: "cerebro-agent-bot", ts: Math.floor(Date.now() / 1000) }],
    });
  } catch (err) {
    console.warn(`[notifier] Slack post failed: ${err.message}`);
  }
}

async function notifyDiscord(event, payload) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;

  const badge = emojiBadge(event);
  const lines = [
    `**${badge} Agent Dispatch — ${payload.milestone ?? ""}**`,
    payload.branch ? `Branch: \`${payload.branch}\`` : null,
    payload.prUrl ? `PR: ${payload.prUrl}` : null,
    payload.durationMs ? `Duration: ${durationLabel(payload.durationMs)}` : null,
    payload.error ? `Error: \`\`\`${String(payload.error).slice(0, 500)}\`\`\`` : null,
  ].filter(Boolean);

  try {
    await post(url, { content: lines.join("\n") });
  } catch (err) {
    console.warn(`[notifier] Discord post failed: ${err.message}`);
  }
}

function notifyGitHubSummary(event, payload) {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryFile) return;

  const badge = emojiBadge(event);
  const lines = [
    `## ${badge} Agent Dispatch — ${payload.milestone ?? ""}`,
    ``,
    `| Field | Value |`,
    `|---|---|`,
    payload.branch ? `| Branch | \`${payload.branch}\` |` : null,
    payload.prUrl ? `| PR | [#${payload.prNumber ?? ""}](${payload.prUrl}) |` : null,
    payload.durationMs ? `| Duration | ${durationLabel(payload.durationMs)} |` : null,
    payload.runDir ? `| Run log | \`${payload.runDir}\` |` : null,
    payload.error ? `| Error | \`${String(payload.error).slice(0, 200)}\` |` : null,
  ].filter(Boolean);

  try {
    fs.appendFileSync(summaryFile, lines.join("\n") + "\n\n", "utf8");
  } catch {
    // non-fatal
  }
}

// ─── Public ──────────────────────────────────────────────────────────────────

/**
 * Send a notification on all configured channels.
 *
 * @param {"started"|"success"|"failure"|"rollback"} event
 * @param {{
 *   milestone?: string,
 *   branch?: string,
 *   prUrl?: string,
 *   prNumber?: number,
 *   durationMs?: number,
 *   runDir?: string,
 *   error?: unknown,
 * }} payload
 */
export async function notify(event, payload = {}) {
  await Promise.allSettled([
    notifySlack(event, payload),
    notifyDiscord(event, payload),
  ]);
  notifyGitHubSummary(event, payload);
}
