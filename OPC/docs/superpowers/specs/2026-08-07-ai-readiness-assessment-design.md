# AI Readiness Assessment Service Design

## Goal

Launch CerebroHive's public AI Readiness Assessment as a conversion-ready service. Visitors can understand the offer, complete a six-factor self-assessment, receive an immediate result, and choose to request a consultation.

## Scope

The first release has three connected experiences:

1. A public service page at `/services/ai-readiness-assessment` describing the assessment, deliverables, engagement process, and call to action.
2. A guided, unauthenticated questionnaire covering strategy, data, technology, people, governance, and delivery readiness.
3. A result view that calculates and immediately presents a maturity score, maturity band, and tailored next actions. It includes an optional consultation form that carries the completed score and responses to the future lead-hand-off endpoint.

The release does not include user accounts, payment, email delivery, CRM-specific integration, or a downloadable report. The consultation hand-off endpoint is deliberately designed as an interface so the eventual delivery destination can be selected from the established backend options without redesigning the client flow.

## User flow

1. A visitor reaches the service page and selects **Start assessment**.
2. They answer the six readiness sections in a guided flow. Progress, back navigation, and required-answer validation are visible throughout.
3. The client computes the total score from the agreed factor weights and maps it to a clear maturity band.
4. The result page immediately explains the score, the six factor results, and the recommended next step.
5. The visitor may submit their name, work email, company, and consent to request a consultation. The payload includes their score and answers.

## Architecture

Keep domain content and scoring independent from the page components:

- `assessment-definition`: six factors, question text, answer options, factor weights, maturity thresholds, and recommendations.
- `assessment-scoring`: pure functions that validate answers, calculate factor/overall scores, determine the band, and return recommendations.
- `assessment-wizard`: client-side state, navigation, validation, accessibility, and result rendering.
- `service-page`: the public marketing content and entry point.
- `lead-handoff`: a typed client boundary that accepts the consultation payload. The initial endpoint implementation follows the repository's existing backend pattern after it is identified; it must fail safely and never falsely claim delivery.

All user-facing content and score thresholds remain in the definition layer so consulting teams can adjust them without rewriting UI logic.

## Scoring and results

Each factor receives an independently calculated normalized score. The overall readiness score is the weighted sum, rounded for display only. The result includes:

- An overall score on a 0–100 scale.
- One maturity band with plain-language interpretation.
- Per-factor strengths and priority gaps.
- One actionable next step tailored to the band.

Initial maturity bands are: Foundation (0–24), Emerging (25–49), Ready to Scale (50–74), and Transformational (75–100). These thresholds are centrally defined and covered by tests.

## Data handling and failure behavior

Assessment answers stay in browser memory until the visitor actively submits the consultation form. The form requires explicit consent and validates its fields before submission. If the hand-off endpoint is unavailable, retain the completed result on screen, show a clear retryable error, and do not report that the consultation was requested.

## Accessibility and quality

The service page and wizard must support keyboard navigation, programmatic labels, visible focus, clear error messages, reduced-motion preferences, and responsive layouts. Scoring unit tests cover boundaries, invalid answers, and recommendation selection. UI tests cover the complete assessment flow, immediate result, and consultation success/error states.

## Delivery order

1. Implement and test the public service page and six-factor questionnaire.
2. Implement and test the reusable scoring domain and immediate result page.
3. Identify the established backend destination, implement the hand-off adapter, and connect the consultation form with graceful errors.

## Acceptance criteria

- `/services/ai-readiness-assessment` is a production buildable public route.
- A visitor can complete every required question and see an immediate 0–100 score, maturity band, factor breakdown, and next action.
- Score calculations are deterministic and have boundary test coverage.
- Contact details are optional until the visitor requests a consultation; consent is required for submission.
- A failed hand-off preserves the result and states that the request was not sent.
- The flow meets the existing Studio visual, responsive, and accessibility conventions.
