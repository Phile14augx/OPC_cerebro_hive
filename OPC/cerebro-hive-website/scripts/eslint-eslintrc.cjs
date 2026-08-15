#!/usr/bin/env node
/**
 * Run ESLint 9 against a package-local .eslintrc.json (EDA ADR rules).
 * ESLint 9 defaults to flat config and otherwise walks to the repo root
 * config, which ignores packages/** and services/**.
 */
"use strict";

process.env.ESLINT_USE_FLAT_CONFIG = "false";

const path = require("node:path");
const { spawn } = require("node:child_process");
const eslintRoot = path.dirname(require.resolve("eslint/package.json"));
const eslintJs = path.join(eslintRoot, "bin", "eslint.js");
const args = process.argv.slice(2);

const child = spawn(process.execPath, [eslintJs, ...args], {
  stdio: "inherit",
  env: process.env,
  cwd: process.cwd(),
});

child.on("exit", (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 1);
});
