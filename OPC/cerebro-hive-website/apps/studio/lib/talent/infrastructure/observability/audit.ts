/**
 * Business Audit Logger
 * Separates immutable business events (compliance, auditing) from operational debug logs.
 */
import { Logger } from './logger';
import { PrismaClient } from '@prisma/client';

const operationalLogger = new Logger('Audit_Service');
const prisma = new PrismaClient();

export type AuditEventType = 
  | 'ASSESSMENT_CREATED'
  | 'ASSESSMENT_PUBLISHED'
  | 'CANDIDATE_INVITED'
  | 'CANDIDATE_SUBMITTED'
  | 'SKILL_PROFILE_GENERATED'
  | 'RECRUITER_RECOMMENDATION_VIEWED';

export class AuditLogger {
  
  /**
   * Records a business-critical audit event.
   * In a full enterprise system, this often writes to a dedicated immutable ledger or WORM storage.
   */
  static async log(eventType: AuditEventType, actorId: string, resourceId: string, metadata?: any) {
    try {
      // We log to stdout as structured JSON so Datadog/ELK can ingest it as an Audit event
      console.log(JSON.stringify({
        __AUDIT_EVENT__: true,
        timestamp: new Date().toISOString(),
        eventType,
        actorId,
        resourceId,
        metadata
      }));

      // Optionally, we could also persist this to the `TelemetryEvent` or a dedicated `AuditEvent` table
      // if we want it immediately queryable inside Talent OS without relying on external log aggregators.
      
    } catch (e) {
      // Audit log failures should be explicitly flagged in operational logs
      operationalLogger.error(`Failed to record audit event: ${eventType}`, e);
    }
  }
}
