import { DynamoDBEngineeringReviewRepository } from '../../packages/engineering-review/src/infrastructure/DynamoDBEngineeringReviewRepository';
import { S3EvidenceStore } from '../../packages/engineering-review/src/infrastructure/S3EvidenceStore';
import { SNSReviewEventPublisher } from '../../packages/engineering-review/src/infrastructure/SNSReviewEventPublisher';
import { EngineeringReviewReport } from '../../packages/engineering-review/src/EngineeringReviewReport';
import { createReviewManifest, createEvidenceReference, createReviewFinding, createReviewRecommendation, createReviewVerdict } from '../../packages/engineering-review/src/valueObjects';
import { newReviewId, newManifestId, newEvidenceReferenceId, newFindingId, newRecommendationId } from '../../packages/engineering-review/src/ids';

const REGION = 'ap-south-1';
const TABLE_NAME = 'cerebro-engineering-reviews';
const BUCKET_NAME = 'cerebro-evidence-store-020811135146';
const SNS_TOPIC_ARN = 'arn:aws:sns:ap-south-1:020811135146:cerebro-review-events';

async function run() {
  console.log('--- Starting AWS Integration Verification ---\n');

  // 1. S3 Evidence Store
  console.log('1. Testing S3EvidenceStore...');
  const s3 = new S3EvidenceStore(BUCKET_NAME, REGION);
  const evidenceRefId = newEvidenceReferenceId();
  const testPayload = { test: 'data', timestamp: Date.now() };
  
  await s3.store(evidenceRefId, testPayload);
  console.log(` ✅ Uploaded evidence blob: ${evidenceRefId}`);
  
  const retrieved = await s3.retrieve(evidenceRefId);
  if (retrieved?.test === 'data') {
    console.log(` ✅ Retrieved evidence blob successfully`);
  } else {
    throw new Error('Evidence retrieval mismatch');
  }

  // 2. DynamoDB Repository (CRUD, GSIs, Rehydration)
  console.log('\n2. Testing DynamoDBEngineeringReviewRepository...');
  const repo = new DynamoDBEngineeringReviewRepository(TABLE_NAME, REGION);
  
  const manifest = createReviewManifest({
    id: newManifestId(),
    workflowId: 'wf_integration_test',
    workflowVersionId: 'v1',
    capabilityRegistrySnapshotId: 'reg_1',
    platformVersion: '1.0.0',
    snapshotId: 'snap_1'
  });
  
  const review = EngineeringReviewReport.create({
    id: newReviewId(),
    workflowId: 'wf_integration_test',
    reviewVersion: 1,
    manifest
  });

  const evidence = createEvidenceReference({
    id: evidenceRefId,
    description: 'Test evidence',
    provenance: { sourceSystem: 'workflow-graph', sourceElementId: 'node_1', retrievedAt: new Date().toISOString() }
  });
  
  review.addEvidence(evidence);
  review.collectEvidence();
  
  const finding = createReviewFinding({
    id: newFindingId(),
    evidenceRefs: [evidenceRefId],
    severity: 'high',
    confidence: 'high',
    message: 'Test finding'
  });
  review.addFinding(finding);
  review.completeEvaluation();
  review.generateRecommendations();
  
  const verdict = createReviewVerdict({
    outcome: 'needs-attention',
    recommendationRefs: [],
    summary: 'Integration test verdict'
  });
  review.decideVerdict(verdict);
  review.publish();

  console.log(` ✅ Created complete aggregate (ID: ${review.id})`);
  
  await repo.save(review);
  console.log(` ✅ Saved aggregate to DynamoDB (PK: REVIEW#${review.id})`);
  
  const loaded = await repo.load(review.id);
  if (loaded && loaded.state === 'Published' && loaded.findings.length === 1) {
    console.log(` ✅ Loaded and rehydrated aggregate perfectly from DynamoDB`);
  } else {
    throw new Error('Failed to load/rehydrate aggregate');
  }

  const byWorkflow = await repo.findByWorkflow('wf_integration_test');
  if (byWorkflow.length > 0) {
    console.log(` ✅ GSI query successful: findByWorkflow`);
  } else {
    throw new Error('GSI query findByWorkflow failed');
  }

  // 3. SNS Event Publisher
  console.log('\n3. Testing SNSReviewEventPublisher...');
  const sns = new SNSReviewEventPublisher(SNS_TOPIC_ARN, REGION);
  await sns.publishReviewPublished(loaded!);
  console.log(` ✅ Published EngineeringReviewPublished event to SNS`);

  console.log('\n--- All Integration Verifications Passed! ---');
}

run().catch(err => {
  console.error('Integration verification failed:', err);
  process.exit(1);
});
