/**
 * Intent Engine Pipeline
 * Maps unstructured user prompts to formal architectural requirements.
 */

export interface ArchitecturalRequirements {
  serviceTypes: string[]; // e.g. ["PostgreSQL"]
  capabilities: string[]; // e.g. ["databases.backups.pitr", "encryption.at_rest"]
  environment: "development" | "staging" | "production";
  constraints?: {
    budget?: number;
    currency?: string;
    allowedRegions?: string[];
  };
}

export interface IntentResolution {
  originalPrompt: string;
  inferredIntent: string;
  requirements: ArchitecturalRequirements;
  recommendedBlueprints: string[]; // Blueprint IDs
}

export class IntentEngine {
  
  async parseIntent(prompt: string): Promise<IntentResolution> {
    // In reality, this delegates to an LLM or NLU parser.
    // For now, we simulate reasoning based on keywords.
    
    const requirements: ArchitecturalRequirements = {
      serviceTypes: [],
      capabilities: [],
      environment: prompt.toLowerCase().includes("production") ? "production" : "development"
    };

    if (prompt.toLowerCase().includes("secure postgresql") || prompt.toLowerCase().includes("database")) {
      requirements.serviceTypes.push("PostgreSQL");
      requirements.capabilities.push("databases.relational");
      requirements.capabilities.push("encryption.at_rest");
      if (requirements.environment === "production") {
        requirements.capabilities.push("databases.backups.pitr");
        requirements.capabilities.push("high_availability.multi_az");
      }
    }

    return {
      originalPrompt: prompt,
      inferredIntent: "Deploy a relational database matching security and HA constraints.",
      requirements,
      recommendedBlueprints: ["bp.pg.ha"] // Would map dynamically based on requirements
    };
  }
}

export const intentEngine = new IntentEngine();
