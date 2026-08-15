# Product Specification: CerebroLearn™

**Status:** Canonical Version 1.0 — documents a real, live product. CerebroLearn is in **Early Access** today per `docs/products.md`; this spec's status describes the document's own review level, not a claim that every capability below is GA.
**Governing Document:** `PRODUCT_REGISTRY.md` · `docs/products.md` (source of truth for current features, pricing, and status — this spec elaborates it, does not supersede it)
**Phase:** 1 — Real, Sellable Product (see `docs/architecture/SPECIFICATION-GOVERNANCE-FINDING.md` §5: this spec exists specifically to close the gap identified there — CerebroLearn is one of the 5 real products in `docs/products.md` that had no canonical spec)

## 1. Product Overview

**CerebroLearn™** is CerebroHive's AI-native learning management system — an LMS with adaptive content pacing, cohort analytics, and digital certification issuance, purpose-built for enterprise AI upskilling rather than adapted from a general-purpose LMS.

* **Product Family**: Cerebro Applications
* **Category**: AI Productivity — Enterprise Learning
* **Status**: Early Access (per `docs/products.md`)
* **Personas**: HR/L&D administrators (cohort management, billing), Instructors (course authoring, live sessions), Learners (course consumption, certification)

---

## 2. Core Workflows & User Journeys

### 2.1 Cohort Onboarding
- **The Journey**: An L&D administrator rolls out an AI upskilling program to a department.
- **Workflow**:
  1. Admin creates a cohort in the Admin Dashboard and bulk-imports employees via CSV.
  2. Admin assigns a course (e.g., "Introduction to AI & Prompt Engineering") and sets a completion deadline.
  3. Employees receive access to the Learner Portal; the system begins adaptive content sequencing based on each learner's initial assessment performance.
  4. Admin monitors cohort progress, scores, and drop-off points via Live Cohort Analytics.

### 2.2 Adaptive Course Consumption
- **The Journey**: A learner works through a course at their own pace.
- **Workflow**:
  1. Learner starts a course; the platform's adaptive sequencing engine adjusts module order based on demonstrated performance (e.g., skips redundant foundational content for learners who test out of it).
  2. Learner completes embedded quizzes within the markdown-based course content.
  3. On successful completion, the platform issues a proctored e-certification, syncs a badge to the learner's LinkedIn profile, and generates a downloadable PDF certificate.

### 2.3 Instructor-Led Workshop
- **The Journey**: An instructor runs a live cohort session.
- **Workflow**:
  1. Instructor uses Workshop Mode to schedule a live session tied to a cohort.
  2. Instructor runs the session with breakout groups via the Instructor Console.
  3. Attendance and engagement feed back into the cohort's analytics.

---

## 3. High-Level Architecture

Per `docs/products.md`'s documented platform structure:

```
CerebroLearn
├── Learner Portal       — My courses, progress, certificates
├── Instructor Console   — Course builder, live session controls
├── Admin Dashboard      — Seat management, cohort analytics, billing
└── API                  — Embed in existing LMS or HR system
```

* **Frontend**: Next.js web application, three role-scoped surfaces (Learner Portal, Instructor Console, Admin Dashboard) over one shared backend.
* **Content authoring**: markdown-based course builder with embedded quizzes and video — no proprietary authoring format lock-in.
* **Backend**: REST API surface for programmatic access, enabling embedding inside a customer's existing LMS or HR system rather than requiring CerebroLearn to be the sole system of record.

---

## 4. Key Entities (Prisma Schema Impact)

* `Course`: A published, versioned learning unit.
  * `id`, `title`, `modules` (ordered, markdown content + embedded quizzes), `certificationId?`
* `Cohort`: A group of learners assigned to one or more courses together.
  * `id`, `organizationId`, `name`, `memberIds[]`, `courseAssignments[]`, `deadline?`
* `LearnerProgress`: Per-learner, per-course adaptive state.
  * `id`, `learnerId`, `courseId`, `currentModuleId`, `assessmentScores[]`, `completionStatus`
* `Certification`: An issued credential.
  * `id`, `learnerId`, `courseId`, `issuedAt`, `linkedinBadgeSyncedAt?`, `pdfUrl`
* `CohortAnalyticsSnapshot`: Periodic rollup consumed by the Admin Dashboard.
  * `id`, `cohortId`, `capturedAt`, `avgProgress`, `completionRate`, `dropOffPoints[]`

---

## 5. Integrations & Dependencies

* **Upstream (Depends on)**:
  * `HiveIdentity` (or interim auth, if HiveIdentity is not yet the platform's real IAM — see `HIVE_PLATFORM_MASTERPLAN.md`'s open scope question; this dependency should be re-confirmed against whatever CerebroLearn actually authenticates against today, not assumed): for SSO.
* **Downstream**: none documented today — CerebroLearn is a leaf product in the current real portfolio.
* **External Integrations** (per `docs/products.md`):
  * HR Systems: Workday, BambooHR, SAP SuccessFactors (webhook/API)
  * SSO: SAML 2.0, Google Workspace, Microsoft Entra
  * LinkedIn: Certificate badge push via LinkedIn Learning API

---

## 6. Security & Governance Constraints

* **Proctoring integrity**: certification exams must be tamper-evident — the "proctored e-certification" claim in `docs/products.md` implies some proctoring mechanism exists or is planned; this spec does not assume a specific vendor/method and flags it as needing confirmation against actual implementation before being described further externally.
* **HR data handling**: integrations with Workday/BambooHR/SAP SuccessFactors involve employee PII (names, emails, org structure); access scoping and data retention policy for synced HR data is not detailed in `docs/products.md` and should be confirmed, not assumed, before this spec is extended further.
* **Bulk import safety**: CSV bulk import of cohort members is a common source of accidental over-provisioning (wrong list, wrong department) — should require an admin confirmation step showing exact row count/diff before committing.

---

## Open items (not resolved by this spec)

- This document was written by extending `docs/products.md`'s existing CerebroLearn entry with standard spec sections (architecture, data model, security constraints) that entry doesn't itself cover. Everything in §1–2 and the "External Integrations" list in §5 is transcribed from `docs/products.md` directly. Everything else (§3's architecture framing, §4's schema, §6's constraints) is a reasonable specification *inference* from that real feature set, not verified against actual running code — flagged per `docs/architecture/SPECIFICATION-GOVERNANCE-FINDING.md`'s recommendation to be explicit about this distinction rather than presenting inferred detail with the same confidence as documented fact.
- Proctoring mechanism, HR-data retention policy, and actual current auth provider (§6, §5) are the concrete items needing confirmation before this spec should be treated as fully authoritative.
