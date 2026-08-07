"""Technical Writer agent skills — API docs, architecture guides, ADRs, and runbooks."""
from __future__ import annotations
import json
from typing import Any, Optional
from pydantic import BaseModel, Field

try:
    from crewai.tools import BaseTool
except ImportError:
    class BaseTool:
        name: str = ""
        description: str = ""
        def run(self, **kwargs: Any) -> str: return self._run(**kwargs)
        def _run(self, **kwargs: Any) -> str: raise NotImplementedError

class DocInput(BaseModel):
    subject: str = Field(..., description="Subject of the documentation.")
    doc_type: str = Field(default="guide", description="Type: readme|guide|api|runbook|adr|tutorial.")
    audience: str = Field(default="developer", description="Audience: developer|operator|executive.")

class APIDocInput(BaseModel):
    service: str = Field(..., description="Service to document.")
    endpoints: str = Field(..., description="Comma-separated endpoint paths.")
    version: str = Field(default="v1", description="API version.")

class ADRInput(BaseModel):
    decision_title: str = Field(..., description="Title of the architectural decision.")
    context: str = Field(..., description="Problem context and forces.")
    decision: str = Field(..., description="The architectural decision made.")
    status: str = Field(default="Accepted", description="Status: Proposed|Accepted|Deprecated|Superseded.")


class TechnicalWritingSkill(BaseTool):
    name: str = "technical_writing"
    description: str = "Write clear, accurate technical documentation following CerebroHive style guide."
    def _run(self, subject: str, doc_type: str = "guide", audience: str = "developer") -> str:
        return json.dumps({
            "style_guide": {
                "voice": "Active voice — 'The agent sends' not 'A message is sent'",
                "tense": "Present for current behavior, future for planned",
                "person": "Second person for instructions — 'Run the following command'",
                "headers": "Sentence case — 'Getting started' not 'Getting Started'",
                "avoid": ["simple/easy/just — implies user failure if it's not", "passive voice", "undefined jargon"],
            },
            "template": f"""---
title: {subject}
description: One-sentence description for search and link preview
sidebar_position: 1
---

# {subject}

Brief paragraph explaining what this is and who should read it.

## Prerequisites

List what the reader needs before starting.

## [Main section]

Content here. Use code blocks with language tags.

```typescript
// Runnable example
```

## Next steps

Links to related documentation.
""",
            "audience_level": audience,
        }, indent=2)

class APIDocumentationSkill(BaseTool):
    name: str = "api_documentation"
    description: str = "Write OpenAPI 3.1 API documentation with examples, schemas, and error responses."
    def _run(self, service: str, endpoints: str, version: str = "v1") -> str:
        endpoint_list = [e.strip() for e in endpoints.split(",")]
        return json.dumps({
            "openapi_spec": f"""
openapi: '3.1.0'
info:
  title: {service.title()} API
  version: 1.0.0
  description: |
    The {service.title()} API provides [brief description].

    ## Authentication
    All endpoints require a valid JWT in the `Authorization: Bearer <token>` header.

    ## Rate Limiting
    Requests are limited to 100/min per API key. See `X-RateLimit-*` response headers.

    ## Error Format
    All errors follow RFC 9457 ProblemDetail.

servers:
  - url: https://api.cerebrohive.com/{version}
    description: Production

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
""",
            "endpoints_to_document": endpoint_list,
            "example_endpoint": f"""
/{endpoint_list[0].lstrip('/')}:
  get:
    summary: [One line description]
    description: |
      Longer description of what this endpoint does.
    parameters:
      - name: limit
        in: query
        schema: {{ type: integer, default: 20, maximum: 100 }}
    responses:
      '200':
        description: Success
        content:
          application/json:
            schema: {{ $ref: '#/components/schemas/ListResponse' }}
            example:
              data: []
              nextCursor: null
      '401':
        $ref: '#/components/responses/Unauthorized'
      '429':
        $ref: '#/components/responses/RateLimited'
""",
        }, indent=2)

class ADRSkill(BaseTool):
    name: str = "architecture_decision_records"
    description: str = "Write Architecture Decision Records (ADRs) capturing context, decision, and consequences."
    def _run(self, decision_title: str, context: str, decision: str, status: str = "Accepted") -> str:
        from datetime import date
        adr_id = decision_title.lower().replace(" ", "-").replace("/", "-")
        return json.dumps({
            "path": f"docs/adr/ADR-{date.today().year}-{adr_id}.md",
            "content": f"""# ADR: {decision_title}

**Status:** {status}
**Date:** {date.today().isoformat()}
**Deciders:** [Technical Lead, Solution Architect, Enterprise Architect]
**Technical Story:** [Link to ticket/issue]

## Context

{context}

## Decision

{decision}

## Consequences

### Positive
- [Outcome 1]
- [Outcome 2]

### Negative
- [Trade-off 1]
- [Trade-off 2]

### Risks
- [Risk 1 with mitigation]

## Alternatives Considered

| Alternative | Reason Not Chosen |
|---|---|
| [Option A] | [Why rejected] |
| [Option B] | [Why rejected] |

## References
- [Link to related architecture document]
- [Link to proof of concept]
""",
        }, indent=2)

