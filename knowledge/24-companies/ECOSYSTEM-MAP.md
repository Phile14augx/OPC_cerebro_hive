# Cerebro Nexarch AI Ecosystem Map

**Version:** 1.0  
**Date:** 2026-08-14  
**Status:** BOOTSTRAPPED — to be expanded after Phase 3

---

## Classification Legend

| Class | Definition |
|-------|-----------|
| FOUNDATION_MODEL | Trains and deploys frontier language/multimodal models |
| AI_INFRASTRUCTURE | Inference, serving, training, orchestration infrastructure |
| AGENT_PLATFORM | Agent orchestration frameworks and platforms |
| VECTOR_DATABASE | Specialized vector storage and retrieval |
| KNOWLEDGE_GRAPH | Graph databases and knowledge management |
| DIGITAL_TWIN | Digital twin platforms |
| ROBOTICS | Physical AI and robotics systems |
| CHIP_COMPANY | AI chip design and manufacturing |
| CLOUD | Hyperscale cloud providers with AI services |
| RESEARCH_LAB | Academic or industrial research organizations |
| OPEN_SOURCE | Primarily open-source projects or foundations |
| POTENTIAL_PARTNER | Could be integration or delivery partner |
| POTENTIAL_COMPETITOR | Competes with Cerebro Nexarch product/service |
| POTENTIAL_SUPPLIER | Provides capability Cerebro Nexarch could consume |

---

## Foundation Model Providers

| Company | Class | Relevance to Cerebro | Notes |
|---------|-------|---------------------|-------|
| Anthropic | FOUNDATION_MODEL, POTENTIAL_SUPPLIER | Claude models in LLM gateway; MCP protocol | Primary model provider candidate |
| OpenAI | FOUNDATION_MODEL, POTENTIAL_SUPPLIER | GPT-4o, o3 in LLM gateway | Model provider; Azure OpenAI for enterprise |
| Google DeepMind | FOUNDATION_MODEL, POTENTIAL_SUPPLIER | Gemini family; Imagen; A2A protocol | Model provider; also robotics (RT-2) |
| Meta AI | FOUNDATION_MODEL, OPEN_SOURCE | Llama 3.x for self-hosted inference | Open weights option for HiveCompute |
| Mistral AI | FOUNDATION_MODEL, POTENTIAL_SUPPLIER | Mixtral for efficient inference | Cost-effective option for routing |
| Cohere | FOUNDATION_MODEL, POTENTIAL_SUPPLIER | Command R+ for RAG; Embed for embeddings | RAG-optimized; enterprise focus |
| AI21 Labs | FOUNDATION_MODEL, POTENTIAL_SUPPLIER | Jamba (SSM+Transformer hybrid) | Long context option |
| xAI | FOUNDATION_MODEL, POTENTIAL_SUPPLIER | Grok models | Monitor |
| DeepSeek | FOUNDATION_MODEL, OPEN_SOURCE | DeepSeek-R1 for cost-effective reasoning | Open reasoning model |

---

## AI Infrastructure

| Company | Class | Relevance | Notes |
|---------|-------|-----------|-------|
| NVIDIA | CHIP_COMPANY, POTENTIAL_SUPPLIER | GPU compute for HiveCompute | H100/B200 for inference |
| AMD | CHIP_COMPANY, POTENTIAL_SUPPLIER | ROCm alternative to NVIDIA | Monitor cost parity |
| Modal | AI_INFRASTRUCTURE, POTENTIAL_SUPPLIER | Serverless GPU inference | For HiveCompute burst workloads |
| Together AI | AI_INFRASTRUCTURE, POTENTIAL_SUPPLIER | Multi-model inference API | Open model serving |
| Fireworks AI | AI_INFRASTRUCTURE, POTENTIAL_SUPPLIER | Fast inference for open models | Latency-optimized inference |
| Groq | AI_INFRASTRUCTURE, POTENTIAL_SUPPLIER | Ultra-low latency inference (LPU) | Real-time agent use cases |
| vLLM | AI_INFRASTRUCTURE, OPEN_SOURCE | Efficient LLM serving framework | Potential HiveCompute serving layer |
| Ollama | AI_INFRASTRUCTURE, OPEN_SOURCE | Local LLM serving | Edge deployment on Digital Twin nodes |

---

## Agent Platforms and Frameworks

| Company / Project | Class | Relevance | Notes |
|------------------|-------|-----------|-------|
| LangChain / LangGraph | AGENT_PLATFORM, OPEN_SOURCE | Multi-agent orchestration patterns | Study for Swarm Runtime patterns |
| CrewAI | AGENT_PLATFORM, OPEN_SOURCE | Role-based multi-agent teams | Study for CerebroAgent team patterns |
| AutoGen (Microsoft) | AGENT_PLATFORM, OPEN_SOURCE | Conversational multi-agent | Study for agent communication patterns |
| Temporal.io | AI_INFRASTRUCTURE, POTENTIAL_SUPPLIER | Already in stack — durable execution | Core runtime |
| Dify | AGENT_PLATFORM, OPEN_SOURCE | Agent workflow builder | Study for HiveForge patterns |
| Flowise | AGENT_PLATFORM, OPEN_SOURCE | Visual agent builder | Study for CerebroFlow visual builder |
| BabyAGI | AGENT_PLATFORM, OPEN_SOURCE | Task decomposition patterns | Historical reference |
| Haystack (deepset) | AGENT_PLATFORM, OPEN_SOURCE | RAG + agent pipelines | Study for knowledge-api patterns |

