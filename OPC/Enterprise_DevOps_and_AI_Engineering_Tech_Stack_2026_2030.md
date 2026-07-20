# Enterprise Technology Stack Reference (2026--2030)

## Part I --- Enterprise DevOps / Platform Engineering Stack

### Architecture

``` text
Developers
    │
GitHub Enterprise
    │
GitHub Actions (CI)
    │
Security • Testing • SBOM • Image Signing
    │
Harbor / GHCR
    │
Argo CD (GitOps)
    │
Kubernetes
    │
Platform Services • AI Services
```

## Technology Stack

  Layer              Technologies
  ------------------ ---------------------------------------------------------
  Operating System   Ubuntu Server 24.04 LTS, Talos Linux, Rocky Linux
  Source Control     Git, GitHub Enterprise
  CI                 GitHub Actions
  CD / GitOps        Argo CD, Argo Rollouts
  Containers         Docker, BuildKit, Docker Compose
  Orchestration      Kubernetes, Helm, Kustomize
  IaC                Terraform, OpenTofu, Terragrunt
  Configuration      Ansible
  Cloud              AWS (EKS, EC2, RDS, S3, IAM), Azure, Google Cloud
  Networking         NGINX, Traefik, Envoy, Cloudflare
  Identity           Keycloak, OAuth2, OIDC, Auth.js
  Secrets            HashiCorp Vault, External Secrets
  Databases          PostgreSQL (+pgvector), Redis
  Object Storage     MinIO, Amazon S3
  Messaging          NATS JetStream, Kafka, RabbitMQ, Temporal
  Registry           Harbor, GitHub Container Registry
  Monitoring         Prometheus, Grafana, Alertmanager
  Logging            Loki, Promtail, ELK
  Tracing            OpenTelemetry, Tempo, Jaeger
  Security           Trivy, Falco, Kyverno, OPA, Cosign, Gitleaks, Kubescape
  Documentation      Backstage, MkDocs, Mermaid, PlantUML

### Recommended Learning Path

1.  Linux & Networking
2.  Git & GitHub
3.  Docker
4.  Kubernetes & Helm
5.  GitHub Actions
6.  Terraform & Ansible
7.  AWS / Azure / GCP
8.  Observability (Prometheus, Grafana, Loki, OTel)
9.  GitOps (Argo CD)
10. DevSecOps
11. Platform Engineering
12. MLOps / LLMOps integration

------------------------------------------------------------------------

# Part II --- Enterprise ML / DL / AI Engineering Stack

## Layered Architecture

``` text
Applications
│
AI Agents
│
Knowledge Layer
│
LLM Gateway
│
Inference
│
Foundation Models
│
Training
│
Data Engineering
│
Storage
│
Infrastructure
│
Hardware
```

## Technology Stack

  Layer                  Technologies
  ---------------------- --------------------------------------------------------
  Hardware               NVIDIA Blackwell/Hopper, AMD MI Series, TPUs, Trainium
  OS                     Ubuntu, Rocky Linux
  Languages              Python, Rust, Go, C++, CUDA
  Data                   NumPy, Pandas, Polars, PyArrow, DuckDB, Dask
  Visualization          Matplotlib, Plotly, Altair
  Classical ML           scikit-learn, XGBoost, LightGBM, CatBoost
  Deep Learning          PyTorch, JAX, TensorFlow
  Model Libraries        Transformers, Diffusers, timm, PEFT, Accelerate
  LLM Serving            vLLM, TensorRT-LLM, SGLang, Ollama
  Distributed Training   DeepSpeed, Megatron-LM, Ray Train, FSDP
  Computer Vision        OpenCV, YOLO, Detectron2, SAM
  NLP                    spaCy, Sentence Transformers, Hugging Face
  Speech                 Whisper, NeMo, SpeechBrain
  RL                     RLlib, Stable Baselines3, Gymnasium
  Data Engineering       Spark, Ray Data, Kafka, Flink, Airflow, Dagster
  Databases              PostgreSQL, Redis, MongoDB, Qdrant, Milvus, OpenSearch
  MLOps                  MLflow, Kubeflow, Feast, KServe, BentoML, Ray Serve
  LLMOps                 Langfuse, DeepEval, Ragas, Promptfoo, LiteLLM
  AI Agents              OpenAI Agents SDK, LangGraph, CrewAI, AutoGen, MCP
  Observability          Prometheus, Grafana, Langfuse, Arize, WhyLabs
  Security               Vault, Trivy, Falco, Cosign, SBOM
  Governance             NIST AI RMF, ISO 42001, EU AI Act

### Recommended Learning Path

1.  Python, SQL, Linux
2.  NumPy, Pandas, Statistics
3.  Classical ML
4.  PyTorch Deep Learning
5.  Transformers & LLMs
6.  Distributed Training
7.  Data Engineering
8.  MLOps & LLMOps
9.  AI Agents & MCP
10. Enterprise AI Platform Architecture

------------------------------------------------------------------------

# Recommended Repository Layout

``` text
platform/
├── apps/
├── services/
├── ai/
│   ├── training/
│   ├── serving/
│   ├── evaluation/
│   └── prompts/
├── infrastructure/
│   ├── terraform/
│   ├── kubernetes/
│   ├── helm/
│   ├── argocd/
│   ├── monitoring/
│   └── security/
├── docs/
└── .github/workflows/
```
