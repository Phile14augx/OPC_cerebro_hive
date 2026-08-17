import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { adoptBuildExceptionReview, reviewBuildExceptionProposals } from "./review-build-exceptions.mjs";

function fixtureReview({ privatePackage = true, testClassification = "REAL", extraPackage = {} } = {}) {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "w0-2-build-review-"));
  fs.mkdirSync(path.join(projectRoot, "packages", "library", "src"), { recursive: true });
  fs.mkdirSync(path.join(projectRoot, "apps", "consumer", "src"), { recursive: true });
  fs.writeFileSync(path.join(projectRoot, "packages", "library", "src", "index.ts"), "export const value = 1;\n");
  fs.writeFileSync(path.join(projectRoot, "apps", "consumer", "src", "index.ts"), "import '@fixture/library';\n");
  fs.writeFileSync(path.join(projectRoot, "packages", "library", "package.json"), JSON.stringify({
    name: "@fixture/library",
    private: privatePackage,
    exports: { ".": "./src/index.ts" },
    ...extraPackage,
  }));
  fs.writeFileSync(path.join(projectRoot, "apps", "consumer", "package.json"), JSON.stringify({
    name: "@fixture/consumer",
    private: true,
    dependencies: { "@fixture/library": "workspace:*" },
    scripts: { build: "tsc -p tsconfig.json" },
  }));
  const manifest = {
    workspaces: [
      {
        path: "packages/library",
        packageName: "@fixture/library",
        contracts: {
          build: { classification: "BROKEN" },
          typecheck: { classification: "REAL" },
          test: { classification: testClassification },
        },
      },
      {
        path: "apps/consumer",
        packageName: "@fixture/consumer",
        contracts: { build: { classification: "REAL", command: "tsc -p tsconfig.json" } },
      },
    ],
  };
  const exceptions = { exceptions: [{ workspacePath: "packages/library", contract: "build" }] };
  return { projectRoot, manifest, exceptions };
}

test("recommends approval only for a protected private source library with a compiling consumer", () => {
  const result = reviewBuildExceptionProposals(fixtureReview());

  assert.equal(result.decisions[0].technicalRecommendation, "APPROVE");
  assert.deepEqual(result.decisions[0].failedCriteria, []);
  assert.deepEqual(result.decisions[0].compilingConsumers, ["apps/consumer"]);
});

test("recommends rejection for a publishable package", () => {
  const result = reviewBuildExceptionProposals(fixtureReview({ privatePackage: false }));

  assert.equal(result.decisions[0].technicalRecommendation, "REJECT");
  assert.ok(result.decisions[0].failedCriteria.includes("PRIVATE_SOURCE_DISTRIBUTION"));
});

test("recommends rejection when real test protection is absent", () => {
  const result = reviewBuildExceptionProposals(fixtureReview({ testClassification: "BROKEN" }));

  assert.equal(result.decisions[0].technicalRecommendation, "REJECT");
  assert.ok(result.decisions[0].failedCriteria.includes("REAL_TYPECHECK_AND_TEST"));
});

test("recommends rejection when exports require prebuilt output", () => {
  const result = reviewBuildExceptionProposals(fixtureReview({
    extraPackage: { exports: { ".": { import: "./dist/index.js", types: "./src/index.ts" } } },
  }));

  assert.equal(result.decisions[0].technicalRecommendation, "REJECT");
  assert.ok(result.decisions[0].failedCriteria.includes("NO_PREBUILT_EXPORT"));
});

test("records an adopted recommendation without inventing a human reviewer", () => {
  const fixture = fixtureReview();
  const review = reviewBuildExceptionProposals(fixture);
  const triage = {
    findings: [{
      workspacePath: "packages/library",
      contract: "build",
      semanticDisposition: "PROPOSE_ABSENT_BY_DESIGN",
      priority: "P3",
      repairGroup: "build:source-distributed-exception",
    }],
    repairDag: [],
  };

  const adopted = adoptBuildExceptionReview({
    triage,
    exceptions: fixture.exceptions,
    review,
    owner: "Phile14augx",
    reviewReference: "docs/review.md; artifacts/review.json",
  });

  assert.equal(adopted.exceptions.exceptions[0].owner, "Phile14augx");
  assert.equal(adopted.exceptions.exceptions[0].adoptedDecision, "ABSENT-BY-DESIGN");
  assert.equal(adopted.exceptions.exceptions[0].reviewer, null);
  assert.equal(adopted.exceptions.exceptions[0].reviewStatus, "PENDING_REVIEWER");
});

test("returns an adopted rejection to the repair queue while review remains pending", () => {
  const fixture = fixtureReview({ privatePackage: false });
  const review = reviewBuildExceptionProposals(fixture);
  const triage = {
    findings: [{
      workspacePath: "packages/library",
      contract: "build",
      semanticDisposition: "PROPOSE_ABSENT_BY_DESIGN",
      priority: "P3",
      repairGroup: "build:source-distributed-exception",
      dependsOn: ["audit-infrastructure"],
    }],
    repairDag: [],
  };

  const adopted = adoptBuildExceptionReview({
    triage,
    exceptions: fixture.exceptions,
    review,
    owner: "Phile14augx",
    reviewReference: "docs/review.md; artifacts/review.json",
  });

  assert.equal(adopted.triage.findings[0].semanticDisposition, "REPAIR");
  assert.equal(adopted.triage.findings[0].repairGroup, "build:rejected-exception");
  assert.equal(adopted.exceptions.exceptions[0].adoptedDecision, "REPAIR");
  assert.equal(adopted.exceptions.exceptions[0].reviewStatus, "PENDING_REVIEWER");
  assert.equal(adopted.triage.repairQueue[0].workspaces[0], "packages/library");
});
