import { newId } from "../../kernel/ids/id.js";
import { PlatformError } from "../../kernel/errors/errors.js";

export interface PromptTemplate { id: string; organizationId: string; name: string; version: number; template: string; variables: string[] }

/** Versioned prompt registry; render() enforces declared variables. */
export class PromptRegistry {
  private prompts = new Map<string, PromptTemplate[]>();

  register(organizationId: string, name: string, template: string): PromptTemplate {
    const variables = [...template.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)].map(m => m[1]!);
    const key = `${organizationId}:${name}`;
    const versions = this.prompts.get(key) ?? [];
    const prompt: PromptTemplate = {
      id: newId("pmt"), organizationId, name, version: versions.length + 1, template, variables: [...new Set(variables)],
    };
    versions.push(prompt);
    this.prompts.set(key, versions);
    return prompt;
  }

  get(organizationId: string, name: string, version?: number): PromptTemplate {
    const versions = this.prompts.get(`${organizationId}:${name}`) ?? this.prompts.get(`*:${name}`);
    if (!versions?.length) throw PlatformError.notFound("prompt", name);
    if (version) {
      const v = versions.find(p => p.version === version);
      if (!v) throw PlatformError.notFound("prompt version", `${name}@${version}`);
      return v;
    }
    return versions[versions.length - 1]!;
  }

  render(organizationId: string, name: string, vars: Record<string, string>, version?: number): string {
    const prompt = this.get(organizationId, name, version);
    const missing = prompt.variables.filter(v => !(v in vars));
    if (missing.length) throw PlatformError.validation(`missing prompt variables: ${missing.join(", ")}`);
    return prompt.template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, v: string) => vars[v] ?? "");
  }

  list(organizationId: string): PromptTemplate[] {
    const out: PromptTemplate[] = [];
    for (const [key, versions] of this.prompts) {
      if (key.startsWith(`${organizationId}:`) || key.startsWith("*:")) out.push(versions[versions.length - 1]!);
    }
    return out;
  }
}
