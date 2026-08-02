#!/usr/bin/env node
/** Rule evaluation with findings written out. */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';

const [, , dir, out] = process.argv;
const RULES = [
  { id: 'no-tab', re: /\t/ },
  { id: 'implicit-width', re: /assign\s+w_\d+\s*=\s*din/ },
  { id: 'blocking-in-ff', re: /always_ff[\s\S]{0,80}?[^<]=[^=]/ },
  { id: 'magic-number', re: /\b\d{3,}\b/ },
];
const findings = [];
for (const f of readdirSync(dir).sort()) {
  const src = readFileSync(join(dir, f), 'utf8');
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const r of RULES) if (r.re.test(lines[i])) findings.push({ file: f, rule: r.id, line: i + 1 });
  }
}
mkdirSync(dirname(out), { recursive: true });
const payload = JSON.stringify({ count: findings.length, sample: findings.slice(0, 50) });
writeFileSync(out, payload);
process.stdout.write(createHash('sha256').update(payload).digest('hex') + '\n');
