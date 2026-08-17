import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

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
  fs.writeFileSync(
    path.join(root, "packages", "source-package", "src", "index.ts"),
    "export const value = 1;\n",
  );
  const manifestPath = path.join(root, "workspace-validation-classification.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  return { root, manifestPath };
}

test("rejects a source-bearing workspace missing from the classification manifest", () => {
  const fixture = fixtureProject();

  assert.throws(
    () =>
      auditWorkspaceContracts({
        projectRoot: fixture.root,
        manifestPath: fixture.manifestPath,
        expectedWorkspaceCount: 1,
      }),
    /W0C_MISSING_WORKSPACE/,
  );
});

test("generates a root-separated workspace inventory with source and contract evidence", () => {
  const fixture = fixtureProject({
    scripts: { build: "tsc -p tsconfig.json", test: "node --test" },
  });

  const inventory = generateWorkspaceInventory({
    projectRoot: fixture.root,
    expectedWorkspaceCount: 1,
  });

  assert.equal(inventory.baselineWorkspaceCount, 1);
  assert.deepEqual(inventory.controlPlane, [{ path: ".", classification: "CONTROL-PLANE" }]);
  assert.deepEqual(inventory.workspaces, [
    {
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
    },
  ]);
  assert.deepEqual(inventory.externalDependencies, []);
  assert.deepEqual(inventory.findings, []);
});

test("classifies every core contract without implicit source-bearing omissions", () => {
  const fixture = fixtureProject({
    scripts: { build: "tsc -p tsconfig.json", test: "vitest run --passWithNoTests" },
  });
  const inventory = generateWorkspaceInventory({
    projectRoot: fixture.root,
    expectedWorkspaceCount: 1,
  });

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
  assert.equal(
    Object.values(workspace.contracts).filter((contract) => !contract.classification).length,
    0,
  );
  assert.deepEqual(workspace.semanticCandidates, [
    {
      script: "test",
      contract: "test",
      classification: "FALSE-GREEN",
      command: "vitest run --passWithNoTests",
      evidence: "Validation script can succeed when no tests are discovered.",
    },
  ]);
  assert.deepEqual(manifest.controlPlane, [{ path: ".", classification: "CONTROL-PLANE" }]);
});

test("classifies an unvalidated schema asset as BROKEN", () => {
  const fixture = fixtureProject();
  fs.mkdirSync(path.join(fixture.root, "packages", "source-package", "prisma"));
  fs.writeFileSync(
    path.join(fixture.root, "packages", "source-package", "prisma", "schema.prisma"),
    'datasource db { provider = "postgresql" }\n',
  );

  const inventory = generateWorkspaceInventory({
    projectRoot: fixture.root,
    expectedWorkspaceCount: 1,
  });
  const manifest = generateClassificationManifest(inventory);

  assert.deepEqual(inventory.workspaces[0].schemaConfigEvidence, ["prisma/schema.prisma"]);
  assert.equal(manifest.workspaces[0].contracts["schema-config"].classification, "BROKEN");
  assert.match(
    manifest.workspaces[0].contracts["schema-config"].evidence,
    /prisma\/schema\.prisma/,
  );
});

