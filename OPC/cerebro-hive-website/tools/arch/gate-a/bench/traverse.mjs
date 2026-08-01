#!/usr/bin/env node
/** Metadata stress: stat() everything. The syscall-per-byte ratio here is the worst case for a userspace kernel. */
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

let files = 0, dirs = 0, bytes = 0;
const walk = (p) => {
  for (const e of readdirSync(p, { withFileTypes: true })) {
    const full = join(p, e.name);
    if (e.isDirectory()) { dirs++; walk(full); }
    else { files++; bytes += statSync(full).size; }
  }
};
walk(process.argv[2]);
process.stdout.write(JSON.stringify({ files, dirs, bytes }) + '\n');
