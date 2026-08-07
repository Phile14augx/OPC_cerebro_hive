"""AI Engineer agent skills — LLMs, RAG, multi-agent systems, evaluation, and AI governance."""
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

class LLMInput(BaseModel):
    task: str = Field(..., description="Task description for model selection.")
    latency_requirement: str = Field(default="standard", description="latency: fast|standard|deep-reasoning.")
    cost_priority: str = Field(default="balanced", description="cost: low|balanced|quality-first.")

class PromptInput(BaseModel):
    capability: str = Field(..., description="AI capability to design prompt for.")
    role: str = Field(..., description="Agent role for system prompt.")
    output_format: Optional[str] = Field(None, description="Expected output format: json|text|code.")

class RAGInput(BaseModel):
    knowledge_domain: str = Field(..., description="Knowledge domain to build RAG for.")
    content_type: str = Field(default="technical", description="Content type: technical|legal|financial|general.")
    retrieval_k: int = Field(default=5, description="Top-k documents to retrieve.")

class AgentInput(BaseModel):
    agent_name: str = Field(..., description="Agent name.")
    capability: str = Field(..., description="Agent capability description.")
    tools: Optional[str] = Field(None, description="Comma-separated list of tool names.")

class EvalInput(BaseModel):
    capability: str = Field(..., description="AI capability to evaluate.")
    metrics: str = Field(default="accuracy,hallucination_rate,latency", description="Comma-separated metrics.")
    dataset_size: int = Field(default=50, description="Evaluation dataset size.")


class LLMSkill(BaseTool):
    name: str = "large_language_models"
    description: str = "Select and configure LLM for task: model routing, temperature, fallback, cost tracking."
    def _run(self, task: str, latency_requirement: str = "standard", cost_priority: str = "balanced") -> str:
        routing = {
            "fast": {"primary": "claude-haiku-4-5", "fallback": "gemini-2.0-flash", "max_tokens": 2048, "temperature": 0.1},
            "standard": {"primary": "claude-sonnet-4-6", "fallback": "gemini-2.0-pro", "max_tokens": 4096, "temperature": 0.3},
            "deep-reasoning": {"primary": "claude-opus-4-5", "fallback": "gpt-5.5", "max_tokens": 8192, "temperature": 0.2},
        }.get(latency_requirement, {})
        return json.dumps({
            "task": task, "routing": routing,
            "wrapper": """
class ModelRouter:
    async def complete(self, messages: list[Message], **kwargs) -> str:
        try:
            return await self.primary.complete(messages, **kwargs)
        except (RateLimitError, ProviderError):
            return await self.fallback.complete(messages, **kwargs)
""",
            "cost_tracking": "Log token usage per call — alert if daily cost > threshold",
        }, indent=2)

class PromptEngineeringSkill(BaseTool):
    name: str = "prompt_engineering"
    description: str = "Design optimised prompt templates: system prompts, chain-of-thought, few-shot examples."
    def _run(self, capability: str, role: str, output_format: str = "json") -> str:
        return json.dumps({
            "system_prompt_template": f"""You are {role} for CerebroHive EIOS.

CAPABILITY: {capability}

REASONING PROCESS:
1. Understand the request and identify key requirements
2. Identify relevant context from memory and retrieved documents
3. Plan your approach step-by-step before executing
4. Validate your output against requirements before responding

OUTPUT FORMAT:
{f'Respond with valid JSON matching the schema provided.' if output_format == 'json' else f'Respond in clear {output_format} format.'}

CONSTRAINTS:
- Base every factual claim on retrieved context — cite sources
- If uncertain, say so explicitly — never hallucinate
- If a request is outside your capability, decline clearly""",
            "versioning": f"Store as: prompts/{capability.lower().replace(' ', '_')}/v1.0.0.txt",
            "testing": "Evaluate against baseline dataset before deploying updated prompt",
        }, indent=2)