test("audits a complete manifest and preserves every classified defect", () => {
  const fixture = fixtureProject({
    scripts: { build: "tsc -p tsconfig.json", test: "vitest run --passWithNoTests" },
  });
  const inventory = generateWorkspaceInventory({
    projectRoot: fixture.root,
    expectedWorkspaceCount: 1,
  });
  const manifest = generateClassificationManifest(inventory);
  fs.writeFileSync(fixture.manifestPath, JSON.stringify(manifest));

  let error;
  try {
    auditWorkspaceContracts({
      projectRoot: fixture.root,
      manifestPath: fixture.manifestPath,
      expectedWorkspaceCount: 1,
    });
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
  assert.equal(
    error.auditResult.findings.filter((finding) => finding.code === "W0C_CLASSIFIED_DEFECT").length,
    3,
  );
});

test("rejects ABSENT-BY-DESIGN when owner and review evidence are missing", () => {
  const fixture = fixtureProject({
    manifest: {
      workspaces: [
        {
          path: "packages/source-package",
          contracts: { test: { status: "ABSENT-BY-DESIGN", rationale: "fixture" } },
        },
      ],
    },
  });

  assert.throws(
    () =>
      auditWorkspaceContracts({
        projectRoot: fixture.root,
        manifestPath: fixture.manifestPath,
        expectedWorkspaceCount: 1,
      }),
    /W0C_UNREVIEWED_EXCEPTION/,
  );
});

test("rejects an unknown classification value", () => {
  const fixture = fixtureProject({
    manifest: {
      workspaces: [{ path: "packages/source-package", contracts: { test: { status: "MAYBE" } } }],
    },
  });

  assert.throws(
    () =>
      auditWorkspaceContracts({
        projectRoot: fixture.root,
        manifestPath: fixture.manifestPath,
        expectedWorkspaceCount: 1,
      }),
    /W0C_UNKNOWN_CLASSIFICATION/,
  );
});

test("rejects duplicate and stale manifest paths", () => {
  const fixture = fixtureProject({
    manifest: {
      workspaces: [
        { path: "packages/source-package", contracts: {} },
        { path: "packages/source-package", contracts: {} },
        { path: "packages/removed-package", contracts: {} },
      ],
    },
  });

  assert.throws(
    () =>
      auditWorkspaceContracts({
        projectRoot: fixture.root,
        manifestPath: fixture.manifestPath,
        expectedWorkspaceCount: 1,
      }),
    /W0C_DUPLICATE_MANIFEST_PATH/,
  );
});

test("rejects a stale manifest entry when there is no duplicate", () => {
  const fixture = fixtureProject({
    manifest: { workspaces: [{ path: "packages/removed-package", contracts: {} }] },
  });
  assert.throws(
    () =>
      auditWorkspaceContracts({
        projectRoot: fixture.root,
        manifestPath: fixture.manifestPath,
        expectedWorkspaceCount: 1,
      }),
    /W0C_STALE_MANIFEST_PATH/,
  );
});

test("rejects a declared workspace missing from the manifest", () => {
  const fixture = fixtureProject({ manifest: { workspaces: [] } });
  assert.throws(
    () =>
      auditWorkspaceContracts({
        projectRoot: fixture.root,
        manifestPath: fixture.manifestPath,
        expectedWorkspaceCount: 1,
      }),
    /W0C_MISSING_WORKSPACE/,
  );
});

test("rejects a declared graph count mismatch", () => {
  const fixture = fixtureProject({ manifest: { workspaces: [] } });
  assert.throws(
    () =>
      auditWorkspaceContracts({
        projectRoot: fixture.root,
        manifestPath: fixture.manifestPath,
        expectedWorkspaceCount: 2,
      }),
    /W0C_WORKSPACE_GRAPH_MISMATCH/,
  );
});

test("rejects the monorepo root as a workspace record", () => {
  const fixture = fixtureProject({ manifest: { workspaces: [{ path: ".", contracts: {} }] } });
  assert.throws(
    () =>
      auditWorkspaceContracts({
        projectRoot: fixture.root,
        manifestPath: fixture.manifestPath,
        expectedWorkspaceCount: 1,
      }),
    /W0C_ROOT_SCOPE_VIOLATION/,
  );
});

test("rejects a REAL validation contract that unconditionally exits successfully", () => {
  const fixture = fixtureProject({
    scripts: { typecheck: "exit 0" },
    manifest: {
      workspaces: [
        { path: "packages/source-package", contracts: { typecheck: { status: "REAL" } } },
      ],
    },
  });
  assert.throws(
    () =>
      auditWorkspaceContracts({
        projectRoot: fixture.root,
        manifestPath: fixture.manifestPath,
        expectedWorkspaceCount: 1,
      }),
    /W0C_FALSE_GREEN_CONTRACT/,
  );
});

test("records a dangling source path while retaining its owning workspace", () => {
  const fixture = fixtureProject({
    manifest: { workspaces: [{ path: "packages/source-package", contracts: {} }] },
  });
  fs.symlinkSync(
    path.join(fixture.root, "missing-internal"),
    path.join(fixture.root, "packages", "source-package", "internal"),
    "junction",
  );
  let error;
  try {
    auditWorkspaceContracts({
      projectRoot: fixture.root,
      manifestPath: fixture.manifestPath,
      expectedWorkspaceCount: 1,
    });
  } catch (caught) {
    error = caught;
  }
  assert.match(error.message, /W0C_DANGLING_SOURCE_PATH/);
  assert.equal(error.auditResult.workspaceCount, 1);
  assert.deepEqual(error.auditResult.workspacePaths, ["packages/source-package"]);
  assert.equal(error.auditResult.inventory[0].hasSource, true);
  assert.deepEqual(error.auditResult.findings, [
    {
      code: "W0C_DANGLING_SOURCE_PATH",
      workspacePath: "packages/source-package",
      path: "packages/source-package/internal",
      phase: "source-discovery",
    },
  ]);
});

test("requires the P0 typecheck hotspots to expose real compiler contracts", () => {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const inventory = generateWorkspaceInventory({ projectRoot, expectedWorkspaceCount: 141 });

  for (const workspacePath of ["apps/platform-api", "services/forge-api"]) {
    const workspace = inventory.workspaces.find((entry) => entry.path === workspacePath);
    assert.ok(workspace, `${workspacePath} must remain in the authoritative inventory`);
    assert.match(
      workspace.contracts.typecheck,
      /\btsc\b/,
      `${workspacePath} must invoke TypeScript`,
    );
    assert.equal(
      workspace.semanticCandidates.some((candidate) => candidate.contract === "typecheck"),
      false,
      `${workspacePath} must not expose a false-green typecheck candidate`,
    );
  }
});

test("requires every P0 test hotspot to stop tolerating zero discovered tests", () => {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const inventory = generateWorkspaceInventory({ projectRoot, expectedWorkspaceCount: 141 });
  const falseGreenTests = inventory.workspaces
    .filter((workspace) =>
      workspace.semanticCandidates.some((candidate) => candidate.contract === "test"),
    )
    .map((workspace) => workspace.path);

  assert.deepEqual(
    falseGreenTests,
    [],
    `false-green test contracts remain: ${falseGreenTests.join(", ")}`,
  );
});

test("preserves the completed P0 tranche without reintroducing false-green contracts", () => {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const manifestPath = path.join(projectRoot, "config", "workspace-validation-classification.json");
  const repairQueue = JSON.parse(
    fs.readFileSync(
      path.join(projectRoot, "artifacts", "w0.2", "workspace-validation-repair-queue.json"),
      "utf8",
    ),
  );
  let auditResult;
  try {
    auditWorkspaceContracts({ projectRoot, manifestPath, expectedWorkspaceCount: 141 });
  } catch (error) {
    auditResult = error.auditResult;
  }

  assert.ok(auditResult, "the intentionally non-green repository must expose its audit result");
  assert.equal(auditResult.classificationCounts["FALSE-GREEN"], 0);
  assert.equal(auditResult.classificationCounts["ABSENT-BY-DESIGN"], 2);
  assert.ok(auditResult.classificationCounts.BROKEN > 0);
  assert.equal(
    auditResult.findings.filter((finding) => finding.code === "W0C_CLASSIFIED_DEFECT").length,
    auditResult.classificationCounts.BROKEN,
  );
  assert.deepEqual(
    repairQueue.groups.filter((group) => group.priority === "P0"),
    [],
  );
  assert.equal(
    repairQueue.groups.reduce((total, group) => total + group.workspaces.length, 0),
    auditResult.classificationCounts.BROKEN,
  );
});

test("requires every queued P1A workspace to expose an effective package-local typecheck", () => {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const baseline = JSON.parse(
    fs.readFileSync(
      path.join(projectRoot, "artifacts", "w0.2", "p1a-typecheck-baseline.json"),
      "utf8",
    ),
  );
  const expectedPaths = baseline.groups.flatMap((group) => group.workspaces);
  const inventory = generateWorkspaceInventory({ projectRoot, expectedWorkspaceCount: 141 });
  const inventoryByPath = new Map(
    inventory.workspaces.map((workspace) => [workspace.path, workspace]),
  );
  const violations = [];

  assert.equal(
    new Set(expectedPaths).size,
    expectedPaths.length,
    "P1A baseline paths must be unique",
  );
  assert.equal(
    expectedPaths.length,
    55,
    "P1A baseline must retain the reviewed 55-workspace scope",
  );

  for (const workspacePath of expectedPaths) {
    const workspace = inventoryByPath.get(workspacePath);
    if (!workspace) {
      violations.push(`${workspacePath}: missing from authoritative inventory`);
      continue;
    }

    const command = workspace.contracts.typecheck;
    if (
      typeof command !== "string" ||
      !/\btsc\b/.test(command) ||
      !/(?:^|\s)(?:-p|--project)(?:\s|=)/.test(command) ||
      !/(?:^|\s)--noEmit(?:\s|$)/.test(command)
    ) {
      violations.push(`${workspacePath}: missing canonical tsc project/noEmit command`);
      continue;
    }

    const projectMatch = command.match(/(?:^|\s)(?:-p|--project)(?:\s+|=)([^\s]+)/);
    const configPath = path.resolve(projectRoot, workspacePath, projectMatch[1]);
    const workspaceRoot = path.resolve(projectRoot, workspacePath);
    if (!configPath.startsWith(`${workspaceRoot}${path.sep}`) || !fs.existsSync(configPath)) {
      violations.push(`${workspacePath}: typecheck config is not package-local or does not exist`);
      continue;
    }

    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    if (config.error) {
      violations.push(`${workspacePath}: TypeScript cannot parse ${path.basename(configPath)}`);
      continue;
    }
    const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
    const productionFiles = parsed.fileNames.filter((file) => {
      const relative = path.relative(workspaceRoot, file);
      return (
        relative &&
        !relative.startsWith("..") &&
        !/[\\/](?:test|tests|__tests__)[\\/]/.test(relative) &&
        !/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(relative)
      );
    });
    if (productionFiles.length === 0) {
      violations.push(`${workspacePath}: effective config includes no production source`);
    }
    if (workspace.semanticCandidates.some((candidate) => candidate.contract === "typecheck")) {
      violations.push(`${workspacePath}: typecheck remains a semantic false-green candidate`);
    }
  }

  assert.deepEqual(violations, []);
});

test("P1A package-local configs do not introduce compiler weakening", () => {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const baseline = JSON.parse(
    fs.readFileSync(
      path.join(projectRoot, "artifacts", "w0.2", "p1a-typecheck-baseline.json"),
      "utf8",
    ),
  );
  const newConfigWorkspaces = baseline.groups.find(
    (group) => group.id === "typecheck:missing-config-and-script",
  )?.workspaces;
  const violations = [];

  assert.equal(newConfigWorkspaces?.length, 48);

  for (const workspacePath of newConfigWorkspaces) {
    const configPath = path.join(projectRoot, workspacePath, "tsconfig.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const options = config.compilerOptions ?? {};

    if (options.skipLibCheck === true) {
      violations.push(`${workspacePath}: local skipLibCheck=true`);
    }
    if (options.strict === false) {
      violations.push(`${workspacePath}: local strict=false`);
    }
    if (options.noEmitOnError === false) {
      violations.push(`${workspacePath}: local noEmitOnError=false`);
    }
  }

  assert.deepEqual(violations, []);
});

test("a repaired P1A package typecheck fails on a semantic TypeScript error", () => {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const workspacePath = "packages/architecture-core";
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectRoot, workspacePath, "package.json"), "utf8"),
  );
  const negativeSource = path.join(
    projectRoot,
    workspacePath,
    "src",
    "__w0_2_negative_typecheck__.ts",
  );

  assert.equal(packageJson.scripts.typecheck, "tsc -p tsconfig.json --noEmit");
  assert.equal(fs.existsSync(negativeSource), false, "negative fixture must not overwrite source");

  let result;
  try {
    fs.writeFileSync(negativeSource, "export const deliberatelyInvalid: string = 42;\n", "utf8");
    result = spawnSync(
      process.platform === "win32" ? "pnpm.cmd" : "pnpm",
      ["--filter", packageJson.name, "run", "typecheck"],
      {
        cwd: projectRoot,
        encoding: "utf8",
        env: { ...process.env, NO_COLOR: "1" },
        shell: process.platform === "win32",
        windowsHide: true,
      },
    );
  } finally {
    fs.rmSync(negativeSource, { force: true });
  }

  assert.notEqual(result.status, 0, "the declared package typecheck must reject invalid source");
  assert.match(`${result.stdout}\n${result.stderr}`, /TS2322/);
});

