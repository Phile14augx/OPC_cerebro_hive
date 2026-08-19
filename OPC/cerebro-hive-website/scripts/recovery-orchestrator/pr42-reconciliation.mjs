export const PR42_EXPECTED_MERGE_BASE = "e5d449ed4ff569a3e402e3c97e28fe217f3126ae";
export const PR42_PRESERVED_COMMIT = "46c9f2fec8ee904c73356979a5f48380c2e871e0";
export const PR42_PRESERVED_PARENT = "d9defca5c65abbaf3110848f84ad189861777a0a";

export const PR42_KNOWN_PRESERVED_PATHS = [
  ".github/actions/website-pnpm-setup/action.yml",
  ".github/workflows/website-ci.yml",
  "OPC/cerebro-hive-website/packages/ai/.eslintrc.json",
  "OPC/cerebro-hive-website/packages/archive-contracts/.eslintrc.json",
  "OPC/cerebro-hive-website/packages/policy/.eslintrc.json",
  "OPC/cerebro-hive-website/packages/ui/.eslintrc.json",
  "OPC/cerebro-hive-website/packages/workflow/.eslintrc.json",
  "OPC/cerebro-hive-website/services/archive-api/.eslintrc.json",
  "OPC/cerebro-hive-website/services/contentops/.eslintrc.json"
].sort();

export const PR42_POLICY = {
  KEEP_MAIN: [
    "OPC/cerebro-hive-website/packages/config-core/src/index.ts",
    "OPC/cerebro-hive-website/packages/kernel-core/src/index.ts",
    "OPC/cerebro-hive-website/packages/identity-core/tsconfig.json",
    "OPC/cerebro-hive-website/packages/kernel-core/tsconfig.json",
    "OPC/cerebro-hive-website/packages/runtime-core/tsconfig.json",
    "OPC/cerebro-hive-website/apps/platform-api/package.json",
    "OPC/cerebro-hive-website/packages/telemetry-core/package.json",
    "OPC/cerebro-hive-website/services/archive-worker/package.json",
    "OPC/cerebro-hive-website/scripts/audit-workspace-contracts.mjs"
  ],
  VERIFY_BEFORE_RECOVERY: [
    "OPC/cerebro-hive-website/packages/db/package.json"
  ],
  REGENERATE: [
    "OPC/cerebro-hive-website/pnpm-lock.yaml"
  ],
  RECOVERY_CANDIDATE: {
    lintCohort: {
      status: "VERIFY_BEFORE_IMPLEMENTATION",
      description: "PR42 lint configuration cohort — per-package .eslintrc.json files introduced by the preserved commit",
      paths: [
        "OPC/cerebro-hive-website/packages/ai/.eslintrc.json",
        "OPC/cerebro-hive-website/packages/archive-contracts/.eslintrc.json",
        "OPC/cerebro-hive-website/packages/policy/.eslintrc.json",
        "OPC/cerebro-hive-website/packages/ui/.eslintrc.json",
        "OPC/cerebro-hive-website/packages/workflow/.eslintrc.json",
        "OPC/cerebro-hive-website/services/archive-api/.eslintrc.json",
        "OPC/cerebro-hive-website/services/contentops/.eslintrc.json",
        "OPC/cerebro-hive-website/scripts/eslint-eslintrc.cjs"
      ]
    },
    ci: {
      status: "VERIFY_BEFORE_IMPLEMENTATION",
      description: "Root Website CI workflow and associated composite actions",
      paths: [
        ".github/workflows/website-ci.yml",
        ".github/actions/website-pnpm-setup/action.yml"
      ]
    },
    tests: {
      status: "VERIFY_BEFORE_IMPLEMENTATION",
      description: "Test wiring candidates — identity-core Tenancy test, auth, ai-gateway, Studio existing-test, and UI existing-test",
      paths: [
        "OPC/cerebro-hive-website/packages/identity-core/src/__tests__/tenancy.test.ts",
        "OPC/cerebro-hive-website/packages/auth/src/__tests__/auth.test.ts",
        "OPC/cerebro-hive-website/services/ai-gateway/src/__tests__/ai-gateway.test.ts",
        "OPC/cerebro-hive-website/apps/studio/src/__tests__/studio.test.ts",
        "OPC/cerebro-hive-website/packages/ui/src/__tests__/ui.test.ts"
      ]
    }
  }
};

