/**
 * HivePulse — Anthropic Claude client
 * Singleton wrapper around @anthropic-ai/sdk for:
 *   - Briefing generation (daily/weekly/board)
 *   - Alert action enrichment
 *   - Scenario analysis
 */
import Anthropic from '@anthropic-ai/sdk';
import type { Briefing, BriefingType, StrategicAlert, Scenario } from './types';

declare global {
  // eslint-disable-next-line no-var
  var __anthropic: Anthropic | undefined;
}

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('[HivePulse] ANTHROPIC_API_KEY is not set.');
  }
  if (process.env.NODE_ENV !== 'production' && global.__anthropic) {
    return global.__anthropic;
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  if (process.env.NODE_ENV !== 'production') global.__anthropic = client;
  return client;
}

const MODEL = 'claude-sonnet-4-6';

/* ── Briefing generation ────────────────────────────────────────────────── */

export interface BriefingContext {
  type: BriefingType;
  period: string;
  healthScore: number;
  healthStatus: string;
  healthDelta: number;
  pillars: Array<{ label: string; score: number; status: string; delta: number }>;
  topAlerts: Array<{ title: string; severity: string; category: string }>;
  kpis: Array<{ label: string; value: string; trend: string; delta: number }>;
  revenueThisPeriod?: number;
  revenueDelta?: number;
}

export async function generateBriefing(ctx: BriefingContext): Promise<Pick<Briefing,
  'executiveSummary' | 'highlights' | 'risks' | 'recommendations'
>> {
  const client = getClient();
  const prompt = buildBriefingPrompt(ctx);

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `You are the AI Chief of Staff for CerebroHive AEOS.
You generate concise, executive-grade intelligence briefings from live platform data.
Always respond with valid JSON — no markdown fences, no commentary outside the JSON object.`,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = (msg.content[0] as { type: string; text: string }).text.trim();
  // Strip possible markdown fences if model adds them despite instructions
  const json = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(json);
}

function buildBriefingPrompt(ctx: BriefingContext): string {
  return `Generate a ${ctx.type} executive briefing for the period: ${ctx.period}.

CURRENT PLATFORM STATE:
- Enterprise Health Score: ${ctx.healthScore}/100 (${ctx.healthStatus}), ${ctx.healthDelta > 0 ? '+' : ''}${ctx.healthDelta} pts vs last period
- Pillars: ${ctx.pillars.map(p => `${p.label} ${p.score} (${p.delta > 0 ? '+' : ''}${p.delta})`).join(', ')}
- Active Alerts: ${ctx.topAlerts.map(a => `[${a.severity.toUpperCase()}] ${a.title}`).join('; ')}
- Key KPIs: ${ctx.kpis.map(k => `${k.label}: ${k.value} (${k.trend})`).join(', ')}
${ctx.revenueThisPeriod != null ? `- Revenue: $${ctx.revenueThisPeriod.toFixed(2)}M (${ctx.revenueDelta != null && ctx.revenueDelta >= 0 ? '+' : ''}${ctx.revenueDelta?.toFixed(1)}%)` : ''}

Return this exact JSON shape:
{
  "executiveSummary": "<3-5 sentence board-level summary>",
  "highlights": [
    { "label": "<metric name>", "value": "<formatted value>", "sentiment": "positive|negative|neutral" }
  ],
  "risks": [
    { "title": "<risk>", "likelihood": "high|medium|low", "impact": "high|medium|low", "mitigation": "<one-line action>" }
  ],
  "recommendations": ["<action 1>", "<action 2>", "<action 3>"]
}

Highlights: 4-6 items. Risks: 2-4 items. Recommendations: 3-5 numbered actions, each starting with a verb.`;
}

/* ── Alert action enrichment ────────────────────────────────────────────── */

export async function enrichAlertActions(
  alerts: Array<{ id: string; title: string; summary: string; severity: string; category: string }>
): Promise<Record<string, string[]>> {
  if (alerts.length === 0) return {};
  const client = getClient();

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `You are an AI Chief of Staff. Given a list of enterprise alerts, generate 3 concrete, numbered action steps for each.
Respond with valid JSON only.`,
    messages: [{
      role: 'user',
      content: `For each alert below, provide exactly 3 actionable steps (verb-first, specific, < 20 words each).

ALERTS:
${alerts.map(a => `ID: ${a.id}\nTitle: ${a.title}\nSummary: ${a.summary}\nSeverity: ${a.severity}\nCategory: ${a.category}`).join('\n---\n')}

Return JSON:
{ "<id>": ["<step 1>", "<step 2>", "<step 3>"] }`,
    }],
  });

  const raw = (msg.content[0] as { type: string; text: string }).text.trim();
  const json = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(json);
}

/* ── Scenario analysis ──────────────────────────────────────────────────── */

export interface ScenarioInput {
  title: string;
  description: string;
  assumption: string;
  currentHealthScore: number;
  currentPillars: Array<{ id: string; label: string; score: number }>;
  currentRevenueMRR?: number;
  timeHorizon: '30d' | '90d' | '180d' | '1y';
}

export async function analyseScenario(input: ScenarioInput): Promise<Pick<Scenario,
  'healthImpact' | 'pillarImpacts' | 'revenueImpact' | 'probability'
>> {
  const client = getClient();

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `You are an enterprise risk analyst AI. Given a scenario hypothesis, estimate quantitative impacts on business health.
Respond with valid JSON only. Be conservative and realistic.`,
    messages: [{
      role: 'user',
      content: `Analyse this scenario for CerebroHive AEOS:

Title: ${input.title}
Description: ${input.description}
Key assumption: ${input.assumption}
Time horizon: ${input.timeHorizon}

Current state:
- Enterprise health: ${input.currentHealthScore}/100
- Pillars: ${input.currentPillars.map(p => `${p.label} ${p.score}`).join(', ')}
${input.currentRevenueMRR != null ? `- MRR: $${input.currentRevenueMRR.toFixed(2)}M` : ''}

Return JSON:
{
  "healthImpact": <integer -50 to +30, impact on health score>,
  "pillarImpacts": [
    { "pillarId": "<id>", "label": "<label>", "delta": <integer -40 to +20> }
  ],
  "revenueImpact": <float, revenue change in $M, negative for loss>,
  "probability": <float 0.0-1.0>
}`,
    }],
  });

  const raw = (msg.content[0] as { type: string; text: string }).text.trim();
  const json = raw.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(json);
}
