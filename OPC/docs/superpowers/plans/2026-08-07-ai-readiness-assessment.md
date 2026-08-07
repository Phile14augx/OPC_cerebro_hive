# AI Readiness Assessment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a public AI Readiness Assessment service page, a six-factor scored questionnaire, and consent-based consultation lead hand-off.

**Architecture:** Extract readiness definitions and scoring into pure TypeScript modules. Render them through a reusable client wizard on a public service route, and submit an explicit typed assessment lead to the existing `/api/leads` route only after consent.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Zod, existing Studio CSS variables and tracked controls, Node test runner via `tsx`.

## Global Constraints

- Keep the assessment usable without authentication.
- Provide six factors exactly: strategy, data, technology, people, governance, and delivery.
- Return a deterministic 0–100 score and one of Foundation, Emerging, Ready to Scale, or Transformational.
- Do not claim a consultation was sent unless `/api/leads` returns success.
- Require name, valid work email, company, and explicit consent before lead submission.
- Keep answers in browser memory until the visitor submits the consultation form.
- Do not modify unrelated dirty worktree files.

---

## File structure

- Create `cerebro-hive-website/apps/studio/lib/ai-readiness/definition.ts`: questions, factor metadata, thresholds, and recommendations.
- Create `cerebro-hive-website/apps/studio/lib/ai-readiness/scoring.ts`: pure validation and scoring API.
- Create `cerebro-hive-website/apps/studio/lib/ai-readiness/scoring.test.ts`: score and boundary tests.
- Create `cerebro-hive-website/apps/studio/components/services/AiReadinessAssessment.tsx`: service page, wizard, result, and consultation form.
- Create `cerebro-hive-website/apps/studio/app/services/ai-readiness-assessment/page.tsx`: public route.
- Modify `cerebro-hive-website/apps/studio/lib/security/schemas.ts`: validate assessment-lead metadata.
- Modify `cerebro-hive-website/apps/studio/app/api/leads/route.ts`: persist only validated assessment leads.
- Create `cerebro-hive-website/apps/studio/tests/e2e/ai-readiness-assessment.spec.ts`: browser flow coverage.

### Task 1: Readiness domain and deterministic scoring

**Files:**
- Create: `cerebro-hive-website/apps/studio/lib/ai-readiness/definition.ts`
- Create: `cerebro-hive-website/apps/studio/lib/ai-readiness/scoring.ts`
- Test: `cerebro-hive-website/apps/studio/lib/ai-readiness/scoring.test.ts`

**Interfaces:**
- Produces: `AssessmentAnswer`, `AssessmentResult`, `QUESTIONS`, and `calculateAssessment(answers: Record<string, number>): AssessmentResult`.

- [ ] **Step 1: Write the failing tests**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateAssessment } from './scoring';

test('maps boundary scores to bands', () => {
  assert.equal(calculateAssessment({ all: 24 }).band, 'Foundation');
  assert.equal(calculateAssessment({ all: 25 }).band, 'Emerging');
  assert.equal(calculateAssessment({ all: 75 }).band, 'Transformational');
});

test('rejects an out-of-range answer', () => {
  assert.throws(() => calculateAssessment({ strategy_1: 101 }));
});
```

- [ ] **Step 2: Verify the tests fail**

Run: `pnpm --filter @cerebro/studio exec tsx --test lib/ai-readiness/scoring.test.ts`

Expected: FAIL because the scoring module does not exist.

- [ ] **Step 3: Write the minimal scoring implementation**

```ts
export type MaturityBand = 'Foundation' | 'Emerging' | 'Ready to Scale' | 'Transformational';

