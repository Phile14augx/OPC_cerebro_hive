# Product Specification: CerebroInsight™

**Status:** Canonical Version 1.0  
**Governing Document:** `PRODUCT_REGISTRY.md`  
**Architectural Tier:** Tier 4 — Business Applications  
**Security Classification:** Tier 2 — Business Confidential

---

## 1. Product Overview

**CerebroInsight™** is the AI-native business intelligence platform. It replaces static dashboards with a living intelligence layer that surfaces anomalies automatically, answers ad-hoc questions in plain language, generates narrative explanations of trends, and forecasts outcomes — all without requiring a data team to build a new dashboard for every question.

The fundamental shift: traditional BI answers the questions you already know to ask. CerebroInsight also answers questions you didn't know to ask, by proactively surfacing anomalies and insights.

---

## 2. Core Capabilities

### 2.1 Natural Language to SQL (NL2SQL)
Users ask questions in plain language; CerebroInsight translates to SQL and executes:

- "What was our revenue by region last quarter, compared to the same period last year?"
- "Which customers haven't placed an order in 90 days but were ordering monthly before that?"
- "Show me the top 10 products by margin in APAC, excluding discontinued SKUs."

**NL2SQL Architecture:**
1. Query intent classification (metric lookup / comparison / trend / anomaly / forecast).
2. Entity extraction (which tables, dimensions, time periods?).
3. Schema-aware SQL generation using HiveAnalytics semantic metric layer (uses predefined metric definitions, not raw table queries — ensures consistency).
4. SQL validation (syntax + logical checks before execution).
5. Result formatting based on query intent (table / chart / single number / narrative).

**Accuracy safeguards:**
- Ambiguous queries trigger a clarification dialog before execution ("Did you mean revenue = bookings, or revenue = recognized ARR?")
- Generated SQL shown to user on request (full transparency).
- Query results include the SQL that generated them for auditability.

### 2.2 Narrative Intelligence
CerebroInsight generates plain-English narrative summaries of data:

- Chart → Story: "Revenue grew 23% YoY to $47.2M. The primary driver was APAC (+$4.2M, +41%), offsetting a decline in EMEA (-$1.1M, -8%). Growth was concentrated in Q3, with October showing the first month-over-month decline in six months."
- Scheduled narratives: weekly revenue narrative delivered to Slack/Teams every Monday morning.
- Exception narratives: "Alert: Gross margin fell 3.2 percentage points this week. The primary driver appears to be shipping cost increases in the Midwest region. Three customers account for 67% of the impact."

### 2.3 Proactive Anomaly Detection
CerebroInsight continuously monitors all connected metrics for anomalies, without requiring users to define alert thresholds manually:

- **Statistical anomaly detection**: Z-score + Prophet forecasting baseline. Anomaly = actual value deviates from predicted by >2 standard deviations.
- **Contextual anomaly detection**: Accounts for seasonality, known events (product launch, holiday), and historical patterns before flagging.
- **Root cause suggestion**: When an anomaly is detected, CerebroInsight identifies the most correlated contributing factors ("Return rate spike correlates with SKU batch B-2024-0892 shipped from Chicago warehouse — 87% correlation").
- **Anomaly digest**: Daily summary of all detected anomalies, prioritized by business impact, delivered to relevant stakeholders.

### 2.4 Forecast Engine
- **Time-series forecasting**: Prophet + LSTM ensemble for revenue, demand, churn, and other time-series metrics.
- **Scenario modeling**: "What happens to Q4 revenue if new customer growth drops by 20%?" — instant scenario run.
- **Forecast confidence intervals**: Uncertainty bounds displayed on all forecasts.
- **Forecast accuracy tracking**: CerebroInsight compares its forecasts to actuals and displays MAPE per metric — self-improving.

### 2.5 Report Builder
For users who want structured reports rather than ad-hoc Q&A:
- Drag-and-drop report canvas (charts, tables, narrative blocks, KPI tiles).
- Powered by HiveAnalytics semantic metric layer (consistent metric definitions across all reports).
- Scheduled delivery (email, Slack, Teams) on configurable cadence.
- Export to PDF, Excel, Google Slides, PowerPoint.
- Board package generator: select KPIs, click generate, receive board-ready PDF.

### 2.6 Insight Copilot
Conversational BI interface — a multi-turn conversation about data:
- "What was our Q3 revenue?" → "How does that compare to plan?" → "Which sales reps are most above/below plan?" → "Draft a message to the bottom 5 reps suggesting they review their pipelines."
- Maintains conversation context across turns.
- Cites every data point with source and timestamp.

---

## 3. Modules

| Module | Description |
|---|---|
| Insight Studio | Report builder — drag-and-drop canvas, charts, tables, scheduled delivery |
| Insight Copilot | Conversational analytics — multi-turn NL2SQL + narrative |
| Insight Alerts | Anomaly monitoring, configurable notification channels |
| Insight Board | Executive view — curated KPIs, narrative digests, board package generator |
| Insight Forecast | Predictive modeling — time-series forecast + scenario modeling |

---

## 4. Technology Stack

| Component | Technology |
|---|---|
| Semantic Metric Layer | HiveAnalytics (dbt + Cube.js) |
| NL2SQL | Fine-tuned LLM (CodeLlama-based) + schema injection + HiveModels |
| Forecasting | Prophet + LSTM (PyTorch) via HiveCompute |
| Anomaly Detection | Prophet + statistical Z-score |
| Charting | Apache ECharts (React wrapper) |
| Report Generation | WeasyPrint (PDF) + python-pptx |
| Frontend | Next.js 14 |
| API | FastAPI (Python) |

---

## 5. SLAs

| Metric | Target |
|---|---|
| NL2SQL response latency P95 | <5 seconds (including execution) |
| Dashboard load time P95 | <2 seconds |
| Anomaly detection lag (time to alert after anomaly occurs) | <15 minutes |
| Forecast computation time | <60 seconds for 12-month horizon |
| Report export generation | <30 seconds |

---

## 6. Roadmap

| Milestone | Timeline |
|---|---|
| Real-time streaming analytics (sub-second dashboard refresh) | Q1 2027 |
| Autonomous insight push to Slack/Teams (proactive, unrequested) | Q4 2026 |
| Multi-dataset join via NL2SQL (query across 2+ data sources in one question) | Q1 2027 |
| Collaborative annotations (add context to anomalies and share with team) | Q2 2027 |
