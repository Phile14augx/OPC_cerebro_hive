#!/usr/bin/env node
/** Deterministic corpus generation. Seeded PRNG so every runtime parses byte-identical input — otherwise the correctness check compares different work. */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

let seed = 0x2f6e2b1;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const pick = (a) => a[Math.floor(rnd() * a.length)];

const [, , kind, dest, ...rest] = process.argv;

if (kind === 'rtl') {
  const [modules, lines] = rest.map(Number);
  mkdirSync(dest, { recursive: true });
  const ops = ['&', '|', '^', '+', '-'];
  for (let m = 0; m < modules; m++) {
    const body = [`module blk_${m} #(parameter WIDTH = ${8 + (m % 56)}) (`,
      '  input  logic clk, rst_n,', '  input  logic [WIDTH-1:0] din,',
      '  output logic [WIDTH-1:0] dout', ');', '',
      '  logic [WIDTH-1:0] stage [0:3];', ''];
    for (let l = 0; l < lines; l++) {
      body.push(`  assign w_${l} = din ${pick(ops)} ${l}; // note ${l}`);
    }
    body.push('', '  always_ff @(posedge clk or negedge rst_n) begin',
      '    if (!rst_n) dout <= \'0; else dout <= stage[3];', '  end', '', 'endmodule');
    writeFileSync(join(dest, `blk_${m}.sv`), body.join('\n'));
  }
} else if (kind === 'tree') {
  const [dirs, filesPerDir, depth] = rest.map(Number);
  for (let d = 0; d < dirs; d++) {
    const parts = [];
    for (let k = 0; k < depth; k++) parts.push(`d${(d >> (k * 3)) & 7}`);
    const dir = join(dest, ...parts, `leaf${d}`);
    mkdirSync(dir, { recursive: true });
    for (let f = 0; f < filesPerDir; f++) writeFileSync(join(dir, `f${f}.dat`), `${d}:${f}`);
  }
}
console.error(`corpus ${kind} ready at ${dest}`);
