# Cerebro Nexarch AI Knowledge Taxonomy v1.0

**Date:** 2026-08-14  
**Status:** ACTIVE

---

## Primary Categories

### A. FOUNDATION-MODELS
- LLMs
- Multimodal models
- Reasoning models
- Vision-language models
- Speech / audio models
- Video models
- World models
- Diffusion models
- Embedding models
- Rerankers
- Specialist / domain models
- Small language models (SLMs / edge LLMs)
- Hybrid neuro-symbolic models

### B. AGENTIC-AI
- Autonomous agents
- Multi-agent systems
- Supervisor / orchestrator agents
- Planner-executor patterns
- Reflection and self-correction
- Tool calling and function calling
- Browser agents / web agents
- Coding agents
- Computer-use agents
- Research agents
- Memory architectures (episodic, semantic, procedural)
- Context engineering
- Long-running agents / durable agents
- Agent communication protocols (A2A, MCP, ACP)
- Agent identity and permissions
- Agent evaluation
- Workflow orchestration

### C. AI-NATIVE-ENGINEERING
- Specification-driven development
- AI-assisted code generation
- AI code review
- Autonomous testing
- AI debugging
- Repository intelligence
- CI/CD agents
- Issue triage and resolution agents
- Codebase navigation
- Software architecture agents
- Automated documentation
- Test generation
- Vulnerability discovery
- Migration automation

### D. DIGITAL-TWINS
- Asset digital twins
- Process digital twins
- System digital twins
- Organizational digital twins
- Simulation engines
- Telemetry and sensor integration
- State management and event sourcing
- Time-series systems
- Knowledge graph integration for twins
- Predictive maintenance
- Scenario simulation and what-if analysis
- Causal modeling
- Agent-driven twin orchestration
- Twin lifecycle management

### E. MACHINE-LEARNING
- Supervised learning
- Unsupervised learning
- Reinforcement learning (RL)
- Reinforcement learning from human feedback (RLHF)
- Self-supervised learning
- Continual / lifelong learning
- Active learning
- Transfer learning
- Federated learning
- Online learning
- Synthetic data generation
- Distillation
- Quantization
- Fine-tuning / PEFT / LoRA / QLoRA
- Test-time compute / inference-time scaling

### F. DATA-AND-RAG
- Retrieval-Augmented Generation (RAG)
- GraphRAG
- Agentic RAG
- Vector databases
- Embedding pipelines
- Reranking
- Document processing and parsing
- Streaming data architectures
- Data lineage
- Metadata management
- Semantic layers
- Enterprise search
- Multimodal retrieval

### G. KNOWLEDGE-GRAPHS
- Ontology engineering
- Knowledge graph construction
- Graph databases (Neo4j, etc.)
- Graph neural networks
- Reasoning over graphs
- Entity resolution
- Relationship extraction
- Enterprise ontologies
- Domain-specific knowledge graphs

### H. COMPUTER-VISION
- Object detection
- Segmentation
- OCR and document understanding
- Video understanding
- Visual reasoning
- Spatial intelligence
- 3D reconstruction
- Medical imaging
- Industrial inspection

### I. ROBOTICS
- Humanoid robots
- Industrial robotics
- Embodied AI agents
- Vision-language-action (VLA) models
- Robot learning
- Manipulation
- Navigation
- World models for robotics
- Simulation-to-real transfer
- Physical AI safety

### J. AI-INFRASTRUCTURE
- GPUs / NPUs / TPUs / AI accelerators
- Inference optimization (batching, caching, speculative decoding)
- Distributed inference
- Distributed training
- Model serving frameworks
- Kubernetes and AI workload orchestration
- GPU scheduling
- KV-cache management
- Model quantization for inference
- Edge AI deployment
- Inference economics / cost optimization
- Observability for AI systems
- MLflow / experiment tracking

### K. SECURITY
- Agent security and sandboxing
- Prompt injection defenses
- Tool abuse prevention
- Data exfiltration controls
- Model security (adversarial attacks, membership inference)
- Supply chain security for AI
- Identity and authorization for agents
- Secrets management for agents
- Zero trust for agentic systems
- AI red teaming
- Jailbreaking and alignment failures
- Tenant isolation in multi-tenant AI

### L. GOVERNANCE
- AI policy and regulation
- Responsible AI frameworks
- Model risk management
- Explainability and interpretability
- Provenance and lineage
- Compliance (EU AI Act, NIST, ISO/IEC 42001)
- Auditability of AI decisions
- Human-in-the-loop controls
- Approval gates for high-impact actions
- Bias detection and mitigation

### M. BUSINESS-AND-ECONOMICS
- AI ROI and business cases
- Inference economics
- AI productivity measurement
- Labor leverage from AI
- Cost reduction frameworks
- Revenue expansion via AI
- Automation economics
- AI pricing strategies
- Platform economics and network effects
- AI consulting services and methodologies

---

## Cerebro Nexarch EIOS Layer Mapping

| Layer | Name | Primary Categories |
|-------|------|--------------------|
| 10 | Enterprise Intelligence (Graphs/Twins) | D, G |
| 9 | AI Studio (Builders) | B, C |
| 8 | Enterprise Dev Platform (Pipeline) | C |
| 7 | AI Engineering (LLMOps) | A, E, J |
| 6 | AI Safety (Firewalls/Governance) | K, L |
| 5 | Enterprise Data (Connectors) | F, G |
| 4 | Knowledge (Memory/Ontology) | F, G |
| 3 | Agent Runtime (Durable Execution) | B |
| 2 | AI Infrastructure (Models/Compute) | A, J |
| 1 | Infrastructure (Cloud/Storage) | J |

---

## CerebroHive Product Mapping

| Product | Primary Knowledge Categories |
|---------|------------------------------|
| CerebroStudio | B, C, A |
| CerebroFlow | B, C, F |
| CerebroAgent | B, K, L |
| CerebroSearch | F, G |
| CerebroArchive | F, G, J |
| CerebroInsight | E, M |
| CerebroERP / CRM | M, B |
| HiveForge | C, B |
| HiveOps | J, E |
| HiveShield | K, L |
| HiveData | F, G |
| HiveKnowledge | G, F |
| HiveCompute | J |
| HiveGovern | L |
| HiveMonitor | J |
| Twin Studio | D |