class RAGSkill(BaseTool):
    name: str = "retrieval_augmented_generation"
    description: str = "Build RAG pipelines: chunking, embedding, hybrid search, reranking, and citation grounding."
    def _run(self, knowledge_domain: str, content_type: str = "technical", retrieval_k: int = 5) -> str:
        chunk_size = {"technical": 512, "legal": 256, "financial": 512, "general": 384}.get(content_type, 512)
        return json.dumps({
            "pipeline": f"""
# RAG Pipeline for {knowledge_domain}
class RAGPipeline:
    async def retrieve(self, query: str, k: int = {retrieval_k}) -> list[Document]:
        # 1. Embed query
        query_embedding = await self.embedder.embed(query)
        # 2. Dense retrieval from vector DB
        dense_results = await self.vector_db.search(query_embedding, k=k*2)
        # 3. Sparse retrieval (BM25)
        sparse_results = await self.bm25.search(query, k=k*2)
        # 4. RRF fusion
        fused = self.rrf_fusion(dense_results, sparse_results)
        # 5. Rerank top results
        reranked = await self.reranker.rerank(query, fused[:k*3], top_k=k)
        return reranked

    async def generate(self, query: str, context: list[Document]) -> RAGResponse:
        prompt = self.build_prompt(query, context)
        response = await self.llm.complete(prompt)
        citations = self.extract_citations(response, context)
        hallucination_score = await self.verify_citations(response, citations)
        return RAGResponse(answer=response, citations=citations, confidence=1-hallucination_score)
""",
            "chunking": f"chunk_size={chunk_size}, overlap={chunk_size // 4}, splitter=RecursiveCharacterTextSplitter",
            "embedding": "text-embedding-3-large (OpenAI) or voyage-large-2 (Anthropic) — 1536 dims",
        }, indent=2)

class VectorDatabaseSkill(BaseTool):
    name: str = "vector_databases"
    description: str = "Integrate vector databases: Qdrant, pgvector, Milvus for embedding storage and search."
    def _run(self, knowledge_domain: str, content_type: str = "technical", retrieval_k: int = 5) -> str:
        return json.dumps({
            "selection": {
                "Qdrant": "Production-ready, Rust-based — recommended for new projects",
                "pgvector": "PostgreSQL extension — use if already using PostgreSQL and < 1M vectors",
                "Milvus": "For very large scale (> 100M vectors) requiring distributed architecture",
            },
            "qdrant_collection": f"""
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, HnswConfigDiff

client.create_collection(
    collection_name="{knowledge_domain.lower().replace(' ', '_')}",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE),
    hnsw_config=HnswConfigDiff(m=16, ef_construct=200),
    on_disk_payload=True,
)
""",
            "namespace_per_tenant": "Filter by tenant_id payload field — multi-tenant isolation without collection per tenant",
        }, indent=2)

class AgentOrchestrationSkill(BaseTool):
    name: str = "agent_orchestration"
    description: str = "Design multi-agent systems with CrewAI and LangGraph: task routing, delegation, and coordination."
    def _run(self, agent_name: str, capability: str, tools: str = "") -> str:
        return json.dumps({
            "crewai_agent": f"""
from crewai import Agent

{agent_name.lower()} = Agent(
    role="{capability}",
    goal="Accomplish {capability} tasks with enterprise-grade quality",
    backstory="...",
    tools=[{', '.join(f'{t.strip()}Tool()' for t in tools.split(',') if t.strip())}],
    llm=model_router.get_llm("standard"),
    verbose=True,
    memory=True,
    max_iter=15,
    max_rpm=10,
)
""",
            "langgraph_node": f"""
def {agent_name.lower()}_node(state: GraphState) -> GraphState:
    result = {agent_name.lower()}.execute(state["task"])
    return {{**state, "{agent_name.lower()}_result": result}}
""",
        }, indent=2)

class ToolCallingSkill(BaseTool):
    name: str = "tool_calling"
    description: str = "Design and implement LLM tool definitions with JSON Schema, validation, and error handling."
    def _run(self, agent_name: str, capability: str, tools: str = "") -> str:
        return json.dumps({
            "tool_definition": f"""
{{
  "type": "function",
  "function": {{
    "name": "search_knowledge_base",
    "description": "Search the CerebroHive knowledge base for relevant information. Use this when you need factual information about architecture, APIs, or decisions.",
    "parameters": {{
      "type": "object",
      "properties": {{
        "query": {{ "type": "string", "description": "The search query in natural language" }},
        "domain": {{ "type": "string", "enum": ["architecture", "api", "decisions", "general"] }},
        "limit": {{ "type": "integer", "default": 5, "minimum": 1, "maximum": 20 }}
      }},
      "required": ["query"]
    }}
  }}
}}
""",
            "max_depth": "Max 10 tool calls per turn — prevent infinite loops",
            "validation": "Validate tool call arguments against JSON Schema before execution",
            "error_handling": "Return structured error on tool failure — agent continues with error context",
        }, indent=2)

