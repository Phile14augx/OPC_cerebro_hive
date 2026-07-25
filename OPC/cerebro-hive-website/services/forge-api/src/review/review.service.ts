import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FORGE_REVIEW_SCHEMA } from '@cerebro/ai';
import { projectGraph } from '@cerebro/workflow';
import { AgentOrchestratorService } from '../agent/agent-orchestrator.service';

export interface ReviewCategory {
  name: string;
  score: number;      // 0-100
  findings: number;
  severity: 'clean' | 'low' | 'medium' | 'high' | 'critical';
}

export interface ReviewFinding {
  id: string;
  category: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  filePath?: string;
  line?: number;
  suggestion?: string;
}

export interface ReviewResult {
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  categories: ReviewCategory[];
  findings: ReviewFinding[];
  autoFixable: number;
  reviewedFiles: number;
  reviewedLines: number;
}

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly orchestrator: AgentOrchestratorService,
  ) {}

  async review(projectId: string): Promise<ReviewResult> {
    const ctx = projectGraph.getOrThrow(projectId);

    const fileCount = ctx.generatedFiles.length;
    const lineCount = ctx.generatedFiles.reduce((s, f) => s + f.lineCount, 0);

    const userPrompt = `Perform a comprehensive code review for this project.

Project: ${ctx.prompt}
${ctx.architecture ? `Architecture pattern: ${ctx.architecture.pattern}
Services: ${ctx.architecture.services.map(s => s.name).join(', ')}
Tech stack: ${JSON.stringify(ctx.architecture.techStack)}` : ''}
Generated: ${fileCount} files, ~${lineCount} lines of code

Review all 6 dimensions and return structured JSON:
1. Security (weight 25%) — OWASP Top 10, secrets in code, injection, auth bypass, missing authz
2. Architecture (weight 20%) — SOLID, DRY, coupling, cohesion, layering violations
3. Performance (weight 20%) — N+1 queries, missing DB indexes, blocking I/O, no caching
4. Code Quality (weight 15%) — cyclomatic complexity, naming, dead code, type safety, error handling
5. Test Coverage (weight 12%) — missing tests, edge cases, assertion quality, test isolation
6. Documentation (weight 8%) — missing JSDoc, unclear APIs, missing README sections

Scoring rules:
- Each category score is 0–100
- overallScore = weighted average using the weights above (round to integer)
- grade: A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, F < 60
- findings.id must be unique (e.g. "sec-1", "arch-1")
- autoFixable = count of findings where suggestion is a single-line code change
- reviewedFiles = ${Math.max(fileCount, 1)}
- reviewedLines = ${Math.max(lineCount, 1)}

Produce 3–8 findings total; prioritise high/critical issues. Be specific about file paths and line numbers where known.`;

    projectGraph.advancePhase(projectId, 'review');

    const result = await this.orchestrator.runAgent<ReviewResult>({
      projectId,
      agentType: 'security',
      phase: 'review',
      userPrompt,
      schema: FORGE_REVIEW_SCHEMA,
      schemaDescription: 'ReviewResult — scored categories, actionable findings, grade',
    });

    await (this.prisma as any).project.update({
      where: { id: projectId },
      data: { forgePhase: 'review' },
    });

    return result.output;
  }
}
