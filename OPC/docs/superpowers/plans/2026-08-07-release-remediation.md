# Release Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore a releasable build without changing archive API contracts or upload behavior.

**Architecture:** Keep the uploader interactive by making its component a client component. Construct third-party SDK options with optional properties omitted when absent, and pass commands through the exact client type required by the AWS presigner. Correct the local lint target and remove only whitespace defects from the release diff.

**Tech Stack:** Next.js 16, React, TypeScript, Fastify, AWS SDK v3, Qdrant client, ESLint 9, pnpm.

## Global Constraints

- Preserve existing API routes, request/response schemas, storage keys, and environment variable names.
- Keep every remediation commit under 100 changed paths.
- Verify a failing check before each behavioral fix and rerun the affected gate after it.

---

### Task 1: Repair portal compilation and lint targeting

**Files:**
- Modify: `cerebro-hive-website/apps/archive-portal/components/Uploader.tsx:1`
- Modify: `cerebro-hive-website/apps/archive-portal/package.json:9`

- [ ] Add `'use client';` as the first statement of `Uploader.tsx` so React state is evaluated in a client component.
- [ ] Change the lint script to `eslint app components` so ESLint receives real source paths.
- [ ] Run `pnpm --dir cerebro-hive-website/apps/archive-portal build` and `pnpm --dir cerebro-hive-website/apps/archive-portal lint`.

### Task 2: Repair archive API SDK type boundaries

**Files:**
- Modify: `cerebro-hive-website/services/archive-api/src/services/qdrant.service.ts:11-14`
- Modify: `cerebro-hive-website/services/archive-api/src/services/storage.service.ts:1-41`

- [ ] Construct Qdrant options with `apiKey` only when `QDRANT_API_KEY` is defined.
- [ ] Use the AWS SDK type accepted by `getSignedUrl` for the cached S3 client.
- [ ] Run `pnpm --dir cerebro-hive-website/services/archive-api test` and `pnpm --dir cerebro-hive-website/services/archive-api build`.

### Task 3: Repair release hygiene and verify promotion readiness

**Files:**
- Modify only paths reported by `git diff --check origin/main...HEAD`.
- Modify: `cerebro-hive-website/pnpm-lock.yaml`

- [ ] Remove trailing whitespace and the reported extra EOF blank lines only.
- [ ] Retain the lockfile resolution generated from the existing package manifest.
- [ ] Run `git diff --check origin/main...HEAD`, targeted builds, and the repository CI workflow before promotion.