class EvaluationSkill(BaseTool):
    name: str = "ai_evaluation"
    description: str = "Build AI evaluation frameworks: accuracy, hallucination rate, RAG metrics, and regression suites."
    def _run(self, capability: str, metrics: str = "accuracy,hallucination_rate,latency", dataset_size: int = 50) -> str:
        return json.dumps({
            "eval_framework": f"""
class EvaluationSuite:
    async def evaluate(self, capability: str, dataset: list[EvalSample]) -> EvalReport:
        results = []
        for sample in dataset:
            response = await self.system.run(sample.input)
            results.append(EvalResult(
                accuracy=self.assess_accuracy(response, sample.expected),
                hallucination=self.detect_hallucination(response, sample.context),
                latency_ms=response.latency_ms,
                cost_usd=response.cost_usd,
            ))
        return EvalReport.aggregate(results)
""",
            "metrics": [m.strip() for m in metrics.split(",")],
            "dataset_size": dataset_size,
            "thresholds": {
                "accuracy": "≥ 0.95",
                "hallucination_rate": "< 0.02",
                "latency_p99_ms": "< 3000",
            },
            "ci_integration": "Run eval suite on every PR — fail merge if accuracy drops ≥ 2% from baseline",
        }, indent=2)

class AIGuardrailsSkill(BaseTool):
    name: str = "ai_guardrails"
    description: str = "Implement AI safety guardrails: prompt injection detection, output validation, PII redaction."
    def _run(self, capability: str, metrics: str = "", dataset_size: int = 50) -> str:
        return json.dumps({
            "input_guardrails": {
                "prompt_injection": "Detect injection patterns: 'ignore previous instructions', role overrides, jailbreak attempts",
                "pii_detection": "Identify and redact: names, emails, SSN, credit cards, phone numbers — before sending to LLM",
                "content_filter": "Block: CSAM, weapon synthesis, explicit content — using safety classifier",
                "length_limit": "Max 50K tokens input — prevent context stuffing attacks",
            },
            "output_guardrails": {
                "hallucination_check": "Verify every factual claim is grounded in retrieved context",
                "pii_redaction": "Scan LLM output for PII before returning to user",
                "safety_classifier": "Classify output for harmful content — reject and rephrase if triggered",
                "schema_validation": "Validate JSON output against Pydantic model — reject malformed responses",
            },
        }, indent=2)

class KnowledgeGraphSkill(BaseTool):
    name: str = "knowledge_graphs"
    description: str = "Build knowledge graphs with Neo4j: ontology design, entity extraction, and graph-based retrieval."
    def _run(self, knowledge_domain: str, content_type: str = "technical", retrieval_k: int = 5) -> str:
        return json.dumps({
            "schema": f"""
// {knowledge_domain} Knowledge Graph Schema
(:Concept {{ id: string, name: string, description: string, domain: '{knowledge_domain}' }})
(:Document {{ id: string, title: string, content: string, source: string, embeddingId: string }})
(:Agent {{ id: string, role: string, capability: string }})

(:Concept)-[:RELATES_TO {{ strength: float }}]->(:Concept)
(:Document)-[:DESCRIBES {{ confidence: float }}]->(:Concept)
(:Agent)-[:USES]->(:Concept)
""",
            "hybrid_query": "Combine graph traversal (3-hop) with vector similarity for context-enriched retrieval",
            "extraction": "LLM-powered entity extraction — identify concepts, relations from ingested documents",
        }, indent=2)

class MLOpsSkill(BaseTool):
    name: str = "llmops"
    description: str = "Operate LLMs in production: model versioning, A/B testing, cost monitoring, and drift detection."
    def _run(self, capability: str, metrics: str = "", dataset_size: int = 50) -> str:
        return json.dumps({
            "model_registry": "Track model versions, prompt versions, eval scores — pin to specific versions in prod",
            "ab_testing": "Route 10% of traffic to new model/prompt — compare eval metrics before full rollout",
            "cost_monitoring": "Alert if daily LLM spend > $X — per-capability cost breakdown in Grafana",
            "drift_detection": "Weekly eval run — alert if accuracy drops > 2% from baseline",
            "observability": "OTel spans per LLM call: model, tokens, latency, cost, user_id, task_id",
        }, indent=2)

AI_ENGINEER_SKILLS = [
    LLMSkill(), PromptEngineeringSkill(), RAGSkill(), VectorDatabaseSkill(),
    AgentOrchestrationSkill(), ToolCallingSkill(), EvaluationSkill(),
    AIGuardrailsSkill(), KnowledgeGraphSkill(), MLOpsSkill(),
]

__all__ = ["AI_ENGINEER_SKILLS"]
