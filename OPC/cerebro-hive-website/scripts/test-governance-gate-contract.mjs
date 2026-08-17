#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const repositoryRoot = path.resolve(projectRoot, "..", "..");
const workflowPath = path.join(repositoryRoot, ".github", "workflows", "governance-gate.yml");

assert.ok(
  fs.existsSync(workflowPath),
  "Missing required workflow: .github/workflows/governance-gate.yml",
);

const workflow = fs.readFileSync(workflowPath, "utf8");

assert.match(workflow, /pull_request:\s*[\s\S]*?branches:\s*\[main\]/, "Governance Gate must run for pull requests to main");
assert.match(workflow, /^\s*governance-gate:\s*$/m, "Governance Gate must declare a governance-gate job");
assert.match(workflow, /node-version:\s*22\b/, "Governance Gate must use Node 22");
assert.doesNotMatch(workflow, /continue-on-error:\s*true/, "Governance Gate must not mask failures with continue-on-error");
assert.doesNotMatch(workflow, /\|\|\s*true\b/, "Governance Gate must not mask failures with || true");

console.log("Governance workflow contract is valid.");
