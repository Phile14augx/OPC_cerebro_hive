#!/usr/bin/env node
/** End-to-end: read, parse, hash, write content-addressed artifacts. */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const [, , dir, out] = process.argv;
mkdirSync(out, { recursive: true });
const index = [];
for (const f of readdirSync(dir).sort()) {
  const src = readFileSync(join(dir, f));
  const digest = createHash('sha256').update(src).digest('hex');
  const summary = { file: f, bytes: src.length, lines: src.toString().split('\n').length, digest };
  writeFileSync(join(out, `${digest.slice(0, 16)}.json`), JSON.stringify(summary));
  index.push(summary);
}
const roll = createHash('sha256').update(index.map((i) => i.digest).join('')).digest('hex');
writeFileSync(join(out, 'index.json'), JSON.stringify({ n: index.length, roll }));
process.stdout.write(roll + '\n');
