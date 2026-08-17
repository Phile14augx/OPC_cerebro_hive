import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  auditWorkspaceContracts,
  generateClassificationManifest,
  generateWorkspaceInventory,
} from "./audit-workspace-contracts.mjs";

function fixtureProject({ manifest = {}, scripts = {} } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "w0-2-contracts-"));
  fs.writeFileSync(path.join(root, "pnpm-workspace.yaml"), 'packages:\n  - "packages/*"\n');
  fs.mkdirSync(path.join(root, "packages", "source-package", "src"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "packages", "source-package", "package.json"),
    JSON.stringify({ name: "@fixture/source-package", scripts }),
  );
  fs.writeFileSync(path.join(root, "packages", "source-package", "src", "index.ts"), "export const value = 1;\n");
  const manifestPath = path.join(root, "workspace-validation-classification.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  return { root, manifestPath };
}

test("rejects a source-bearing workspace missing from the classification manifest", () => {
  const fixture = fixtureProject();

  assert.throws(
    () => auditWorkspaceContracts({ projectRoot: fixture.root, manifestPath: fixture.manifestPath, expectedWorkspaceCount: 1 }),
    /W0C_MISSING_WORKSPACE/,
  );
});

test("generates a root-separated workspace inventory with source and contract evidence", () => {
  const fixture = fixtureProject({ scripts: { build: "tsc -p tsconfig.json", test: "node --test" } });

  const inventory = generateWorkspaceInventory({ projectRoot: fixture.root, expectedWorkspaceCount: 1 });

  assert.equal(inventory.baselineWorkspaceCount, 1);
  assert.deepEqual(inventory.controlPlane, [{ path: ".", classification: "CONTROL-PLANE" }]);
  assert.deepEqual(inventory.workspaces, [{
    path: "packages/source-package",
    packageName: "@fixture/source-package",
    hasSource: true,
    contracts: {
      build: "tsc -p tsconfig.json",
      test: "node --test",
      typecheck: null,
      lint: null,
      "schema-config": null,
    },
    schemaConfigEvidence: [],
    semanticCandidates: [],
    findings: [],
  }]);
  assert.deepEqual(inventory.externalDependencies, []);
  assert.deepEqual(inventory.findings, []);
});

test("classifies every core contract without implicit source-bearing omissions", () => {
  const fixture = fixtureProject({
    scripts: { build: "tsc -p tsconfig.json", test: "vitest run --passWithNoTests" },
  });
  const inventory = generateWorkspaceInventory({ projectRoot: fixture.root, expectedWorkspaceCount: 1 });

  const manifest = generateClassificationManifest(inventory);
  const [workspace] = manifest.workspaces;

  assert.equal(workspace.path, "packages/source-package");
  assert.equal(workspace.packageName, "@fixture/source-package");
  assert.equal(workspace.hasSource, true);
  assert.equal(workspace.contracts.build.classification, "REAL");
  assert.equal(workspace.contracts.test.classification, "FALSE-GREEN");
  assert.equal(workspace.contracts.typecheck.classification, "BROKEN");
  assert.equal(workspace.contracts.lint.classification, "BROKEN");
  assert.equal(workspace.contracts["schema-config"].classification, "NOT-APPLICABLE");
  assert.equal(Object.values(workspace.contracts).filter((contract) => !contract.classification).length, 0);
  assert.deepEqual(workspace.semanticCandidates, [{
    script: "test",
    contract: "test",
    classification: "FALSE-GREEN",
    command: "vitest run --passWithNoTests",
    evidence: "Validation script can succeed when no tests are discovered.",
  }]);
  assert.deepEqual(manifest.controlPlane, [{ path: ".", classification: "CONTROL-PLANE" }]);
});

test("classifies an unvalidated schema asset as BROKEN", () => {
  const fixture = fixtureProject();
  fs.mkdirSync(path.join(fixture.root, "packages", "source-package", "prisma"));
  fs.writeFileSync(
    path.join(fixture.root, "packages", "source-package", "prisma", "schema.prisma"),
    "datasource db { provider = \"postgresql\" }\n",
  );

  const inventory = generateWorkspaceInventory({ projectRoot: fixture.root, expectedWorkspaceCount: 1 });
  const manifest = generateClassificationManifest(inventory);

  assert.deepEqual(inventory.workspaces[0].schemaConfigEvidence, ["prisma/schema.prisma"]);
  assert.equal(manifest.workspaces[0].contracts["schema-config"].classification, "BROKEN");
  assert.match(manifest.workspaces[0].contracts["schema-config"].evidence, /prisma\/schema\.prisma/);
});

test("audits a complete manifest and preserves every classified defect", () => {
  const fixture = fixtureProject({
    scripts: { build: "tsc -p tsconfig.json", test: "vitest run --passWithNoTests" },
  });
  const inventory = generateWorkspaceInventory({ projectRoot: fixture.root, expectedWorkspaceCount: 1 });
  const manifest = generateClassificationManifest(inventory);
  fs.writeFileSync(fixture.manifestPath, JSON.stringify(manifest));

  let error;
  try {
    auditWorkspaceContracts({ projectRoot: fixture.root, manifestPath: fixture.manifestPath, expectedWorkspaceCount: 1 });
  } catch (caught) {
    error = caught;
  }

  assert.match(error.message, /W0C_CLASSIFIED_DEFECT/);
  assert.deepEqual(error.auditResult.classificationCounts, {
    REAL: 1,
    "ABSENT-BY-DESIGN": 0,
    BROKEN: 2,
    PLACEHOLDER: 0,
    "FALSE-GREEN": 1,
    "NOT-APPLICABLE": 1,
  });
  assert.equal(error.auditResult.unclassified, 0);
  assert.equal(error.auditResult.findings.filter((finding) => finding.code === "W0C_CLASSIFIED_DEFECT").length, 3);
});

