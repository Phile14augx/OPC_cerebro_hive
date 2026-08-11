#!/usr/bin/env node
/** Tokenising parse. Emits a stable digest so outputs can be compared across runtimes. */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const dir = process.argv[2];
const h = createHash('sha256');
let modules = 0, tokens = 0;
for (const f of readdirSync(dir).sort()) {
  const src = readFileSync(join(dir, f), 'utf8');
  for (const tok of src.split(/[\s();,\[\]]+/)) {
    if (!tok) continue;
    tokens++;
    if (tok === 'module') modules++;
  }
  h.update(f); h.update(String(src.length));
}
process.stdout.write(JSON.stringify({ modules, tokens, digest: h.digest('hex') }) + '\n');
