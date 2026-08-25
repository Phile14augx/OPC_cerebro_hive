import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBEngineeringReviewRepository } from '../DynamoDBEngineeringReviewRepository';
import { S3EvidenceStore } from '../S3EvidenceStore';
import { EngineeringReviewReport } from '../../EngineeringReviewReport';
import { 
  EngineeringReviewSummarySchema, 
  FindingDetailSchema, 
  EvidenceSchema, 
  ContributorResultSchema 
} from '@cerebro/api-client/src/schema/review.schema';
import { z } from 'zod';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { createLogger } from '../logger';
import crypto from 'crypto';

const tracer = trace.getTracer('cerebro-engineering-review-api');

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const ddbClient = new DynamoDBClient({});
const s3Client = new S3Client({});

const reviewTableName = requireEnv('REVIEW_TABLE_NAME');
const evidenceBucketName = requireEnv('EVIDENCE_BUCKET_NAME');

const reviewRepo = new DynamoDBEngineeringReviewRepository(
  ddbClient,
  reviewTableName
);

const evidenceStore = new S3EvidenceStore(
  s3Client,
  evidenceBucketName
);

function mapToSummary(review: EngineeringReviewReport) {
  const result = {
    id: review.id,
    workflowId: review.workflowId,
    reviewVersion: review.reviewVersion,
    state: review.state,
    createdAt: review.createdAt.toISOString(),
    publishedAt: review.publishedAt?.toISOString(),
    verdict: review.verdict ? {
      outcome: review.verdict.outcome,
      summary: review.verdict.summary
    } : undefined,
    findingCount: review.getFindings().length,
    evidenceCount: review.getFindings().reduce((acc, f) => acc + f.evidenceRefs.length, 0)
  };
  return EngineeringReviewSummarySchema.parse(result);
}

function mapToFinding(finding: Record<string, unknown>) {
  return FindingDetailSchema.parse({
    id: finding.id,
    severity: finding.severity,
    confidence: finding.confidence,
    message: finding.message,
    evidenceRefs: finding.evidenceRefs
  });
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const correlationId = event.headers['x-correlation-id'] || crypto.randomUUID();
  const logger = createLogger(correlationId);
  
  return tracer.startActiveSpan(`API ${event.httpMethod} ${event.resource}`, async (span) => {
    span.setAttribute('correlationId', correlationId);
    span.setAttribute('http.method', event.httpMethod);
    span.setAttribute('http.route', event.resource);

    try {
      logger.info('Received API Request', { 
        method: event.httpMethod, 
        resource: event.resource, 
        pathParameters: event.pathParameters 
      });

      const { resource, httpMethod, pathParameters } = event;

      if (httpMethod === 'GET') {
      if (resource === '/reviews/{reviewId}') {
        const id = pathParameters?.reviewId;
        if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'reviewId is required' }) };
        
        const review = await reviewRepo.findById(id);
        if (!review) return { statusCode: 404, body: 'Not Found' };
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(mapToSummary(review))
        };
      }

      if (resource === '/workflows/{workflowId}/reviews') {
        const workflowId = pathParameters?.workflowId;
        if (!workflowId) return { statusCode: 400, body: JSON.stringify({ error: 'workflowId is required' }) };
        
        const reviews = await reviewRepo.findByWorkflow(workflowId);
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(reviews.map(mapToSummary))
        };
      }

      if (resource === '/reviews/{reviewId}/findings') {
        const id = pathParameters?.reviewId;
        if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'reviewId is required' }) };
        
        const review = await reviewRepo.findById(id);
        if (!review) return { statusCode: 404, body: 'Not Found' };
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(review.getFindings().map(mapToFinding))
        };
      }

      if (resource === '/reviews/{reviewId}/contributors') {
        const id = pathParameters?.reviewId;
        if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'reviewId is required' }) };
        
        const review = await reviewRepo.findById(id);
        if (!review) return { statusCode: 404, body: 'Not Found' };
        
        const results = review.getContributorResults().map(c => ContributorResultSchema.parse({
          agentId: c.agentId,
          agentVersion: c.agentVersion,
          findingsProduced: c.findingsProduced,
          executionTimeMs: c.executionTimeMs,
          completedAt: c.completedAt.toISOString()
        }));

        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(results)
        };
      }

      if (resource === '/reviews/{reviewId}/evidence/{findingId}') {
        const reviewId = pathParameters?.reviewId;
        const findingId = pathParameters?.findingId;
        if (!reviewId || !findingId) return { statusCode: 400, body: JSON.stringify({ error: 'reviewId and findingId are required' }) };
        
        const review = await reviewRepo.findById(reviewId);
        if (!review) return { statusCode: 404, body: 'Review Not Found' };
        
        const finding = review.getFindings().find(f => f.id === findingId);
        if (!finding) return { statusCode: 404, body: 'Finding Not Found' };

        const evidencePayloads = await Promise.all(
          finding.evidenceRefs.map(async (refId) => {
            const blob = await evidenceStore.getEvidence(refId);
            return EvidenceSchema.parse({
              id: refId,
              description: blob?.metadata.schema || 'Unknown Evidence',
              provenance: {
                sourceSystem: blob?.metadata.sourceSystem || 'Unknown',
                sourceElementId: blob?.metadata.sourceElementId || 'Unknown',
                retrievedAt: blob?.metadata.retrievedAt || new Date().toISOString()
              },
              payload: blob?.payload
            });
          })
        );
        
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify(evidencePayloads)
        };
      }
    }

    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: `Unsupported route: ${httpMethod} ${resource}` })
    };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Internal API Contract Violation', details: error.errors })
      };
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    logger.error('Unhandled API Error', { error: message, stack });
    span.recordException(error as Error);
    span.setStatus({ code: SpanStatusCode.ERROR, message: message });
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  } finally {
    span.end();
  }
  });
};