class RunbookSkill(BaseTool):
    name: str = "runbooks"
    description: str = "Write operational runbooks: alert procedures, step-by-step remediation, and rollback steps."
    def _run(self, subject: str, doc_type: str = "runbook", audience: str = "operator") -> str:
        return json.dumps({
            "template": f"""# Runbook: {subject}

**Owner:** On-call Engineer
**Severity:** [P1|P2|P3]
**Last Tested:** [Date]

## Trigger Condition

This runbook is executed when:
- Alert: [Alert name and condition]
- OR: [Manual trigger condition]

## Impact

[What the user/business impact is if this is not resolved]

## Immediate Actions (first 5 minutes)

1. Acknowledge the alert in PagerDuty
2. Notify #incidents Slack channel: "Investigating [alert name] — ETA update in 10 min"
3. [First diagnostic step]
4. [Second diagnostic step]

## Diagnosis

```bash
# Check service status
kubectl get pods -n cerebrohive-prod -l app={subject.lower().replace(' ', '-')}

# Check recent logs
kubectl logs -l app={subject.lower().replace(' ', '-')} --since=10m

# Check recent deployments
kubectl rollout history deployment/{subject.lower().replace(' ', '-')}
```

## Remediation Options

### Option A: [Most common fix]
```bash
# Commands to fix
```

### Option B: Rollback deployment
```bash
kubectl rollout undo deployment/{subject.lower().replace(' ', '-')}
kubectl rollout status deployment/{subject.lower().replace(' ', '-')}
```

## Verification

After remediation, verify:
- [ ] Alert cleared in Grafana
- [ ] Error rate back to normal
- [ ] No new alerts triggered

## Post-Incident

- Notify #incidents: "Resolved — [brief description of fix]"
- File postmortem if Severity P1
- Add to Known Issues if recurrent
""",
        }, indent=2)

class MermaidDiagramSkill(BaseTool):
    name: str = "mermaid_diagrams"
    description: str = "Create Mermaid diagrams: sequence diagrams, architecture diagrams, state machines, and ER diagrams."
    def _run(self, subject: str, doc_type: str = "sequence", audience: str = "developer") -> str:
        return json.dumps({
            "sequence_template": f"""
```mermaid
sequenceDiagram
    participant User
    participant API as {subject} API
    participant Auth as Auth Service
    participant DB as PostgreSQL

    User->>API: POST /v1/endpoint
    API->>Auth: Validate JWT
    Auth-->>API: User context
    API->>DB: Query data
    DB-->>API: Result
    API-->>User: 200 OK with data

    Note over API,DB: On error
    API->>DB: Query fails
    DB-->>API: Error
    API-->>User: 500 ProblemDetail
```
""",
            "c4_context_template": f"""
```mermaid
C4Context
    title System Context — {subject}
    Person(user, "Enterprise User")
    System(eios, "CerebroHive EIOS", "{subject}")
    System_Ext(llm, "LLM Providers", "Anthropic, OpenAI, Google")
    System_Ext(idp, "Identity Provider", "Auth0 / Azure AD")

    Rel(user, eios, "Uses", "HTTPS")
    Rel(eios, llm, "LLM API calls", "HTTPS")
    Rel(eios, idp, "Authenticates via", "OIDC")
```
""",
        }, indent=2)

class ReleaseNotesSkill(BaseTool):
    name: str = "release_notes"
    description: str = "Write release notes and changelogs: breaking changes, features, fixes, and migration guides."
    def _run(self, subject: str, doc_type: str = "release", audience: str = "developer") -> str:
        from datetime import date
        return json.dumps({
            "template": f"""# Release Notes — {subject}

**Release Date:** {date.today().isoformat()}
**Version:** X.Y.Z

## ⚠️ Breaking Changes

> **Action Required:** Describe what users must change before upgrading.

- [Breaking change 1] — see [Migration Guide](#migration)

## ✨ New Features

- **[Feature Name]**: Description of what it does and why it's useful. ([#123](link))
- **[Feature Name]**: [Description]. ([#124](link))

## 🐛 Bug Fixes

- Fixed [description of bug] that caused [impact]. ([#125](link))

## 🔧 Improvements

- [Performance improvement] — [quantified impact if available]
- [DX improvement]

## 📦 Dependencies Updated

| Package | From | To |
|---------|------|-----|
| [package] | X.Y.Z | A.B.C |

## Migration Guide {{#migration}}

### Upgrading from X.Y.Z

1. Update your configuration: [specific change]
2. Run: `npm install cerebrohive@latest`
3. [Step 3]
""",
        }, indent=2)

TECHNICAL_WRITER_SKILLS = [
    TechnicalWritingSkill(), APIDocumentationSkill(), ADRSkill(),
    RunbookSkill(), MermaidDiagramSkill(), ReleaseNotesSkill(),
]

__all__ = ["TECHNICAL_WRITER_SKILLS"]