export function calculateAssessment(answers: Record<string, number>): AssessmentResult {
  const factorScores = FACTORS.map((factor) => scoreFactor(factor, answers));
  const score = Math.round(factorScores.reduce((sum, factor) => sum + factor.score * factor.weight, 0));
  return { score, band: maturityFor(score), factorScores, recommendation: recommendationFor(score) };
}
```

Define at least one four-option question for every factor, validate all answers, and make weights total exactly `1`.

- [ ] **Step 4: Verify the tests pass**

Run: `pnpm --filter @cerebro/studio exec tsx --test lib/ai-readiness/scoring.test.ts`

Expected: PASS for factor weighting, boundaries, and invalid answers.

- [ ] **Step 5: Commit**

```bash
git add cerebro-hive-website/apps/studio/lib/ai-readiness
git commit -m "feat(readiness): add assessment scoring domain"
```

### Task 2: Public service page and accessible assessment flow

**Files:**
- Create: `cerebro-hive-website/apps/studio/components/services/AiReadinessAssessment.tsx`
- Create: `cerebro-hive-website/apps/studio/app/services/ai-readiness-assessment/page.tsx`
- Test: `cerebro-hive-website/apps/studio/tests/e2e/ai-readiness-assessment.spec.ts`

**Interfaces:**
- Consumes: `QUESTIONS` and `calculateAssessment` from Task 1.
- Produces: the public route and the `AssessmentResult` used by Task 3.

- [ ] **Step 1: Write the failing browser test**

```ts
test('shows an immediate result after completing every question', async ({ page }) => {
  await page.goto('/services/ai-readiness-assessment');
  await page.getByRole('button', { name: /start assessment/i }).click();
  // Answer every radio group and advance.
  await expect(page.getByRole('heading', { name: /your readiness result/i })).toBeVisible();
});
```

- [ ] **Step 2: Verify the test fails**

Run: `pnpm --filter @cerebro/studio exec playwright test tests/e2e/ai-readiness-assessment.spec.ts`

Expected: FAIL with a missing route.

- [ ] **Step 3: Implement the route and wizard**

```tsx
const [answers, setAnswers] = useState<Record<string, number>>({});
const [step, setStep] = useState<'service' | 'questions' | 'result'>('service');
const result = step === 'result' ? calculateAssessment(answers) : null;
```

Use semantic `fieldset`/ `legend` elements and labelled radios, visible progress, Back/Next navigation, explicit required-answer messages through `aria-live`, and Studio design tokens. Keep `/tools/ai-readiness` unchanged.

- [ ] **Step 4: Verify browser and type checks pass**

Run: `pnpm --filter @cerebro/studio exec playwright test tests/e2e/ai-readiness-assessment.spec.ts`

Run: `pnpm --filter @cerebro/studio run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cerebro-hive-website/apps/studio/components/services cerebro-hive-website/apps/studio/app/services cerebro-hive-website/apps/studio/tests/e2e/ai-readiness-assessment.spec.ts
git commit -m "feat(readiness): add public assessment service"
```

### Task 3: Consent-based lead hand-off and truthful failure state

**Files:**
- Modify: `cerebro-hive-website/apps/studio/lib/security/schemas.ts`
- Modify: `cerebro-hive-website/apps/studio/app/api/leads/route.ts`
- Modify: `cerebro-hive-website/apps/studio/components/services/AiReadinessAssessment.tsx`
- Modify: `cerebro-hive-website/apps/studio/tests/e2e/ai-readiness-assessment.spec.ts`

**Interfaces:**
- Consumes: `AssessmentResult` from Task 1.
- Produces: `POST /api/leads` payload `{ type: 'ai-readiness-assessment', name, email, company, consent, assessment }`.

- [ ] **Step 1: Write failing server and browser failure tests**

```ts
test('rejects an assessment lead without consent', async () => {
  const response = await POST(requestWith({ type: 'ai-readiness-assessment', consent: false }));
  assert.equal(response.status, 400);
});
```

The browser test intercepts `/api/leads` with status 500 and expects the scorecard plus “request was not sent” to remain visible.

- [ ] **Step 2: Verify the tests fail**

Run: `pnpm --filter @cerebro/studio exec tsx --test tests/api/leads.test.ts`

Run: `pnpm --filter @cerebro/studio exec playwright test tests/e2e/ai-readiness-assessment.spec.ts`

Expected: FAIL because metadata/consent validation and retryable UI state do not exist.

- [ ] **Step 3: Implement schema and hand-off**

```ts
const readinessLeadSchema = z.object({
  type: z.literal('ai-readiness-assessment'),
  name: z.string().trim().min(1),
  email: z.string().email(),
  company: z.string().trim().min(1),
  consent: z.literal(true),
  assessment: assessmentResultSchema,
});
```

Only set the client success state after `response.ok`; on failure, keep the result and completed form visible and provide a retry action.

- [ ] **Step 4: Verify test and build checks pass**

Run: `pnpm --filter @cerebro/studio exec tsx --test tests/api/leads.test.ts`

Run: `pnpm --filter @cerebro/studio exec playwright test tests/e2e/ai-readiness-assessment.spec.ts`

Run: `pnpm --filter @cerebro/studio run typecheck`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cerebro-hive-website/apps/studio/lib/security/schemas.ts cerebro-hive-website/apps/studio/app/api/leads/route.ts cerebro-hive-website/apps/studio/components/services/AiReadinessAssessment.tsx cerebro-hive-website/apps/studio/tests
git commit -m "feat(readiness): hand off consultation leads"
```

## Self-review

- Spec coverage: Tasks 1–2 cover the public page, six factors, immediate result, and accessibility. Task 3 covers consent, hand-off, and truthful failure behavior.
- Exclusions: authentication, payment, email reports, and CRM integration are not added.
- Type consistency: `AssessmentResult` is the scoring output, consultation payload metadata, and the object guarded by the lead schema.