test("records the completed P1A tranche and preserves reviewed build decisions", () => {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const manifestPath = path.join(projectRoot, "config", "workspace-validation-classification.json");
  const repairQueue = JSON.parse(
    fs.readFileSync(
      path.join(projectRoot, "artifacts", "w0.2", "workspace-validation-repair-queue.json"),
      "utf8",
    ),
  );
  let auditResult;
  try {
    auditWorkspaceContracts({ projectRoot, manifestPath, expectedWorkspaceCount: 141 });
  } catch (error) {
    auditResult = error.auditResult;
  }

  assert.ok(auditResult, "the real repository audit must remain intentionally non-green");
  assert.equal(auditResult.classificationCounts["FALSE-GREEN"], 0);
  assert.equal(auditResult.classificationCounts["ABSENT-BY-DESIGN"], 2);
  assert.equal(auditResult.classificationCounts.BROKEN, 274);
  assert.equal(
    auditResult.findings.filter((finding) => finding.code === "W0C_CLASSIFIED_DEFECT").length,
    274,
  );
  assert.deepEqual(
    repairQueue.groups.filter((group) => group.id.startsWith("typecheck:")),
    [],
  );
  assert.equal(
    repairQueue.groups.reduce((total, group) => total + group.workspaces.length, 0),
    274,
  );
  assert.equal(
    repairQueue.groups.find((group) => group.id === "build:rejected-exception")?.workspaces.length,
    68,
  );
});

test("the P1A artifact updater is idempotent after the tranche is applied", () => {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const generatedArtifacts = [
    "artifacts/w0.2/workspace-validation-findings.json",
    "artifacts/w0.2/workspace-validation-inventory.json",
    "artifacts/w0.2/workspace-validation-repair-queue.json",
    "artifacts/w0.2/workspace-validation-triage.json",
    "config/workspace-validation-classification.json",
  ];
  const result = spawnSync(process.execPath, ["scripts/update-task3-p1a-artifacts.mjs"], {
    cwd: projectRoot,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
    windowsHide: true,
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /"repairSurface": 274/);

  const prettier = spawnSync(
    path.join(
      projectRoot,
      "node_modules",
      ".bin",
      process.platform === "win32" ? "prettier.cmd" : "prettier",
    ),
    ["--check", ...generatedArtifacts],
    {
      cwd: projectRoot,
      encoding: "utf8",
      shell: process.platform === "win32",
      windowsHide: true,
    },
  );
  assert.equal(prettier.status, 0, `${prettier.stdout}\n${prettier.stderr}`);
});
