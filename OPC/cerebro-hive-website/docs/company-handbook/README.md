# CerebroHive Company Handbook

> **Classification:** Internal — Confidential  
> **Version:** 1.0  
> **Last updated:** July 2026  
> **Owner:** Founder / Chief Strategy Officer  
> **Status:** Living handbook — this page is the operating guide; linked source documents are the detailed references.

## Purpose and scope

This handbook is the shared reference for how CerebroHive operates, builds, learns, and serves clients. It applies to every team member, contractor, and leader working on behalf of CerebroHive. It consolidates the company’s existing documentation; where a linked policy is marked *scaffold*, its owner must complete and approve the detailed control before it is treated as a binding procedure.

## 1. Who we are

CerebroHive is an AI-native enterprise engineering and transformation partner, founded in 2026. We combine executive advisory, full-stack AI engineering, proprietary delivery frameworks, and managed AI operations to help enterprises move from AI initiatives to measurable production outcomes.

We are neither a strategy-only firm nor a technology vendor that treats delivery as the end point. Our work connects strategy, data, engineering, governance, adoption, and operations. We focus on revenue gained, cost removed, or risk reduced—not the number of models, dashboards, or features shipped.

**Mission:** Accelerate enterprise AI transformation by combining strategic advisory, full-stack engineering, and proprietary frameworks that deliver measurable, durable business outcomes.

**Vision:** Be the world’s most trusted AI-native enterprise transformation partner—the firm enterprises call when AI transformation is too important to get wrong.

Our primary market is mid-market and enterprise organizations, with North America as the initial focus and planned growth into the UK, Australia, and the Middle East. See [Company Overview](../01-company-foundation/01-overview.md), [Mission](../01-company-foundation/02-mission-statement.md), and [Vision](../01-company-foundation/03-vision-statement.md).

## 2. Our values and culture

Our values are decision filters. When a decision is unclear, name the value that applies and act accordingly.

| Value | What it requires in practice |
| --- | --- |
| Outcome Obsession | Define client outcomes and measures before delivery; judge success by value realized. |
| Engineering Excellence | Build secure, tested, documented, observable, maintainable production systems. |
| Intellectual Honesty | Surface limitations, risks, scope concerns, and inconvenient findings early. |
| Client Partnership | Share accountability, transfer capability, and stay focused on adoption—not merely contract completion. |
| Continuous Innovation | Make time to learn, experiment, publish, and turn lessons into reusable accelerators. |
| Responsible AI | Build safe, fair, transparent, accountable systems with meaningful human oversight. |

How we work:

- Prefer evidence to assumptions and documentation to memory.
- Be direct and respectful; challenge ideas, not people.
- Escalate risks early with options and a recommended path.
- Default to transparency within confidentiality and security boundaries.
- Automate repeatable work, then document the resulting process.
- Treat client trust as more important than short-term revenue.

Every engineer has protected learning and experimentation time, and the company holds a weekly AI Watch session. More detail: [Values Overview](../01-company-foundation/04-core-values-overview.md), [Culture Code](../01-company-foundation/28-culture-code.md), and [Continuous Innovation](../01-company-foundation/09-value-continuous-innovation.md).

## 3. Organization and accountability

CerebroHive is intentionally flat, fast, and client-centric. There are no more than three layers between an individual contributor and the founder. Senior people remain close to client work.

The operating practices are AI Strategy, AI Engineering, AI Operations, and AI Products, supported by sales/GTM, delivery operations (PMO, QA, finance), marketing, and shared security. Practice leads own their service-line outcomes; shared delivery infrastructure protects consistent quality across practices.

For every engagement, the accountable owner must be explicit. Decisions, risks, architecture, delivery status, and client commitments must have named owners and recorded outcomes. Practice-level organization and the founding-team structure are documented in [Organizational Structure](../01-company-foundation/14-org-structure.md).

## 4. Operating principles

1. **Write it down.** Decisions, assumptions, requirements, risks, and handoffs belong in the shared knowledge base.
2. **Start with the outcome.** Agree the ROI model and success measures before selecting technology.
3. **Use small, accountable teams.** The closest competent team makes routine decisions; escalate only material risk, spend, scope, or ethical issues.
4. **Build in feedback.** Ship in measurable increments, review results, and change course when evidence warrants it.
5. **Make quality a gate.** A deadline does not waive testing, review, security, documentation, or operational readiness.
6. **Create reusable IP.** Each engagement should contribute approved framework improvements, templates, benchmarks, or lessons learned.

## 5. Client delivery

We offer advisory, engineering, automation and agent development, data engineering, corporate AI education, and custom AI development—alongside CerebroHive products and packaged solutions. Client work may be a fixed-scope project, a retainer, a milestone-based program, a subscription product, or a usage-based service.

