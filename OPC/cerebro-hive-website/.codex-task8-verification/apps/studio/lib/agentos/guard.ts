// Cerebro Guard — real pattern-based PII and prompt-injection detection.
// Genuinely scans input text; nothing here is a canned or simulated result.

import { GuardFinding, GuardReport } from "./types";

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g;
const CC_RE = /\b(?:\d[ -]*?){13,16}\b/g;
const SSN_RE = /\b\d{3}-\d{2}-\d{4}\b/g;

const INJECTION_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "Instruction override attempt", re: /ignore (all|any|the)? ?(previous|prior|above)?\s*instructions?/i },
  { label: "System prompt extraction attempt", re: /(reveal|show|print|output)\s+(your|the)\s+(system\s+)?prompt/i },
  { label: "Role hijack attempt", re: /you are now\s+(?:a|an)?\s*[\w\s]{0,30}(?:with no|without)\s+(restrictions|rules|filters)/i },
  { label: "Disregard-safety attempt", re: /disregard\s+(safety|guardrails|policy|policies)/i },
  { label: "Jailbreak marker", re: /\bDAN\b|do anything now/i },
];

/** Luhn check so we don't flag every 13-16 digit number as a card number. */
function passesLuhn(digits: string): boolean {
  const clean = digits.replace(/\D/g, "");
  if (clean.length < 13 || clean.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let n = parseInt(clean[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function runGuard(input: string): GuardReport {
  const findings: GuardFinding[] = [];
  let redacted = input;

  for (const match of input.match(EMAIL_RE) ?? []) {
    findings.push({ type: "pii", label: "Email address", match });
    redacted = redacted.replace(match, "[REDACTED_EMAIL]");
  }

  for (const match of input.match(SSN_RE) ?? []) {
    findings.push({ type: "pii", label: "SSN-format number", match });
    redacted = redacted.replace(match, "[REDACTED_SSN]");
  }

  for (const match of input.match(CC_RE) ?? []) {
    if (passesLuhn(match)) {
      findings.push({ type: "pii", label: "Card-number candidate (Luhn-valid)", match });
      redacted = redacted.replace(match, "[REDACTED_CARD]");
    }
  }

  for (const match of input.match(PHONE_RE) ?? []) {
    // Skip anything already consumed as part of a Luhn-valid card number.
    if (findings.some((f) => f.match.includes(match))) continue;
    findings.push({ type: "pii", label: "Phone number", match });
    redacted = redacted.replace(match, "[REDACTED_PHONE]");
  }

  for (const { label, re } of INJECTION_PATTERNS) {
    const match = input.match(re);
    if (match) {
      findings.push({ type: "prompt-injection", label, match: match[0] });
    }
  }

  const piiCount = findings.filter((f) => f.type === "pii").length;
  const injectionCount = findings.filter((f) => f.type === "prompt-injection").length;
  const riskScore = Math.min(100, piiCount * 20 + injectionCount * 40);

  return {
    input,
    redactedInput: redacted,
    findings,
    riskScore,
    blocked: injectionCount > 0,
  };
}
