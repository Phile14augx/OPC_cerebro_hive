import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { FORGE_DEPLOY_SCHEMA } from '@cerebro/ai';
import { projectGraph } from '@cerebro/workflow';
import { AgentOrchestratorService } from '../agent/agent-orchestrator.service';

export interface DeploymentArtifact {
  filePath: string;
  type: 'dockerfile' | 'k8s_manifest' | 'terraform' | 'ci_pipeline' | 'docker_compose';
  description: string;
}

export interface DeploymentResult {
  environment: string;
  artifacts: DeploymentArtifact[];
  ciPipelineSteps: Array<{ step: string; command: string; duration: string }>;
  infrastructureTargets: string[];
  status: 'generated';
}

/** Shape returned by the AI for structured deploy planning */
interface AIDeployResult {
  infrastructureTargets: string[];
  ciPipelineSteps: Array<{ step: string; command: string; duration: string }>;
  notes: string;
}

@Injectable()
export class DeployService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly orchestrator: AgentOrchestratorService,
  ) {}

  async generateDeployment(projectId: string, environment = 'production'): Promise<DeploymentResult> {
    const ctx = projectGraph.getOrThrow(projectId);

    const serviceList = ctx.architecture?.services
      .map(s => `${s.name}:${s.port} (${s.runtime ?? 'node'}, db=${s.database ?? 'none'})`)
      .join('\n  ') ?? 'api:3000';

    const techStack = ctx.architecture?.techStack ?? {};
    const databases = (techStack.database ?? []).join(', ') || 'PostgreSQL';
    const infra     = (techStack.infra     ?? []).join(', ') || 'Kubernetes';

    const isCloud = environment === 'production' || environment === 'staging';

    const userPrompt = `Design the complete CI/CD pipeline and infrastructure plan for this project.

Project: ${ctx.prompt}
Target environment: ${environment}
Services:
  ${serviceList}
Tech stack — databases: ${databases}, infra: ${infra}

Provide:
1. infrastructureTargets — list of concrete infrastructure components needed (e.g. "AWS EKS 1.29", "RDS PostgreSQL 16 Multi-AZ", "ElastiCache Redis 7", "S3 + CloudFront", "ACM TLS"). Derive from the actual tech stack above.
2. ciPipelineSteps — ordered list of CI/CD steps with realistic shell commands and estimated durations. Include: checkout, install, lint, typecheck, unit-test, integration-test, build, docker-build, push-to-registry, ${isCloud ? 'deploy-to-k8s, smoke-test, rollback-on-failure' : 'start-local-stack, health-check'}.

Keep step commands realistic and tool-specific (pnpm, docker, kubectl, terraform as appropriate).`;

    projectGraph.advancePhase(projectId, 'deployment');

    const result = await this.orchestrator.runAgent<AIDeployResult>({
      projectId,
      agentType: 'devops',
      phase: 'deployment',
      userPrompt,
      schema: FORGE_DEPLOY_SCHEMA,
      schemaDescription: 'AIDeployResult — infrastructure targets and CI pipeline steps derived from project architecture',
    });

    const aiResult = result.output;

    // Build artifact list from real architecture data
    const serviceNames = ctx.architecture?.services.map(s => s.name) ?? ['api'];
    const artifacts: DeploymentArtifact[] = [
      ...serviceNames.slice(0, 6).map(s => ({
        filePath: `services/${s}/Dockerfile`,
        type: 'dockerfile' as const,
        description: `Multi-stage Docker build for ${s}`,
      })),
      { filePath: 'docker-compose.yml',               type: 'docker_compose', description: 'Local development stack'                    },
      { filePath: 'k8s/namespace.yaml',               type: 'k8s_manifest',   description: 'Kubernetes namespace and RBAC'              },
      ...serviceNames.slice(0, 6).map(s => ({
        filePath: `k8s/${s}/deployment.yaml`,
        type: 'k8s_manifest' as const,
        description: `K8s Deployment + HPA for ${s}`,
      })),
      { filePath: 'k8s/ingress.yaml',                 type: 'k8s_manifest',   description: 'NGINX Ingress with TLS termination'        },
      { filePath: 'k8s/monitoring.yaml',              type: 'k8s_manifest',   description: 'Prometheus ServiceMonitor + Grafana dashboard' },
      { filePath: 'terraform/main.tf',                type: 'terraform',      description: 'Main Terraform entrypoint'                 },
      { filePath: 'terraform/eks.tf',                 type: 'terraform',      description: `EKS cluster (${environment})`              },
      { filePath: 'terraform/rds.tf',                 type: 'terraform',      description: `RDS ${databases} (${environment})`         },
      { filePath: '.github/workflows/ci.yml',         type: 'ci_pipeline',    description: 'GitHub Actions — test, build, push, deploy'},
      { filePath: '.github/workflows/release.yml',    type: 'ci_pipeline',    description: 'Semantic release + changelog generation'   },
    ];

    const p = this.prisma as any;
    await p.$transaction([
      p.project.update({
        where: { id: projectId },
        data: { forgePhase: 'deployment', forgeStatus: 'deploying' },
      }),
      ...artifacts.map(a =>
        p.generatedArtifact.upsert({
          where: { projectId_filePath: { projectId, filePath: a.filePath } },
          create: {
            projectId,
            filePath: a.filePath,
            type: a.type,
            language: a.type === 'terraform'   ? 'hcl'
                    : a.type === 'ci_pipeline' ? 'yaml'
                    : a.type === 'k8s_manifest' ? 'yaml'
                    : 'dockerfile',
            content: `# Generated by CerebroForge™ DevOps Agent\n# ${a.filePath}\n# ${a.description}`,
            lineCount: 80,
            agentType: 'devops',
            status: 'done',
          },
          update: { status: 'done' },
        }),
      ),
    ]);

    return {
      environment,
      artifacts,
      ciPipelineSteps: aiResult.ciPipelineSteps,
      infrastructureTargets: aiResult.infrastructureTargets,
      status: 'generated',
    };
  }
}
