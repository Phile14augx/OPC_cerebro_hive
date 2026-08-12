# ADR-001: Transition to Enterprise Intelligence Operating System (EIOS)

**Date:** 2026-08-03  
**Status:** Accepted

## Context
Historically, CerebroHive was positioned and structured as a collection of disjointed AI tools and applications ("another AI company" or "Intelligence Mesh"). As the enterprise market shifts toward governed autonomous systems and AI-native infrastructure, this disjointed architecture is insufficient. We need a unified approach that spans infrastructure, development platforms, safety, and business applications to properly orchestrate multi-agent systems at scale.

## Decision
We will transition the company's architectural positioning, commercial strategy, and technical boundaries into a 10-Layer **Enterprise Intelligence Operating System (EIOS)**.

The 10 layers are:
1. Infrastructure
2. AI Infrastructure
3. Agent Runtime
4. Knowledge
5. Enterprise Data
6. AI Safety
7. AI Engineering
8. Enterprise Development Platform
9. AI Studio
10. Enterprise Intelligence

All 50 products in the CerebroHive portfolio will be mapped and constrained by this 10-layer model. Layer N can depend on N-1, but never on N+1.

## Consequences
*   **Easier:** Selling to enterprise buyers (who want platforms, not fragmented tools); standardizing technical integrations; setting long-term (10-year) roadmaps.
*   **Difficult:** Requires a massive restructuring of our documentation, marketing, and potentially repo boundaries to enforce layer separation. Deprecates the old 5-Tier architecture model.