export function buildPr42ReconciliationCommands(mainSha, pr42Sha) {
  if (!mainSha || !pr42Sha) return [];
  return [
    { exe: "git", args: ["cat-file", "-e", `${mainSha}^{commit}`] },
    { exe: "git", args: ["cat-file", "-e", `${pr42Sha}^{commit}`] },
    { exe: "git", args: ["cat-file", "-e", `${PR42_PRESERVED_COMMIT}^{commit}`] },
    { exe: "git", args: ["merge-base", mainSha, pr42Sha] },
    { exe: "git", args: ["rev-list", "--left-right", "--count", `${mainSha}...${pr42Sha}`] },
    { exe: "git", args: ["diff", "--name-only", "--no-renames", PR42_EXPECTED_MERGE_BASE, mainSha] },
    { exe: "git", args: ["diff", "--name-only", "--no-renames", PR42_EXPECTED_MERGE_BASE, pr42Sha] },
    { exe: "git", args: ["rev-parse", `${PR42_PRESERVED_COMMIT}^`] },
    { exe: "git", args: ["diff", "--name-only", "--no-renames", PR42_PRESERVED_PARENT, PR42_PRESERVED_COMMIT] },
    { exe: "git", args: ["diff", "--name-only", "--no-renames", pr42Sha, PR42_PRESERVED_COMMIT, "--", ...PR42_KNOWN_PRESERVED_PATHS] }
  ];
}

export function derivePr42Reconciliation(entries) {
  if (!entries || entries.length < 10 || entries.some(e => !e)) return null;

  const [
    catMain, catPr42, catPreserved,
    mergeBaseCmd, revListCmd,
    diffMainCmd, diffPr42Cmd,
    revParsePreservedCmd, diffPreservedCmd, diffPr42PreservedCmd
  ] = entries;

  const mergeBase = String(mergeBaseCmd.stdout).trim();
  const revListMatch = String(revListCmd.stdout).trim().split(/\s+/);
  const baseOnlyCommitCount = parseInt(revListMatch[0] ?? "0", 10);
  const pr42OnlyCommitCount = parseInt(revListMatch[1] ?? "0", 10);

  const mainOwnedPaths = String(diffMainCmd.stdout).split(/\r?\n/).filter(Boolean).sort();
  const pr42OwnedPaths = String(diffPr42Cmd.stdout).split(/\r?\n/).filter(Boolean).sort();

  const mainSet = new Set(mainOwnedPaths);
  const pr42Set = new Set(pr42OwnedPaths);

  const overlapPaths = mainOwnedPaths.filter(p => pr42Set.has(p)).sort();
  const pr42OnlyPaths = pr42OwnedPaths.filter(p => !mainSet.has(p)).sort();
  const mainOnlyPaths = mainOwnedPaths.filter(p => !pr42Set.has(p)).sort();

  const preservedChangedPaths = String(diffPreservedCmd.stdout).split(/\r?\n/).filter(Boolean).sort();
  const preservedSet = new Set(preservedChangedPaths);
  const uniquePreservedPaths = preservedChangedPaths.filter(p => !pr42Set.has(p)).sort();

  const pr42VsPreservedDiff = String(diffPr42PreservedCmd.stdout).split(/\r?\n/).filter(Boolean);
  const preservedEquivalentToPr42 = pr42VsPreservedDiff.length === 0;

  const preservedParent = String(revParsePreservedCmd.stdout).trim();
  const validPreservedParent = preservedParent === PR42_PRESERVED_PARENT;

  const validMergeBase = mergeBase === PR42_EXPECTED_MERGE_BASE;
  const validBaseCount = baseOnlyCommitCount === 5;
  const validPr42Count = pr42OnlyCommitCount === 28;
  const validMainPaths = mainOwnedPaths.length === 203;
  const validPr42Paths = pr42OwnedPaths.length === 84;
  const validOverlap = overlapPaths.length === 43;
  const validPr42Only = pr42OnlyPaths.length === 41;
  const validMainOnly = mainOnlyPaths.length === 160;

  const validPreservedPaths = preservedChangedPaths.length === PR42_KNOWN_PRESERVED_PATHS.length
    && preservedChangedPaths.every((p, i) => p === PR42_KNOWN_PRESERVED_PATHS[i]);

  const validUniquePreserved = uniquePreservedPaths.length === 0;

  let note = "";
  if (!validMergeBase) note = "wrong merge base";
  else if (!validBaseCount || !validPr42Count) note = "wrong topology counts";
  else if (!validMainPaths || !validPr42Paths || !validOverlap || !validPr42Only || !validMainOnly) note = "wrong paths counts";
  else if (!validPreservedParent) note = "wrong preserved parent";
  else if (!validPreservedPaths) note = "missing preserved path";
  else if (!validUniquePreserved) note = "unique preserved work";
  else if (!preservedEquivalentToPr42) note = "non-empty PR42/preserved diff";

  const valid =
    validMergeBase &&
    validBaseCount &&
    validPr42Count &&
    validMainPaths &&
    validPr42Paths &&
    validOverlap &&
    validPr42Only &&
    validMainOnly &&
    validPreservedParent &&
    validPreservedPaths &&
    validUniquePreserved &&
    preservedEquivalentToPr42;

  return {
    mergeBase,
    baseOnlyCommitCount,
    pr42OnlyCommitCount,
    mainOwnedPaths,
    pr42OwnedPaths,
    overlapPaths,
    pr42OnlyPaths,
    mainOnlyPaths,
    preservedChangedPaths,
    uniquePreservedPaths,
    preservedParent,
    validPreservedParent,
    preservedEquivalentToPr42,
    valid,
    note
  };
}
