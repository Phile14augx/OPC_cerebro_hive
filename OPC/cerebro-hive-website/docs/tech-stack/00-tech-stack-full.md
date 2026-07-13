---
title: "CerebroHive Technology Stack — Full Reference"
section: "Technology Stack"
company: "CerebroHive"
version: "1.0"
date: "July 2026"
status: "final"
tags: [tech-stack, architecture, standards]
---

## 9. Technology Stack Across Products

### Core AI/ML Stack

| Component | Technology | Used In |
|---|---|---|
| Primary LLM (reasoning) | Anthropic Claude | Consulting tools, document analysis, complex agents |
| Primary LLM (speed/cost) | OpenAI GPT-4o mini / GPT-4o | Customer-facing chatbots, classification, summarization |
| Multimodal | Google Gemini 1.5 Pro | Document processing with images, video analysis |
| Open-source LLM | Llama 3 (Meta) | On-premise deployments, cost-sensitive workloads |
| Agent Orchestration | LangGraph | Multi-agent workflows, stateful agent systems |
| RAG Framework | LangChain | Knowledge base retrieval, document Q&A |
| Vector Store | Pinecone / pgvector | Long-term agent memory, semantic search |
| Embedding Models | OpenAI text-embedding-3-large | Document indexing, semantic similarity |

### Application Infrastructure

| Component | Technology |
|---|---|
| Web Framework | Next.js (App Router) + TypeScript |
| API Layer | Spring Boot (Java) |
| Database | PostgreSQL (primary), MongoDB (document store) |
| Cache | Redis |
| Message Queue | Apache Kafka |
| File Storage | AWS S3 |
| Search | Elasticsearch |
| Email | AWS SES + SendGrid |
| SMS/WhatsApp | Twilio / AWS SNS / Meta Cloud API |

### Cloud & DevOps

| Component | Technology |
|---|---|
| Cloud (primary) | AWS |
| Cloud (secondary) | GCP (AI/ML workloads) |
| Containers | Docker |
| Orchestration | Kubernetes (EKS) |
| CI/CD | GitHub Actions |
| CDN | CloudFront |
| Monitoring | Datadog + CloudWatch |
| APM | Datadog APM |
| Security | AWS WAF, Secrets Manager, KMS |

### AI Governance Stack

| Component | Technology |
|---|---|
| LLM Observability | Langfuse |
| Prompt Versioning | Internal (PromptVault OSS) |
| Model Evaluation | RAGAS, LangSmith |
| Audit Logging | Structured logging → S3 → Athena |
| PII Detection | AWS Comprehend + custom NER models |

---
