/**
 * CerebroSphere — Anthropic Claude client
 * Generates role-tailored NL narratives and onboarding defaults.
 */
import Anthropic from '@anthropic-ai/sdk';
import type { UserRole, RoleNarrative, DashboardData, OnboardingConfig, OnboardingResult } from './types';
import { ROLE_AUDIENCE } from './role-config';

declare global { var __sphereAnthropic: Anthropic | undefined; }

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('[CerebroSphere] ANTHROPIC_API_KEY not set.');
  if (process.env.NODE_ENV !== 'production' && global.__sphereAnthropic) return global.__sphereAnthropic;
  const c = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  if (process.env.NODE_ENV !== 'production') global.__sphereAnthropic = c;
  return c;
}

const MODEL = 'claude-sonnet-4-6';

function stripFences(raw: string): string {
  return raw.trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '');
}

/* ── Role narrative ──────────────────────────────────────────────────────── */
export async function generateRoleNarrative(
  role: UserRole,
  data: Pick<DashboardData, 'platform' | 'kpis' | 'alerts' | 'finops'>
): Promise<RoleNarrative> {
  const client = getClient();
  const audience = ROLE_AUDIENCE[role];

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `You are the AI Chief of Staff for CerebroHive AEOS. You generate concise, insightful morning briefings for ${audience}. Respond with valid JSON only — no markdown, no commentary.`,
    messages: [{
      role: 'user',
      content: `Generate a role-tailored briefing for this executive.

LIVE PLATFORM STATE:
Platform status: ${data.platform.overallStatus} | Uptime: ${data.platform.uptimePct.toFixed(2)}%
Active agents: ${data.platform.activeAgents} | Exec/min: ${data.platform.executionsPerMin}
Avg latency: ${data.platform.avgLatencyMs}ms | Error rate: ${(data.platform.errorRate * 100).toFixed(2)}%
Cost burn: $${data.platform.costBurnRateHr.toFixed(2)}/hr

TOP KPIs:
${data.kpis.slice(0, 6).map(k => `${k.label}: ${k.formatted} (${k.trend})`).join('\n')}

OPEN ALERTS (${data.alerts.filter(a => !a.acknowledged).length}):
${data.alerts.filter(a => !a.acknowledged).slice(0, 5).map(a => `[${a.severity.toUpperCase()}] ${a.title}`).join('\n') || 'None'}

FINOPS:
Today: $${data.finops.costTodayUsd.toFixed(0)} | MTD: $${data.finops.costMtdUsd.toFixed(0)} | Budget: ${data.finops.budgetUsedPct.toFixed(0)}% used

Return this exact JSON:
{
  "headline": "<one bold sentence — the most important thing right now>",
  "summary": "<3-4 sentences executive overview tailored to ${role.toUpperCase()}>",
  "topActions": ["<verb-first action 1>", "<verb-first action 2>", "<verb-first action 3>"],
  "watchItems": ["<item to watch 1>", "<item to watch 2>"]
}`,
    }],
  });

  const parsed = JSON.parse(stripFences((msg.content[0] as { type: string; text: string }).text));
  return { ...parsed, role, generatedAt: new Date().toISOString() };
}

/* ── Onboarding defaults ─────────────────────────────────────────────────── */
export async function generateOnboardingDefaults(
  config: OnboardingConfig
): Promise<Pick<OnboardingResult, 'defaultAgents' | 'suggestedWorkflows' | 'welcomeNarrative'>> {
  const client = getClient();

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `You are the CerebroHive AEOS onboarding AI. Given a new tenant's profile, recommend the best starting agents and workflows, and write a welcoming narrative. Respond with valid JSON only.`,
    messages: [{
      role: 'user',
      content: `New tenant onboarding:
Company: ${config.tenantName}
Industry: ${config.industry}
Size: ${config.size}
Primary role: ${config.primaryRole.toUpperCase()}
Goals: ${config.goals.join(', ')}

Available AEOS agents include: CerebroCopilot, HivePulse, HiveShield, HiveOps, HiveAgent, HivePlanner, HiveReason, HiveFinance, HiveSales, HiveMarketing, HiveHR, HiveRisk, HiveSearch.
Available workflow templates include: Employee Onboarding, Invoice Processing, Lead Nurturing, Incident Response, Compliance Audit, Budget Review, Performance Review, Sales Pipeline.

Return JSON:
{
  "defaultAgents": ["<agent 1>", "<agent 2>", "<agent 3>", "<agent 4>", "<agent 5>"],
  "suggestedWorkflows": ["<workflow 1>", "<workflow 2>", "<workflow 3>"],
  "welcomeNarrative": "<2-3 sentence personalised welcome explaining what AEOS will do for them>"
}`,
    }],
  });

  return JSON.parse(stripFences((msg.content[0] as { type: string; text: string }).text));
}
