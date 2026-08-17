import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const run = (args) =>
  spawnSync(pnpm, args, {
    cwd: projectRoot,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
    shell: process.platform === "win32",
  });

test("the canonical Prisma schema passes its declared validation contract", () => {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "packages/db/package.json"), "utf8"),
  );
  assert.match(
    packageJson.scripts?.["validate:schema"] ?? "",
    /\bprisma\s+validate\b/,
    "@cerebro/db must declare a Prisma-backed validate:schema contract",
  );
  const result = run(["--filter", "@cerebro/db", "run", "validate:schema"]);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("an invalid Prisma schema is rejected by the same package-local validator", () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "w0-prisma-invalid-"));
  const fixtureSchema = path.join(fixtureRoot, "schema.prisma");
  const canonical = fs.readFileSync(
    path.join(projectRoot, "packages/db/prisma/schema.prisma"),
    "utf8",
  );
  fs.writeFileSync(
    fixtureSchema,
    `${canonical}\nmodel W0Invalid {\n  id DefinitelyNotARealPrismaType\n}\n`,
  );

  try {
    const result = run([
      "--filter",
      "@cerebro/db",
      "exec",
      "prisma",
      "validate",
      "--schema",
      fixtureSchema,
    ]);
    assert.notEqual(result.status, 0, "invalid schema unexpectedly validated successfully");
    assert.match(`${result.stdout}\n${result.stderr}`, /schema validation|P1012|not a valid type/i);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
});