test("rejects ABSENT-BY-DESIGN when owner and review evidence are missing", () => {
  const fixture = fixtureProject({
    manifest: {
      workspaces: [{
        path: "packages/source-package",
        contracts: { test: { status: "ABSENT-BY-DESIGN", rationale: "fixture" } },
      }],
    },
  });

  assert.throws(
    () => auditWorkspaceContracts({ projectRoot: fixture.root, manifestPath: fixture.manifestPath, expectedWorkspaceCount: 1 }),
    /W0C_UNREVIEWED_EXCEPTION/,
  );
});

test("rejects an unknown classification value", () => {
  const fixture = fixtureProject({
    manifest: { workspaces: [{ path: "packages/source-package", contracts: { test: { status: "MAYBE" } } }] },
  });

  assert.throws(
    () => auditWorkspaceContracts({ projectRoot: fixture.root, manifestPath: fixture.manifestPath, expectedWorkspaceCount: 1 }),
    /W0C_UNKNOWN_CLASSIFICATION/,
  );
});

test("rejects duplicate and stale manifest paths", () => {
  const fixture = fixtureProject({
    manifest: { workspaces: [
      { path: "packages/source-package", contracts: {} },
      { path: "packages/source-package", contracts: {} },
      { path: "packages/removed-package", contracts: {} },
    ] },
  });

  assert.throws(
    () => auditWorkspaceContracts({ projectRoot: fixture.root, manifestPath: fixture.manifestPath, expectedWorkspaceCount: 1 }),
    /W0C_DUPLICATE_MANIFEST_PATH/,
  );
});

test("rejects a stale manifest entry when there is no duplicate", () => {
  const fixture = fixtureProject({ manifest: { workspaces: [{ path: "packages/removed-package", contracts: {} }] } });
  assert.throws(() => auditWorkspaceContracts({ projectRoot: fixture.root, manifestPath: fixture.manifestPath, expectedWorkspaceCount: 1 }), /W0C_STALE_MANIFEST_PATH/);
});

test("rejects a declared workspace missing from the manifest", () => {
  const fixture = fixtureProject({ manifest: { workspaces: [] } });
  assert.throws(() => auditWorkspaceContracts({ projectRoot: fixture.root, manifestPath: fixture.manifestPath, expectedWorkspaceCount: 1 }), /W0C_MISSING_WORKSPACE/);
});

test("rejects a declared graph count mismatch", () => {
  const fixture = fixtureProject({ manifest: { workspaces: [] } });
  assert.throws(() => auditWorkspaceContracts({ projectRoot: fixture.root, manifestPath: fixture.manifestPath, expectedWorkspaceCount: 2 }), /W0C_WORKSPACE_GRAPH_MISMATCH/);
});

test("rejects the monorepo root as a workspace record", () => {
  const fixture = fixtureProject({ manifest: { workspaces: [{ path: ".", contracts: {} }] } });
  assert.throws(() => auditWorkspaceContracts({ projectRoot: fixture.root, manifestPath: fixture.manifestPath, expectedWorkspaceCount: 1 }), /W0C_ROOT_SCOPE_VIOLATION/);
});

test("rejects a REAL validation contract that unconditionally exits successfully", () => {
  const fixture = fixtureProject({
    scripts: { typecheck: "exit 0" },
    manifest: { workspaces: [{ path: "packages/source-package", contracts: { typecheck: { status: "REAL" } } }] },
  });
  assert.throws(() => auditWorkspaceContracts({ projectRoot: fixture.root, manifestPath: fixture.manifestPath, expectedWorkspaceCount: 1 }), /W0C_FALSE_GREEN_CONTRACT/);
});

test("records a dangling source path while retaining its owning workspace", () => {
  const fixture = fixtureProject({ manifest: { workspaces: [{ path: "packages/source-package", contracts: {} }] } });
  fs.symlinkSync(path.join(fixture.root, "missing-internal"), path.join(fixture.root, "packages", "source-package", "internal"), "junction");
  let error;
  try {
    auditWorkspaceContracts({ projectRoot: fixture.root, manifestPath: fixture.manifestPath, expectedWorkspaceCount: 1 });
  } catch (caught) {
    error = caught;
  }
  assert.match(error.message, /W0C_DANGLING_SOURCE_PATH/);
  assert.equal(error.auditResult.workspaceCount, 1);
  assert.deepEqual(error.auditResult.workspacePaths, ["packages/source-package"]);
  assert.equal(error.auditResult.inventory[0].hasSource, true);
  assert.deepEqual(error.auditResult.findings, [{
    code: "W0C_DANGLING_SOURCE_PATH",
    workspacePath: "packages/source-package",
    path: "packages/source-package/internal",
    phase: "source-discovery",
  }]);
});
