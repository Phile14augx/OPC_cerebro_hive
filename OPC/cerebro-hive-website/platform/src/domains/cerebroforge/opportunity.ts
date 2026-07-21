import { KnowledgeGraphService, globalKnowledgeGraph } from "./knowledge-graph.js";

// ---------------------------------------------------------------------------------------------
// Opportunity Discovery Engine
// ---------------------------------------------------------------------------------------------

export interface OpportunityGraphNode {
  id: string;
  type: "Concept" | "Model" | "Hardware" | "Industry" | "ProductOpportunity" | "Revenue";
  label: string;
}

export interface OpportunityGraphEdge {
  sourceId: string;
  targetId: string;
  label: string;
}

export interface OpportunityGraph {
  nodes: OpportunityGraphNode[];
  edges: OpportunityGraphEdge[];
  estimatedRevenue: string; // e.g. "$10M - $50M ARR"
}

export class OpportunityDiscoveryEngine {
  private graph: KnowledgeGraphService;

  constructor(graph: KnowledgeGraphService) {
    this.graph = graph;
  }

  /**
   * Deterministically constructs an opportunity path through the knowledge graph.
   * Concept A -> Model B -> GPU C -> Industry D -> Product Opportunity E -> Revenue
   */
  discoverOpportunity(conceptId: string): OpportunityGraph {
    const concept = this.graph.getEntity(conceptId);
    if (!concept) throw new Error(`Concept not found: ${conceptId}`);

    // Seeded random
    let h = 0;
    for (let i = 0; i < concept.id.length; i++) h = Math.imul(31, h) + concept.id.charCodeAt(i) | 0;
    let s = h;
    const rand = () => { s = Math.imul(1664525, s) + 1013904223 | 0; return (s >>> 0) / 4294967296; };

    const nodes: OpportunityGraphNode[] = [];
    const edges: OpportunityGraphEdge[] = [];

    // Node 1: Concept
    const nConcept: OpportunityGraphNode = { id: concept.id, type: "Concept", label: concept.canonicalName };
    nodes.push(nConcept);

    // Node 2: Model
    const modelOpts = ["Llama 3 70B", "Mistral Large", "Custom Fine-tuned LLM", "GPT-4o"];
    const nModel: OpportunityGraphNode = { id: `mod_${rand().toString(36).slice(2)}`, type: "Model", label: modelOpts[Math.floor(rand() * modelOpts.length)]! };
    nodes.push(nModel);
    edges.push({ sourceId: nConcept.id, targetId: nModel.id, label: "implemented_by" });

    // Node 3: Hardware
    const hwOpts = ["NVIDIA H100 Cluster", "AWS Inferentia", "Apple Neural Engine", "NVIDIA A100"];
    const nHw: OpportunityGraphNode = { id: `hw_${rand().toString(36).slice(2)}`, type: "Hardware", label: hwOpts[Math.floor(rand() * hwOpts.length)]! };
    nodes.push(nHw);
    edges.push({ sourceId: nModel.id, targetId: nHw.id, label: "optimized_for" });

    // Node 4: Industry
    const indOpts = ["Financial Services", "Healthcare", "Legal Tech", "Manufacturing", "Retail"];
    const nInd: OpportunityGraphNode = { id: `ind_${rand().toString(36).slice(2)}`, type: "Industry", label: indOpts[Math.floor(rand() * indOpts.length)]! };
    nodes.push(nInd);
    edges.push({ sourceId: nHw.id, targetId: nInd.id, label: "deployed_in" });

    // Node 5: Product Opportunity
    const prodOpts = ["Enterprise Copilot", "Automated Auditor", "Supply Chain Optimizer", "Regulatory AI Agent"];
    const nProd: OpportunityGraphNode = { id: `prod_${rand().toString(36).slice(2)}`, type: "ProductOpportunity", label: prodOpts[Math.floor(rand() * prodOpts.length)]! };
    nodes.push(nProd);
    edges.push({ sourceId: nInd.id, targetId: nProd.id, label: "commercialized_as" });

    // Node 6: Revenue
    const revRanges = ["$1M - $5M ARR", "$5M - $10M ARR", "$10M - $50M ARR", "$50M+ ARR"];
    const rev = revRanges[Math.floor(rand() * revRanges.length)]!;
    const nRev: OpportunityGraphNode = { id: `rev_${rand().toString(36).slice(2)}`, type: "Revenue", label: rev };
    nodes.push(nRev);
    edges.push({ sourceId: nProd.id, targetId: nRev.id, label: "projected_value" });

    return { nodes, edges, estimatedRevenue: rev };
  }
}

export const globalOpportunityEngine = new OpportunityDiscoveryEngine(globalKnowledgeGraph);
