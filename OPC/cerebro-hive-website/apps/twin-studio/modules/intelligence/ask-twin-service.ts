export type DurableState = {
  entityId: string;
  entityName: string;
  state: Record<string, unknown>;
  provenance: Record<string, unknown>;
};

export type AskTwinAnswer = {
  answer: string;
  recommendation: string;
  evidence: DurableState[];
  confidence: number;
  provider: string;
  model: string;
  sourceKind: 'STORED_TWIN_STATE';
  prompt: string;
  generatedAt: Date;
  enforcedGrounding: boolean;
};

type LlmCompletion = {
  text: string;
  provider: string;
  model: string;
};

const SYSTEM_PROMPT = `You are Twin Studio's operator assistant.
Use only the supplied durable twin evidence JSON. Do not invent telemetry, entities, or measurements.
If the evidence does not contain the answer, say so explicitly.
Respond with JSON only: {"answer": string, "recommendation": string, "confidence": number}.
confidence must be between 0 and 1.`;

export function resolveLlmConfig(
  env: Record<string, string | undefined> = process.env,
): { provider: 'anthropic' | 'openai'; model: string; apiKey: string } | undefined {
  const preferred = env['AI_PROVIDER']?.trim().toLowerCase();
  const anthropicKey = env['ANTHROPIC_API_KEY']?.trim();
  const openaiKey = env['OPENAI_API_KEY']?.trim();
  if (preferred === 'openai' && openaiKey) {
    return { provider: 'openai', model: env['OPENAI_MODEL']?.trim() || 'gpt-4o-mini', apiKey: openaiKey };
  }
  if (preferred === 'anthropic' && anthropicKey) {
    return {
      provider: 'anthropic',
      model: env['ANTHROPIC_MODEL']?.trim() || 'claude-sonnet-4-6',
      apiKey: anthropicKey,
    };
  }
  if (anthropicKey) {
    return {
      provider: 'anthropic',
      model: env['ANTHROPIC_MODEL']?.trim() || 'claude-sonnet-4-6',
      apiKey: anthropicKey,
    };
  }
  if (openaiKey) {
    return { provider: 'openai', model: env['OPENAI_MODEL']?.trim() || 'gpt-4o-mini', apiKey: openaiKey };
  }
  return undefined;
}

function looksLikeUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function normalizeNumber(value: number) {
  return String(Number(value));
}

function extractNumbers(text: string): string[] {
  const numbers: string[] = [];
  for (const match of text.matchAll(/\d+(?:\.\d+)?/g)) {
    const value = Number(match[0]);
    if (Number.isFinite(value)) numbers.push(normalizeNumber(value));
  }
  return numbers;
}

function walkNumbers(value: unknown, into: Set<string>) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    into.add(normalizeNumber(value));
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walkNumbers(item, into);
    return;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value as Record<string, unknown>)) walkNumbers(item, into);
  }
}

export function evidenceNumbers(states: DurableState[]): Set<string> {
  const numbers = new Set<string>();
  for (const state of states) {
    walkNumbers(state.state, numbers);
    if (!looksLikeUuid(state.entityId)) {
      for (const number of extractNumbers(state.entityId)) numbers.add(number);
    }
    for (const number of extractNumbers(state.entityName)) numbers.add(number);
  }
  return numbers;
}

export function enforceEvidenceGrounding(
  answer: string,
  states: DurableState[],
): { answer: string; rewritten: boolean } {
  const allowed = evidenceNumbers(states);
  const claimed = extractNumbers(answer);
  const invented = claimed.filter((number) => !allowed.has(number));
  if (invented.length === 0) return { answer, rewritten: false };
  return {
    rewritten: true,
    answer:
      'Stored twin evidence does not include that claimed measurement. Use only the attached entity state.',
  };
}

function parseModelJson(text: string): { answer: string; recommendation: string; confidence: number } {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) {
    return {
      answer: text.trim() || 'The model returned an empty response.',
      recommendation: 'Review the attached evidence before acting.',
      confidence: 0.4,
    };
  }
  const parsed = JSON.parse(match[0]) as Record<string, unknown>;
  const confidence = typeof parsed['confidence'] === 'number' ? parsed['confidence'] : 0.5;
  return {
    answer: String(parsed['answer'] ?? text).trim(),
    recommendation: String(parsed['recommendation'] ?? 'Review the attached evidence before acting.').trim(),
    confidence: Math.min(1, Math.max(0, confidence)),
  };
}

export async function completeWithConfiguredLlm(
  userPrompt: string,
  fetchImpl: typeof fetch = fetch,
  env: Record<string, string | undefined> = process.env,
): Promise<LlmCompletion> {
  const config = resolveLlmConfig(env);
  if (!config) throw new Error('LLM_UNAVAILABLE');

  if (config.provider === 'anthropic') {
    const response = await fetchImpl('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 800,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    if (!response.ok) throw new Error('LLM_UNAVAILABLE');
    const body = (await response.json()) as { content?: Array<{ text?: string }> };
    const text = body.content?.map((part) => part.text ?? '').join('\n').trim() ?? '';
    return { text, provider: 'anthropic', model: config.model };
  }

  const response = await fetchImpl('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!response.ok) throw new Error('LLM_UNAVAILABLE');
  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = body.choices?.[0]?.message?.content?.trim() ?? '';
  return { text, provider: 'openai', model: config.model };
}

export async function askTwinFromStates(
  states: DurableState[],
  prompt: string,
  fetchImpl: typeof fetch = fetch,
  env: Record<string, string | undefined> = process.env,
): Promise<AskTwinAnswer> {
  const generatedAt = new Date();
  if (states.length === 0) {
    return {
      answer: 'No operational state has been recorded for this twin yet.',
      recommendation: 'Ingest a measured observation or persist simulated state before asking operational questions.',
      evidence: [],
      confidence: 1,
      provider: 'none',
      model: 'none',
      sourceKind: 'STORED_TWIN_STATE',
      prompt,
      generatedAt,
      enforcedGrounding: false,
    };
  }

  const userPrompt = [
    `Operator question: ${prompt}`,
    'Durable twin evidence:',
    JSON.stringify(states, null, 2),
  ].join('\n\n');
  const completion = await completeWithConfiguredLlm(userPrompt, fetchImpl, env);
  const parsed = parseModelJson(completion.text);
  const grounded = enforceEvidenceGrounding(parsed.answer, states);
  return {
    answer: grounded.answer,
    recommendation: grounded.rewritten
      ? 'Review the attached stored evidence before acting.'
      : parsed.recommendation,
    confidence: grounded.rewritten ? Math.min(parsed.confidence, 0.4) : parsed.confidence,
    evidence: states,
    provider: completion.provider,
    model: completion.model,
    sourceKind: 'STORED_TWIN_STATE',
    prompt,
    generatedAt,
    enforcedGrounding: grounded.rewritten,
  };
}
