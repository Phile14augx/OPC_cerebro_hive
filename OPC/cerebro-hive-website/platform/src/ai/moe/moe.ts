import { cosine, deterministicEmbedding } from "../x/mock-provider.js";
import type { XGateway } from "../x/gateway.js";
import type { ChatMessage } from "../x/types.js";

export interface Expert {
  id: string;
  description: string;
  systemPrompt: string;
  keywords: RegExp;
  preferredModel?: string;
}

export const EXPERTS: Expert[] = [
  { id: "reasoning", description: "logical analysis, planning, decomposition, decision making, tradeoffs", systemPrompt: "You are the Reasoning Expert. Decompose, analyze, and answer with explicit logic.", keywords: /\b(why|plan|decide|reason|analy[sz]e|trade-?off|steps?)\b/i },
  { id: "coding", description: "software engineering, code, apis, debugging, typescript, python", systemPrompt: "You are the Coding Expert. Answer with precise, runnable code and engineering judgment.", keywords: /\b(code|function|bug|api|typescript|python|sql|regex|compile)\b/i },
  { id: "research", description: "documents, knowledge, retrieval, summarization, citations", systemPrompt: "You are the Research Expert. Ground every claim in provided sources and cite them.", keywords: /\b(document|research|summar|cite|source|paper|knowledge)\b/i },
  { id: "analytics", description: "metrics, statistics, forecasting, trends, business intelligence", systemPrompt: "You are the Analytics Expert. Quantify, compute, and forecast from the data given.", keywords: /\b(metric|kpi|forecast|trend|average|percent|statistic|revenue)\b/i },
  { id: "security", description: "threats, vulnerabilities, compliance, pii, policies", systemPrompt: "You are the Security Expert. Assess risk, flag threats, and map to compliance controls.", keywords: /\b(security|vulnerab|threat|pii|compliance|attack|encrypt|policy)\b/i },
  { id: "workflow", description: "automation, orchestration, approvals, integrations, processes", systemPrompt: "You are the Workflow Expert. Design robust, compensating, observable processes.", keywords: /\b(workflow|automat|approv|orchestrat|integrat|process|trigger)\b/i },
];

export interface ExpertScore { expert: Expert; score: number; signals: string[] }

/** Router: embedding similarity + keyword evidence. Aggregator: synthesis via X. */
export class MixtureOfExperts {
  private readonly expertVecs: { expert: Expert; vec: number[] }[];
  constructor(private readonly x: XGateway) {
    this.expertVecs = EXPERTS.map(e => ({ expert: e, vec: deterministicEmbedding(e.description) }));
  }

  route(task: string, topK = 2): ExpertScore[] {
    const taskVec = deterministicEmbedding(task);
    const scored = this.expertVecs.map(({ expert, vec }) => {
      const sim = cosine(taskVec, vec);
      const kw = expert.keywords.test(task) ? 0.35 : 0;
      const signals: string[] = [];
      if (kw > 0) signals.push("keyword-match");
      if (sim > 0.05) signals.push(`similarity=${sim.toFixed(3)}`);
      return { expert, score: sim + kw, signals };
    }).sort((a, b) => b.score - a.score);
    const top = scored.slice(0, topK);
    return top[0]!.score <= 0 ? [scored[0]!] : top;
  }

  async run(organizationId: string, task: string, opts?: { topK?: number; traceId?: string }): Promise<{ answer: string; experts: { id: string; score: number; answer: string }[] }> {
    const routed = this.route(task, opts?.topK ?? 2);
    const answers = await Promise.all(routed.map(async r => {
      const messages: ChatMessage[] = [
        { role: "system", content: r.expert.systemPrompt },
        { role: "user", content: task },
      ];
      const res = await this.x.complete(organizationId, { messages, model: r.expert.preferredModel, metadata: { purpose: `moe:${r.expert.id}` } }, { traceId: opts?.traceId });
      return { id: r.expert.id, score: r.score, answer: res.text };
    }));
    if (answers.length === 1) return { answer: answers[0]!.answer, experts: answers };
    const synthesis = await this.x.complete(organizationId, {
      messages: [
        { role: "system", content: "You are the Aggregator. Merge the expert answers into one coherent response; prefer agreement, note conflicts." },
        { role: "user", content: `Task: ${task}\n\n${answers.map(a => `[${a.id}] ${a.answer}`).join("\n\n")}` },
      ],
      metadata: { purpose: "moe:aggregate" },
    }, { traceId: opts?.traceId });
    return { answer: synthesis.text, experts: answers };
  }
}
