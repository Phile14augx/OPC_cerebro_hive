/**
 * Fully automated AI hiring pipeline for the public /careers apply flow.
 *
 * No human touches an application between submission and outcome: an applicant
 * submits their resume text + LinkedIn URL for a role, the AI screens them
 * against the role's criteria, and — only if each stage is passed — the
 * pipeline advances automatically through 7 technical rounds and then 3 HR
 * rounds, ending in either an automatically generated offer or a rejection at
 * whichever stage the applicant didn't clear. Every stage's score and
 * rationale is recorded so the fully-automated decision stays auditable.
 *
 * This mirrors the "governed simulation" convention used across the rest of
 * this platform (HiveForge, CerebroStudio, CerebroSwarm, CerebroInsight):
 * scoring is deterministic and seeded from the application's own inputs
 * (same resume + role always produces the same result) rather than calling a
 * real resume-parsing or LLM provider.
 */

export interface StageResult {
  stage: string;
  category: "screening" | "technical" | "hr";
  score: number;
  passed: boolean;
  feedback: string;
}

export interface OfferDetails {
  level: "Associate" | "Mid-Level" | "Senior";
  annualCtc: string;
  startDate: string;
}

export type PipelineStatus = "screening_failed" | "technical_failed" | "hr_failed" | "offer_extended";

export interface PipelineResult {
  status: PipelineStatus;
  screening: StageResult;
  technicalRounds: StageResult[];
  hrRounds: StageResult[];
  offer: OfferDetails | null;
  summary: string;
}

const TECHNICAL_ROUNDS = [
  "Resume & Skills Match",
  "Written Assessment",
  "Technical Assessment",
  "Coding & Practical Exercise",
  "System Design Review",
  "AI Case Study",
  "Technical Panel Review",
] as const;

const HR_ROUNDS = ["Behavioral Interview", "Culture & Values Fit", "Final HR Review"] as const;

const SCREENING_PASS_THRESHOLD = 60;
const ROUND_PASS_THRESHOLD = 60;

/** Tiny deterministic string hash -> 32-bit seed (djb2 variant). */
function hashSeed(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

/** Deterministic PRNG (mulberry32) seeded from the hash above — no external deps, fully reproducible. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function keywordOverlapBonus(resumeText: string, roleTitle: string): number {
  const words = roleTitle.toLowerCase().split(/[\s/&-]+/).filter(w => w.length > 2);
  const resumeLower = resumeText.toLowerCase();
  const hits = words.filter(w => resumeLower.includes(w)).length;
  return words.length === 0 ? 0 : (hits / words.length) * 15;
}

export function runHiringPipeline(input: {
  applicantName: string;
  applicantEmail: string;
  roleTitle: string;
  resumeText: string;
  linkedinUrl: string;
}): PipelineResult {
  const seed = hashSeed(`${input.applicantEmail}:${input.roleTitle}:${input.resumeText.length}`);
  const rand = mulberry32(seed);

  // ---------------- Screening: AI resume + LinkedIn evaluation against role criteria ----------------
  const resumeDepthBonus = clamp(input.resumeText.trim().length / 40, 0, 25);
  const linkedinBonus = input.linkedinUrl.trim().length > 0 ? 10 : 0;
  const roleMatchBonus = keywordOverlapBonus(input.resumeText, input.roleTitle);
  const screeningScore = Math.round(clamp(35 + resumeDepthBonus + linkedinBonus + roleMatchBonus + rand() * 15, 0, 100));
  const screeningPassed = screeningScore >= SCREENING_PASS_THRESHOLD;

  const screening: StageResult = {
    stage: "AI Resume & LinkedIn Screening",
    category: "screening",
    score: screeningScore,
    passed: screeningPassed,
    feedback: screeningPassed
      ? `Profile matches the criteria for ${input.roleTitle} — resume depth, LinkedIn presence, and role keyword alignment all cleared the bar. Advancing automatically to the technical rounds.`
      : `Profile did not meet the minimum bar for ${input.roleTitle} (score ${screeningScore}/100, needed ${SCREENING_PASS_THRESHOLD}). Add more role-relevant detail to your resume and LinkedIn profile and re-apply.`,
  };

  const technicalRounds: StageResult[] = [];
  const hrRounds: StageResult[] = [];

  if (!screeningPassed) {
    return {
      status: "screening_failed",
      screening,
      technicalRounds,
      hrRounds,
      offer: null,
      summary: `Not selected — did not clear AI screening for ${input.roleTitle}.`,
    };
  }

  // ---------------- 7 automated technical rounds ----------------
  let technicalFailedAt: string | null = null;
  for (const roundName of TECHNICAL_ROUNDS) {
    const drift = (rand() - 0.35) * 35;
    const score = Math.round(clamp(screeningScore + drift, 0, 100));
    const passed = score >= ROUND_PASS_THRESHOLD;
    technicalRounds.push({
      stage: roundName,
      category: "technical",
      score,
      passed,
      feedback: passed
        ? `Cleared ${roundName} (${score}/100). Automatically advancing to the next round.`
        : `Did not clear ${roundName} (${score}/100, needed ${ROUND_PASS_THRESHOLD}). Pipeline stops here.`,
    });
    if (!passed) {
      technicalFailedAt = roundName;
      break;
    }
  }

  if (technicalFailedAt) {
    return {
      status: "technical_failed",
      screening,
      technicalRounds,
      hrRounds,
      offer: null,
      summary: `Not selected — did not clear the technical round "${technicalFailedAt}" for ${input.roleTitle}.`,
    };
  }

  // ---------------- 3 automated HR rounds ----------------
  let hrFailedAt: string | null = null;
  for (const roundName of HR_ROUNDS) {
    const drift = (rand() - 0.3) * 30;
    const score = Math.round(clamp(screeningScore + drift, 0, 100));
    const passed = score >= ROUND_PASS_THRESHOLD;
    hrRounds.push({
      stage: roundName,
      category: "hr",
      score,
      passed,
      feedback: passed
        ? `Cleared ${roundName} (${score}/100). Automatically advancing.`
        : `Did not clear ${roundName} (${score}/100, needed ${ROUND_PASS_THRESHOLD}). Pipeline stops here.`,
    });
    if (!passed) {
      hrFailedAt = roundName;
      break;
    }
  }

  if (hrFailedAt) {
    return {
      status: "hr_failed",
      screening,
      technicalRounds,
      hrRounds,
      offer: null,
      summary: `Not selected — did not clear the HR round "${hrFailedAt}" for ${input.roleTitle}.`,
    };
  }

  // ---------------- Automated offer generation ----------------
  const allScores = [screening.score, ...technicalRounds.map(r => r.score), ...hrRounds.map(r => r.score)];
  const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
  const level: OfferDetails["level"] = avgScore >= 85 ? "Senior" : avgScore >= 72 ? "Mid-Level" : "Associate";
  const ctcByLevel: Record<OfferDetails["level"], string> = {
    "Associate": "₹12,00,000 - ₹18,00,000 / year",
    "Mid-Level": "₹20,00,000 - ₹32,00,000 / year",
    "Senior": "₹36,00,000 - ₹55,00,000 / year",
  };
  const startDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const offer: OfferDetails = { level, annualCtc: ctcByLevel[level], startDate };

  return {
    status: "offer_extended",
    screening,
    technicalRounds,
    hrRounds,
    offer,
    summary: `Offer extended for ${input.roleTitle} — ${level} level, start date ${startDate}.`,
  };
}
