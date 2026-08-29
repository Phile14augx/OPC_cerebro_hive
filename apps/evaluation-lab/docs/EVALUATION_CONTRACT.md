# Evaluation Contract Interface

This document defines the universal `EVALUATION_CONTRACT` schema that **every other Nexarch product** must implement in their respective `docs/EVALUATION_CONTRACT.md` files to be compatible with P48 Evaluation Lab.

## The Universal Evaluation Schema

Products must declare their evaluation requirements using the following YAML schema:

```yaml
# Schema: Nexarch Evaluation Contract v1
product_id: P{NN}
evaluation_targets:
  - id: "{target_identifier}"
    type: "MODEL | AGENT | RAG_PIPELINE | SYSTEM"
    description: "What is being evaluated"

datasets:
  - id: "{dataset_id}"
    type: "STANDARD | CUSTOM | ADVERSARIAL"
    source: "hf://... | s3://..."

metrics:
  - name: "accuracy | faithfulness | relevance | safety | latency | cost"
    type: "DETERMINISTIC | LLM_JUDGE | HUMAN"
    threshold:
      operator: "> | < | >= | <="
      value: {number}
      must_pass: true | false
    judge_config: # Only for LLM_JUDGE
      framework: "prometheus | g-eval | custom"
      judge_model: "gpt-4-turbo"

adversarial_tests:
  - suite: "prompt_injection | jailbreak | out_of_domain"
    robustness_threshold: 0.99
```

## First-Class Evaluation Types
The Lab natively supports and automatically computes the following dimensions:
1. **Accuracy/Correctness**: Exact match, F1 score, or semantic similarity.
2. **Retrieval Quality**: Precision@k, Recall@k, MRR, Context Relevance (for RAG).
3. **Generation Quality**: Faithfulness, Answer Relevance, Coherence, Tone (via LLM-as-a-judge).
4. **Safety & Compliance**: Toxicity, Bias, Jailbreak resistance, PII leakage.
5. **Efficiency**: P50/P95 Latency, Cost per request ($).

## LLM-as-a-Judge Framework
P48 uses **Prometheus** (fine-tuned evaluator models) as the default judge for absolute grading (1-5 rubrics) and pairwise comparisons. We also support **G-Eval** style prompting for enterprise custom criteria using state-of-the-art closed models.

## Human-in-the-Loop (HITL)
For critical workflows, the schema allows specifying `type: HUMAN`. This automatically routes a random sampling (e.g., 5%) of the data to the HITL Studio queue, overriding the automated judge scores if they conflict, and logging the delta to continuously fine-tune the LLM Judge.