Every delivery team must:

- establish the business outcome, scope, stakeholders, risks, and success measures;
- maintain an agreed delivery plan and communicate changes before they become surprises;
- include knowledge transfer and adoption in the delivery plan;
- measure and report outcomes honestly at close and after deployment where applicable; and
- capture reusable, non-confidential learnings for the shared knowledge base.

Refer to [Services](../services.md), [Engagement Models](../engagement-models/00-engagement-models-full.md), [Solutions](../solutions/00-solutions-index.md), and [Products](../products/00-products-index.md).

## 6. Engineering and product standards

All production work follows these minimum standards:

- CI/CD begins in sprint 0; pull requests require peer review and passing automated tests.
- Non-AI logic has at least 80% unit-test coverage.
- Every AI model or prompt change is evaluated against a defined baseline and acceptance criteria.
- Architecture decisions, API documentation, runbooks, and a README are complete before go-live.
- SAST/SCA runs on every pull request; a security architecture review occurs before deployment.
- Production AI services expose latency, error-rate, and output-quality dashboards.
- Cloud infrastructure is managed as code—no unrecorded manual provisioning.

Technology choices should use the approved reference stack unless an ADR records the trade-off and approval. See [Engineering Excellence](../01-company-foundation/06-value-engineering-excellence.md) and [Technology Stack](../tech-stack/00-tech-stack-full.md).

## 7. AI, research, and responsible innovation

AI systems are products with real-world consequences. Before deployment, teams must consider accuracy, latency, cost, safety, privacy, compliance, human oversight, observability, and rollback. High-stakes use cases require human-in-the-loop controls; every system requires bias evaluation, a model card, and EU AI Act risk classification.

We will not build systems designed for irreversible high-stakes decisions without human oversight, user manipulation or deception, authoritarian social scoring, weapons or dual-use military AI, or use cases with demonstrated unmitigable discrimination.

CerebroHive Labs generates IP, publishes thought leadership, contributes open source, and validates product ideas before full investment. Research and experiments should be reproducible, attributable, and recorded so their insight can be reviewed and reused. See [Responsible AI](../01-company-foundation/10-value-responsible-ai.md), [AI Acceptable Use](../01-company-foundation/45-ai-acceptable-use.md), [AI Governance Stack](../tech-stack/04-ai-governance-stack.md), and [Labs Mission](../labs/01-labs-mission.md).

## 8. Security, privacy, and confidentiality

Protect client, employee, and company information as a condition of doing business. Use only approved tools and access, follow least-privilege access, do not place confidential or personal data into unapproved services, and report any suspected security or privacy incident immediately to the engagement lead and security owner.

Client commitments, legal agreements, and applicable regulation govern data handling. The current detailed information-security and privacy documents are marked *scaffold*; until they are formally approved, teams must obtain security-owner guidance for any handling decision outside an approved engagement pattern. See [Security Policy Overview](../01-company-foundation/43-security-policy-overview.md), [Data Privacy Policy](../01-company-foundation/44-data-privacy-policy.md), and the [Legal & Regulatory References](../appendices/a16-regulatory-eu-ai-act.md).

## 9. Knowledge management

Knowledge is a company asset. Store work in the shared, version-controlled documentation system using clear titles, owners, status, dates, and links to related work. Capture decisions as ADRs and material proposals as RFCs. Keep confidential client material segregated from reusable internal assets and remove sensitive details before creating a reusable artifact.

Each engagement should leave behind: a client handover set, architecture and runbooks, outcome evidence, and an internal lessons-learned record. The master [Documentation Index](../README.md) and [Enterprise Playbook](../../CEREBRO_HIVE_PLAYBOOK.md) provide the broader reference library.

## 10. People and ways of working

We hire experienced practitioners who can connect strategy and execution. New joiners complete onboarding on delivery frameworks, commercial model, and quality standards before client-facing work; senior hires shadow a Principal on their first client interaction.

Everyone is expected to act professionally, collaborate generously, protect client confidentiality, seek feedback, and raise concerns without retaliation. Performance is measured by client outcomes, quality, teamwork, learning, and contribution to reusable capability—not utilization alone. Reference: [Performance Management](../01-company-foundation/29-performance-management.md), [Compensation Philosophy](../01-company-foundation/30-compensation-philosophy.md), and [Founding Team](../01-company-foundation/25-founding-team.md).

## 11. Handbook governance

This handbook is reviewed quarterly by the owner and practice leads, and after any material operating, legal, security, or organizational change. Proposed changes should identify the reason, affected teams, owner, effective date, and linked source documents. Approved changes are recorded in version control.

| Revision | Date | Change | Owner |
| --- | --- | --- | --- |
| 1.0 | July 2026 | Initial handbook assembled from existing documentation | Founder / Chief Strategy Officer |
