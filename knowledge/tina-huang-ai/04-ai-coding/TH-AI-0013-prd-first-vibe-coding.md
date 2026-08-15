# TH-AI-0013 — PRD-First Vibe Coding (AI-Assisted Development)

**Knowledge Object ID:** TH-AI-0013  
**Classification:** C (AI Coding)  
**Priority:** P0  
**Status:** VERIFIED  
**Evidence Grade:** C (Official tooling documentation + practitioner validation)  
**Source Videos:** VID-006, VID-007  
**First Extracted:** 2026-08-14  
**Last Verified:** 2026-08-14

---

## Core Concept

**"Vibe Coding"** refers to AI-assisted development where developers describe intent in natural language and AI generates code. The Cerebro Nexarch standard for this is **PRD-First Vibe Coding** — a disciplined methodology that prevents the most common failure modes of unstructured AI code generation.

> "Vibe coding without a PRD is like building a house by telling a contractor how the rooms should feel." — Tina Huang AI

---

## The PRD-First Development Lifecycle

```
PHASE 1: PRD CREATION (Human-led)
├── Feature list
├── User flows (with wireframes if visual)
├── Technical specification
│   ├── Framework and libraries
│   ├── Database schema
│   └── API contracts
├── Security requirements
└── Testing requirements
          ↓
PHASE 2: SYSTEM PROMPT SETUP (Human-led)
├── Framework specification (TypeScript, Next.js, Prisma, etc.)
├── Coding standards specification
├── Naming conventions
└── Security constraints (no API keys, no `any` types)
          ↓
PHASE 3: GIT CHECKPOINT (Before each generation step)
├── git add -A
├── git commit -m "pre-ai-generation: {feature}"
└── [recovery point established]
          ↓
PHASE 4: AI CODE GENERATION (AI-led, human-supervised)
├── Generate feature from PRD section
├── Review generated code
├── Git checkpoint again
└── Proceed to next feature
          ↓
PHASE 5: MVP COMPLETION
          ↓
PHASE 6: DEBUG LOOP
├── Identify issue
├── Provide exact error + context to AI
├── Apply fix
├── Test
└── [repeat until resolved]
          ↓
PHASE 7: SECURITY REVIEW GATE
├── Static analysis (Semgrep)
├── Manual security review
└── [MUST pass before PR merge — BP-CODING-0004]
```

---

## Minimum PRD Contents (BP-CODING-0001)

```markdown
# Product Requirements Document: {Feature Name}

## 1. Feature List
- {Feature 1}
- {Feature 2}

## 2. User Flows
1. User opens {screen}
2. User clicks {element}
3. System responds with {behavior}

## 3. Technical Specification
### Framework: {e.g., Next.js 14, TypeScript strict, Prisma ORM}
### Libraries: {list exact npm package names}
### Database Schema:
```sql
CREATE TABLE {table_name} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);
```
### API Contracts:
```typescript
interface {EndpointRequest} { ... }
interface {EndpointResponse} { ... }
```

## 4. Security Requirements
- Authentication: {method}
- Authorization: {RBAC / policy}
- Data validation: {approach}

## 5. Testing Requirements
- Unit tests: {coverage target}
- Integration tests: {what to test}
- E2E tests: {critical paths}
```

---

## Coding Standards System Prompt

Add to every Cerebro Nexarch AI coding session (see BP-CODING-0005):

```
You are a Cerebro Nexarch coding assistant. All code you generate MUST:
- Use TypeScript (strict mode enabled)
- Follow the repository naming conventions in {link-to-CODEBASE.md}
- Implement proper error handling with typed errors
- Include JSDoc comments on all public functions
- NEVER include API keys, secrets, or hardcoded credentials
- MUST NOT use `any` types
- Use existing patterns from the codebase (read relevant files first)
- Prisma for all database operations
- Zod for input validation
```

---

## Tool Stack (Current Cerebro Standard — TRIAL Status)

| Tool | Role | Radar Status |
|---|---|---|
| Cursor | Primary AI coding IDE | TRIAL |
| Claude (claude-sonnet-4-6) | Primary coding model | ADOPT |
| GitHub Copilot | Secondary autocomplete | WATCH |
| Semgrep | Security static analysis | ADOPT |
| Lovable | No-code rapid prototyping | TRIAL |

---

## When to Use Lovable vs Cursor

**Use Lovable when:**
- Rapid prototyping a UI before committing to production architecture
- Non-technical stakeholders need to visualize the product
- The output is a PROTOTYPE, not production code

**Use Cursor when:**
- Production code development
- Following Cerebro Nexarch coding standards
- Integration with existing codebase

**CRITICAL:** Lovable output is PROTOTYPE maturity at most. It MUST NOT be promoted to production without security review and Cerebro standards alignment. See BP-PROD-0001.

---

## Debug Loop Protocol

When AI-generated code fails:

```
1. Copy exact error message (not a paraphrase — exact text)
2. Copy the relevant code block
3. Describe what you expected vs what happened
4. Provide to AI: "I got this error: {exact error}
   In this code: {code block}
   Expected: {expected behavior}
   Actual: {actual behavior}
   Fix this."
5. Review fix before applying
6. If AI cannot fix in 3 attempts: escalate to human debugging
```

---

## Security Review Checklist (Before PR Merge)

```
□ No API keys or secrets hardcoded
□ All user inputs validated (Zod schemas)
□ Authentication checks on all protected routes
□ Authorization checks (user can only access their data)
□ No SQL injection vectors (Prisma parameterized queries — verify)
□ No path traversal vulnerabilities
□ Semgrep scan: 0 critical findings
□ Dependencies: no known CVEs (npm audit)
```

---

## Cerebro Nexarch Application

This methodology applies to:
- HiveForge development workflow
- CerebroAgent feature development
- All CerebroApp development sprints
- Cerebro team AI-assisted development standard

**Implementation:** IMP-005 (Establish AI-Assisted Development Workflow)

---

## Related Knowledge Objects

- TH-AI-0014 (System Prompt Standards for Coding)

## Related Patterns

- WORKFLOW-PATTERN-0002 (PRD-First AI Development Lifecycle)

## Related Best Practices

- BP-CODING-0001 (PRD Before Code Generation — P0)
- BP-CODING-0002 (Framework Specification in Code Prompts)
- BP-CODING-0003 (Git Checkpoint Before Each Generation — P0)
- BP-CODING-0004 (Security Review Gate — P0)
- BP-CODING-0005 (System Prompt for Standards Enforcement)
