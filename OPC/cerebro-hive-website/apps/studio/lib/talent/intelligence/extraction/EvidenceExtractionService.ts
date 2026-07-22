import { PrismaClient } from '@prisma/client';
import { DomainEventBus } from '../../infrastructure/events/eventBus';
import { Logger } from '../../infrastructure/observability/logger';
import { SkillGraphService } from '../core/SkillGraphService';
import { IAIEvaluatorProvider } from './providers/interfaces';
import { MockEvaluatorProvider } from './providers/MockEvaluatorProvider';

const prisma = new PrismaClient();
const logger = new Logger('EvidenceExtractionService');
const skillGraphService = new SkillGraphService();

// Mock Provider injected for Stage 4
const aiEvaluator: IAIEvaluatorProvider = new MockEvaluatorProvider();

export class EvidenceExtractionService {
  constructor() {
    this.initializeEventSubscription();
  }

  private initializeEventSubscription() {
    DomainEventBus.subscribe<{jobId: string, exitCode: number}>('ExecutionCompleted', async (event) => {
      const { jobId, exitCode } = event.payload;
      logger.info(`Extracting evidence for Job: ${jobId}`);
      await this.extractEvidence(jobId);
    });
  }

  async extractEvidence(jobId: string) {
    try {
      // 1. Artifact Collector
      const artifact = await prisma.executionArtifact.findFirst({
        where: { jobId },
        include: {
          job: {
            include: {
              session: {
                include: { candidate: true }
              }
            }
          }
        }
      });

      if (!artifact) throw new Error(`Artifact for Job ${jobId} not found`);

      // 2. Telemetry Collector (Assuming we grab the session's batched metrics)
      const telemetryMetrics = artifact.job.session.metrics || {};

      // 3. AI Evidence Normalizer & Capability Mapper (Mocked deterministic evaluation)
      const evaluation = await aiEvaluator.evaluate({
        executionArtifacts: artifact,
        telemetryMetrics
      });

      const candidateId = artifact.job.session.candidateId;

      // 4. SkillGraph Writer
      for (const cap of evaluation.capabilities) {
        // Find actual capability in DB (For the mock, we assume generic taxonomy matching)
        // Let's grab any capability for the prototype if we don't have exact IDs mapped
        const dbCapability = await prisma.skillCapability.findFirst();
        
        if (dbCapability) {
          await skillGraphService.recordEvidence(candidateId, dbCapability.id, {
            score: cap.score,
            confidence: cap.confidence,
            source: evaluation.evaluatorVersion,
            reasoning: cap.reasoning,
            metadata: {
              jobId,
              sessionId: artifact.job.sessionId,
              exitCode: artifact.exitCode
            }
          });
          logger.info(`Persisted Evidence for Capability: ${dbCapability.name} -> ${cap.score}`);
        }
      }
      
      // We could emit an 'EvidenceExtracted' event here.

    } catch (e: any) {
      logger.error('Failed to extract evidence', e, { jobId });
    }
  }
}

// Auto-start the service to listen to events
export const evidenceExtractionService = new EvidenceExtractionService();
