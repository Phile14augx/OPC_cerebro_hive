import { AssessmentSchema, Resource } from "../types";
import { createHash } from "crypto";

export interface AssessmentManifest {
  assessmentId: string;
  version: number;
  createdAt: string;
  author: string;
  dependencies: {
    widgets: string[]; // e.g. ["code@1.2.0", "sql@2.0.1"]
    resources: string[];
  };
  environmentRequirements: string[];
  signatureHash: string;
}

export interface CompiledAssessmentPackage {
  manifest: AssessmentManifest;
  schema: AssessmentSchema; // The frozen schema
}

export class ResourceResolver {
  // In a real backend, this would fetch from S3/Postgres
  async resolve(resourceId: string): Promise<Resource> {
    console.log(`[ResourceResolver] Resolving resource ${resourceId}...`);
    return {
      id: resourceId,
      type: "file",
      name: "Mock Resource",
      content: "Mock Content"
    };
  }
}

export class AssessmentCompiler {
  private resourceResolver = new ResourceResolver();

  /**
   * The core compilation pipeline for an Assessment.
   * Transforms an editable draft into an immutable, versioned runtime package.
   */
  async compile(draftSchema: AssessmentSchema, author: string): Promise<CompiledAssessmentPackage> {
    console.log("[Compiler] 1. Parsing and Validating Schema...");
    this.validate(draftSchema);

    console.log("[Compiler] 2. Resolving Resources...");
    const resolvedSchema = await this.resolveResources(draftSchema);

    console.log("[Compiler] 3. Optimizing Execution Graph...");
    this.optimize(resolvedSchema);

    console.log("[Compiler] 4. Freezing Version...");
    const frozenSchema = this.freeze(resolvedSchema);

    console.log("[Compiler] 5. Packaging and Signing...");
    return this.packageAndSign(frozenSchema, author);
  }

  private validate(schema: AssessmentSchema) {
    if (!schema.title) throw new Error("Assessment missing title");
    if (!schema.sections || schema.sections.length === 0) throw new Error("Assessment must have at least one section");
    // Further widget-specific validation would occur here by calling IWidgetSDK.validateConfig()
  }

  private async resolveResources(schema: AssessmentSchema): Promise<AssessmentSchema> {
    const resolvedResources: Record<string, Resource> = {};
    for (const [id, _] of Object.entries(schema.resources)) {
      resolvedResources[id] = await this.resourceResolver.resolve(id);
    }
    return { ...schema, resources: resolvedResources };
  }

  private optimize(schema: AssessmentSchema) {
    // Reorder/pre-compute data if needed
  }

  private freeze(schema: AssessmentSchema): AssessmentSchema {
    // Deep clone to prevent mutations
    const frozen = JSON.parse(JSON.stringify(schema));
    // In a real DB, we would insert a new row to increment the version integer
    frozen.version = (frozen.version || 0) + 1;
    return Object.freeze(frozen);
  }

  private packageAndSign(schema: AssessmentSchema, author: string): CompiledAssessmentPackage {
    const widgetsUsed = new Set<string>();
    schema.sections.forEach(sec => sec.activities.forEach(act => act.widgets.forEach(w => widgetsUsed.add(w.type))));

    const manifest: AssessmentManifest = {
      assessmentId: schema.id,
      version: schema.version,
      createdAt: new Date().toISOString(),
      author,
      dependencies: {
        widgets: Array.from(widgetsUsed),
        resources: Object.keys(schema.resources)
      },
      environmentRequirements: ["nodejs:20", "docker"],
      signatureHash: "" // Placeholder
    };

    // Create a hash signature to ensure enterprise integrity (no tampering)
    const hash = createHash('sha256');
    hash.update(JSON.stringify(schema) + JSON.stringify(manifest));
    manifest.signatureHash = hash.digest('hex');

    return { manifest, schema };
  }
}
