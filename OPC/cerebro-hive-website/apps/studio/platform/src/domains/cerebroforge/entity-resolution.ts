import { seededRandom } from "../simulator/simulator.js";
import { newId } from "../../kernel/ids/id.js";

export type EntityType = 
  | "Paper" | "Repository" | "Dataset" | "Model" | "Algorithm" | "Architecture" 
  | "Training Method" | "Evaluation Metric" | "Framework" | "Language" 
  | "Hardware" | "GPU" | "TPU" | "Cloud" | "API" | "Company" | "Research Lab" 
  | "University" | "Author" | "Patent" | "Benchmark" | "Enterprise Product" 
  | "Industry" | "Regulation";

export interface ResolvedEntity {
  id: string; // Canonical ID, e.g., org_openai
  type: EntityType;
  canonicalName: string;
  aliases: string[];
}

// In-memory canonical mapping for the mock simulator
const CANONICAL_DB: Record<string, ResolvedEntity> = {
  "org_openai": { id: "org_openai", type: "Company", canonicalName: "OpenAI", aliases: ["Open AI", "OPENAI", "OpenAI Inc."] },
  "org_google": { id: "org_google", type: "Company", canonicalName: "Google", aliases: ["Google Inc", "Alphabet", "Google DeepMind"] },
  "model_gpt4": { id: "model_gpt4", type: "Model", canonicalName: "GPT-4", aliases: ["GPT4", "GPT 4", "GPT-4 Turbo", "gpt-4"] },
  "arch_transformer": { id: "arch_transformer", type: "Architecture", canonicalName: "Transformer", aliases: ["Transformers", "transformer architecture"] },
  "fw_pytorch": { id: "fw_pytorch", type: "Framework", canonicalName: "PyTorch", aliases: ["pytorch", "torch", "PyTorch 2.0"] },
};

export class EntityResolver {
  /**
   * Resolves a raw string into a Canonical ID or creates a new one deterministically.
   */
  resolve(rawName: string, type: EntityType): ResolvedEntity {
    const normalized = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check known aliases
    for (const entity of Object.values(CANONICAL_DB)) {
      if (entity.type === type && (
        entity.canonicalName.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized ||
        entity.aliases.some(a => a.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized)
      )) {
        return entity;
      }
    }

    // Deterministically generate a new canonical entity if not found
    let h = 0;
    for (let i = 0; i < normalized.length; i++) h = Math.imul(31, h) + normalized.charCodeAt(i) | 0;
    const shortHash = (h >>> 0).toString(16).slice(0, 6);
    
    const prefix = type.toLowerCase().slice(0, 4);
    const id = `${prefix}_${normalized.slice(0, 10)}_${shortHash}`;
    
    return {
      id,
      type,
      canonicalName: rawName.trim(),
      aliases: [rawName.trim()]
    };
  }

  /**
   * Canonicalizes a list of mixed entity names into canonical entities.
   */
  canonicalize(names: string[], type: EntityType): ResolvedEntity[] {
    const resolved = names.map(n => this.resolve(n, type));
    return this.deduplicate(resolved);
  }

  /**
   * Deduplicates a list of entities based on their canonical ID.
   */
  deduplicate(entities: ResolvedEntity[]): ResolvedEntity[] {
    const seen = new Set<string>();
    return entities.filter(e => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });
  }

  /**
   * Merges two canonical entities (e.g. if discovered they are the same after the fact).
   */
  merge(sourceId: string, targetId: string): ResolvedEntity {
    const source = CANONICAL_DB[sourceId];
    const target = CANONICAL_DB[targetId];
    
    if (!source && !target) throw new Error("Neither entity exists");
    if (!source) return target!;
    if (!target) return source;
    
    // Merge source into target
    const merged: ResolvedEntity = {
      ...target,
      aliases: Array.from(new Set([...target.aliases, source.canonicalName, ...source.aliases]))
    };
    
    return merged;
  }
}

export const globalEntityResolver = new EntityResolver();
