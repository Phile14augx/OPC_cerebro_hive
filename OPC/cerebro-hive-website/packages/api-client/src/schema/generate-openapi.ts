import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import * as fs from 'fs';
import * as path from 'path';
import {
  EngineeringReviewSummarySchema,
  FindingDetailSchema,
  EvidenceSchema,
  ContributorResultSchema,
  FreshnessStatusSchema
} from './review.schema';
import { z } from 'zod';

const registry = new OpenAPIRegistry();

// Register Zod schemas through the registry API so they become OpenAPI components.
const engineeringReviewSummary = registry.register('EngineeringReviewSummary', EngineeringReviewSummarySchema);
const findingDetail = registry.register('FindingDetail', FindingDetailSchema);
const evidence = registry.register('Evidence', EvidenceSchema);
const contributorResult = registry.register('ContributorResult', ContributorResultSchema);
registry.register('FreshnessStatus', FreshnessStatusSchema);

// Define API Key or Bearer Security (Cognito Phase 3 prep)
const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// v1 Routes
registry.registerPath({
  method: 'get',
  path: '/v1/reviews/{id}',
  summary: 'Get an Engineering Review',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ id: z.string() })
  },
  responses: {
    200: {
      description: 'The review summary',
      content: { 'application/json': { schema: engineeringReviewSummary } }
    },
    404: { description: 'Review not found' }
  }
});

registry.registerPath({
  method: 'get',
  path: '/v1/workflows/{workflowId}/reviews',
  summary: 'List reviews for a workflow',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ workflowId: z.string() })
  },
  responses: {
    200: {
      description: 'List of reviews',
      content: { 'application/json': { schema: z.array(engineeringReviewSummary) } }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/v1/reviews/{reviewId}/findings',
  summary: 'Get findings for a review',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ reviewId: z.string() })
  },
  responses: {
    200: {
      description: 'List of findings',
      content: { 'application/json': { schema: z.array(findingDetail) } }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/v1/reviews/{reviewId}/evidence/{findingId}',
  summary: 'Get evidence for a finding',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ reviewId: z.string(), findingId: z.string() })
  },
  responses: {
    200: {
      description: 'List of evidence artifacts',
      content: { 'application/json': { schema: z.array(evidence) } }
    }
  }
});

registry.registerPath({
  method: 'get',
  path: '/v1/reviews/{reviewId}/contributors',
  summary: 'Get contributors for a review',
  security: [{ [bearerAuth.name]: [] }],
  request: {
    params: z.object({ reviewId: z.string() })
  },
  responses: {
    200: {
      description: 'List of contributor results',
      content: { 'application/json': { schema: z.array(contributorResult) } }
    }
  }
});

const generator = new OpenApiGeneratorV3(registry.definitions);

const document = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'CerebroHive Engineering Review API',
    description: 'API for interacting with the Engineering Review Domain (M26)'
  },
  servers: [{ url: 'https://vtbrbb44kd.execute-api.ap-south-1.amazonaws.com' }]
});

// Write to the root of the api-client package
const outPath = path.resolve(process.cwd(), 'openapi.json');
fs.writeFileSync(outPath, JSON.stringify(document, null, 2), 'utf-8');
console.log('Successfully generated openapi.json at ' + outPath);
