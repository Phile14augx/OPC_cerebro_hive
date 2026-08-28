import { DomainEventBus } from '../../infrastructure/events/eventBus';
import { Logger } from '../../infrastructure/observability/logger';

import { IAIEvaluatorProvider } from './providers/interfaces';
import { MockEvaluatorProvider } from './providers/MockEvaluatorProvider';
import { prisma } from '@cerebro/db';

const logger = new Logger('EvidenceExtractionService');

// Mock Provider injected for Stage 4
const aiEvaluator: IAIEvaluatorProvider = new MockEvaluatorProvider();

export class EvidenceExtractionService {
  constructor() {
    this.initializeEventSubscription();
  }

  private initializeEventSubscription() {
    DomainEventBus.subscribe<{jobId: string, exitCode: number}>('ExecutionCompleted', async (event) => {
      const { jobId } = event.payload as { jobId: string };
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

      const candidateId = artifact.job.session.candidate?.id;
      void candidateId;
      // 4. SkillGraph Writer
      for (const cap of evaluation.capabilities) {
        void cap;
        // BUG FIX (W0.2-SUP-146/147): prisma.skillCapability is missing from DB schema mock, we assume generic taxonomy matching)
        // BUG FIX (W0.2-SUP-146/147): prisma.skillCapability is missing from DB schema
        throw new Error("ERR_SCHEMA_MISSING: skillCapability schema is unavailable.");
      }
      
      // We could emit an 'EvidenceExtracted' event here.

} catch (e: unknown) {
      logger.error('Failed to extract evidence', e, { jobId });
    }
  }
}

// Auto-start the service to listen to events
export const evidenceExtractionService = new EvidenceExtractionService();
