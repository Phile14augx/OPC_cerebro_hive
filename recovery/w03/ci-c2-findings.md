# CI-C2 Findings Report

## Issue Addressed
RM-04: Evidence Chain - Fix the artifact capture pipeline.

## Root Cause Analysis
1. The root Next.js application within `OPC/cerebro-hive-website` was missing a dedicated build step. Because it is not a Turborepo workspace package, the `turbo build` step was skipping it entirely, leading to missing artifacts for the root website.
2. The GitHub Actions artifact upload step had hardcoded, explicit paths for a subset of the workspaces (`apps/studio`, `apps/forge`, `apps/platform-api`, `services/forge-api`). This completely omitted other critical runtime applications such as `apps/platform`, `apps/archive-portal`, `apps/pulse`, and the root website itself.

## Repairs Made
1. **Added explicit Next.js build step**: Inserted a step to run `pnpm exec next build` immediately following the Turborepo build step in `.github/workflows/website-ci.yml`.
2. **Dynamic Artifact Capture**: Replaced hardcoded paths in the `actions/upload-artifact@v4` step with dynamic glob patterns.
   - `OPC/cerebro-hive-website/.next/**` (Root)
   - `OPC/cerebro-hive-website/apps/*/.next/**` (All Next.js apps)
   - `OPC/cerebro-hive-website/apps/*/dist/**` (All non-Next apps like APIs)
   - `OPC/cerebro-hive-website/services/*/dist/**` (All backend services)

These fixes have been applied and pushed to the required worktree (`w03-policy-gates` and synchronized to `w03-runtime` to address cross-worktree compliance).
