---
title: "Reference Engagement: Financial Services KYC"
company: "CerebroHive"
status: "representative pattern"
---

# Reference Engagement: KYC Document Extraction

> **Note:** This document represents a *representative pattern* of a successful IDP implementation. It is used to align delivery expectations and prevent fabricated client claims in sales material.

## The Challenge
A mid-sized financial institution struggled with a backlog of Know Your Customer (KYC) onboarding documents. The process required human agents to manually extract entities from passports, utility bills, and handwritten tax forms, leading to a 5-day average onboarding time and a 12% error rate.

## The CerebroHive Solution
We deployed the **Intelligent Document Processing** service, configuring the `idp_specialist` agent (powered by Gemini Multimodal) to handle the ingestion pipeline.

1. **OCR Quality Gates:** Incoming scans were evaluated for legibility. Low-quality scans automatically triggered a "request resubmission" email to the client.
2. **Dynamic Extraction:** Gemini analyzed the documents, cross-referencing names, addresses, and issuance dates against the required KYC JSON schema.
3. **Deterministic Validation & Confidence Policies:** The IDP Specialist applied a strict 92% confidence threshold. If a field (e.g., a handwritten address) fell below 92%, the document was routed to a compliance officer via a safe fallback queue.
4. **Integration:** Validated JSON payloads were pushed directly into the bank's Salesforce instance.

## Outcomes
- **Speed:** Onboarding time reduced from 5 days to 4 minutes for straight-through processing.
- **Accuracy:** 99.1% extraction accuracy on digital documents; 94% on scans.
- **Efficiency:** 78% of all KYC applications were processed with zero human intervention.