---

## Vector Databases

| Company | Class | Relevance | Notes |
|---------|-------|-----------|-------|
| pgvector (PostgreSQL) | VECTOR_DATABASE, OPEN_SOURCE | Already in stack (Prisma + pgvector) | Current vector store |
| Pinecone | VECTOR_DATABASE, POTENTIAL_SUPPLIER | Managed vector search | Alternative if pgvector limits hit |
| Weaviate | VECTOR_DATABASE, POTENTIAL_SUPPLIER, OPEN_SOURCE | Multi-modal vector + graph | Study for knowledge graph integration |
| Qdrant | VECTOR_DATABASE, OPEN_SOURCE | High-performance vector search | Self-hosted alternative |
| Chroma | VECTOR_DATABASE, OPEN_SOURCE | Lightweight embedding DB | Dev/test use |
| Milvus | VECTOR_DATABASE, OPEN_SOURCE | Scalable vector search | Large-scale production alternative |

---

## Knowledge Graph

| Company / Project | Class | Relevance | Notes |
|------------------|-------|-----------|-------|
| Neo4j | KNOWLEDGE_GRAPH, POTENTIAL_SUPPLIER | Graph DB for knowledge-graph-core | Primary graph DB option |
| Amazon Neptune | KNOWLEDGE_GRAPH, POTENTIAL_SUPPLIER | Managed graph DB | AWS deployment option |
| Microsoft (GraphRAG) | RESEARCH_LAB, POTENTIAL_SUPPLIER | GraphRAG framework | Study for knowledge-api upgrade |
| Apache TinkerPop | KNOWLEDGE_GRAPH, OPEN_SOURCE | Graph traversal standard | Protocol consideration |

---

## Digital Twin Platforms

| Company | Class | Relevance | Notes |
|---------|-------|-----------|-------|
| Siemens (MindSphere) | DIGITAL_TWIN, POTENTIAL_COMPETITOR | Industrial digital twins | Enterprise competitor in manufacturing |
| GE Digital (Predix) | DIGITAL_TWIN, POTENTIAL_COMPETITOR | Industrial IoT + twins | Enterprise competitor |
| PTC (ThingWorx) | DIGITAL_TWIN, POTENTIAL_COMPETITOR | Industrial IoT platform | Enterprise competitor |
| Microsoft (Azure DT) | DIGITAL_TWIN, POTENTIAL_COMPETITOR | Azure Digital Twins | Cloud-native competitor |
| NVIDIA (Omniverse) | DIGITAL_TWIN, POTENTIAL_COMPETITOR | Physics-based simulation twins | High-fidelity simulation |
| Bentley Systems | DIGITAL_TWIN, POTENTIAL_COMPETITOR | Infrastructure digital twins | AEC/infrastructure focus |

---

## Research Organizations

| Organization | Class | Relevance |
|-------------|-------|-----------|
| Anthropic | RESEARCH_LAB, FOUNDATION_MODEL | Safety research; MCP; Claude |
| Google DeepMind | RESEARCH_LAB | Gemini; AlphaCode; RT-2; AlphaGeometry |
| OpenAI | RESEARCH_LAB, FOUNDATION_MODEL | o3; GPT-4o; Sora |
| Microsoft Research | RESEARCH_LAB | GraphRAG; AutoGen; Florence |
| Stanford HAI | RESEARCH_LAB | AI policy; foundation model benchmarks |
| MIT CSAIL | RESEARCH_LAB | Robotics; planning; reasoning |
| Berkeley AI Research | RESEARCH_LAB | RL; embodied AI |

---

## Competitive Analysis (Cerebro Nexarch Platform Competitors)

| Company | Competing With | Strength | Cerebro Differentiation |
|---------|---------------|----------|------------------------|
| ServiceNow + Now Intelligence | Enterprise AI workflows | Distribution; incumbency | Deep multi-agent; Digital Twin |
| Salesforce Einstein | CRM + AI | CRM incumbency | Platform breadth; EIOS |
| Microsoft Copilot for M365 | Enterprise AI assistant | M365 integration | Vertical depth; agent autonomy |
| IBM watsonx | Enterprise AI platform | Brand; consulting | Modern architecture; open models |
| C3.ai | Enterprise AI applications | Vertical depth | Agent orchestration; EIOS |
| Palantir (AIP) | Enterprise AI operations | Data integration; defense | Developer-friendly; marketplace |
| Cognitivescale | Responsible AI platform | Governance | Full product portfolio |

---

*This map will be expanded significantly during Phase 3 (knowledge extraction) as the AI Revolution channel covers additional companies, technologies, and competitive developments.*
