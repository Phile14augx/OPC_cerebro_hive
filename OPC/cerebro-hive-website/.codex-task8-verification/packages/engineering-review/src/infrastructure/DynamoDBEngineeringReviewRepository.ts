import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { EngineeringReviewReport, ReviewState } from '../EngineeringReviewReport';
import { IEngineeringReviewRepository } from '../ports/IEngineeringReviewRepository';
import { ReviewId } from '../ids';
import {
  ReviewOutcome,
  EvidenceReference,
  ReviewFinding,
  ReviewRecommendation,
  ReviewManifest,
  ReviewVerdict,
  Timestamp,
} from '../valueObjects';

/**
 * DynamoDB single-table design for EngineeringReviewReport persistence.
 *
 * Key schema:
 *   PK    = REVIEW#<reviewId>
 *   SK    = REVIEW#<reviewId>         (aggregate root item)
 *
 * GSIs:
 *   GSI-WorkflowId:
 *     GSI1PK = WORKFLOW#<workflowId>
 *     GSI1SK = VERSION#<reviewVersion> (enables findLatest via ScanIndexForward=false, Limit=1)
 *
 *   GSI-ManifestId:
 *     GSI2PK = MANIFEST#<manifestId>
 *
 *   GSI-Verdict:
 *     GSI3PK = VERDICT#<outcome>
 *     GSI3SK = REVIEW#<reviewId>
 *
 * Serialization strategy (Phase 5 §1):
 *   The aggregate is serialized into a single DynamoDB item. All nested
 *   value objects (findings, recommendations, evidence refs, manifest,
 *   verdict) are stored as JSON attributes on the item. Reconstruction
 *   uses EngineeringReviewReport.rehydrate(), which bypasses lifecycle
 *   gates — the same contract used by InMemoryEngineeringReviewRepository.
 */
export class DynamoDBEngineeringReviewRepository implements IEngineeringReviewRepository {
  private readonly client: DynamoDBClient;
  private readonly tableName: string;

  constructor(tableName: string, region?: string) {
    this.tableName = tableName;
    this.client = new DynamoDBClient({ region: region ?? 'us-east-1' });
  }

  async save(review: EngineeringReviewReport): Promise<void> {
    const item = this.serialize(review);
    await this.client.send(
      new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(item, { removeUndefinedValues: true }),
      })
    );
  }

  async load(id: ReviewId): Promise<EngineeringReviewReport | undefined> {
    const result = await this.client.send(
      new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({
          PK: `REVIEW#${id}`,
          SK: `REVIEW#${id}`,
        }),
      })
    );

    if (!result.Item) return undefined;
    return this.deserialize(unmarshall(result.Item));
  }

  async findLatest(workflowId: string): Promise<EngineeringReviewReport | undefined> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI-WorkflowId',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: marshall({ ':pk': `WORKFLOW#${workflowId}` }),
        ScanIndexForward: false, // descending by reviewVersion
        Limit: 1,
      })
    );

    if (!result.Items || result.Items.length === 0) return undefined;
    return this.deserialize(unmarshall(result.Items[0]));
  }

  async findByWorkflow(workflowId: string): Promise<readonly EngineeringReviewReport[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI-WorkflowId',
        KeyConditionExpression: 'GSI1PK = :pk',
        ExpressionAttributeValues: marshall({ ':pk': `WORKFLOW#${workflowId}` }),
        ScanIndexForward: false,
      })
    );

    if (!result.Items) return [];
    return result.Items.map((item: any) => this.deserialize(unmarshall(item)));
  }

  async findByManifest(manifestId: string): Promise<EngineeringReviewReport | undefined> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI-ManifestId',
        KeyConditionExpression: 'GSI2PK = :pk',
        ExpressionAttributeValues: marshall({ ':pk': `MANIFEST#${manifestId}` }),
        Limit: 1,
      })
    );

    if (!result.Items || result.Items.length === 0) return undefined;
    return this.deserialize(unmarshall(result.Items[0]));
  }

  async findByVerdict(outcome: ReviewOutcome): Promise<readonly EngineeringReviewReport[]> {
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI-Verdict',
        KeyConditionExpression: 'GSI3PK = :pk',
        ExpressionAttributeValues: marshall({ ':pk': `VERDICT#${outcome}` }),
      })
    );

    if (!result.Items) return [];
    return result.Items.map((item: any) => this.deserialize(unmarshall(item)));
  }

  // ─── Serialization ──────────────────────────────────────────────────

  private serialize(review: EngineeringReviewReport): Record<string, unknown> {
    return {
      // Keys
      PK: `REVIEW#${review.id}`,
      SK: `REVIEW#${review.id}`,

      // GSI keys
      GSI1PK: `WORKFLOW#${review.workflowId}`,
      GSI1SK: `VERSION#${String(review.reviewVersion).padStart(10, '0')}`,
      GSI2PK: `MANIFEST#${review.manifest.id}`,
      GSI3PK: review.verdict ? `VERDICT#${review.verdict.outcome}` : undefined,
      GSI3SK: review.verdict ? `REVIEW#${review.id}` : undefined,

      // Aggregate data
      reviewId: review.id,
      workflowId: review.workflowId,
      reviewVersion: review.reviewVersion,
      state: review.state,
      createdAt: review.createdAt,
      publishedAt: review.publishedAt,

      // Nested value objects (stored as JSON)
      manifest: review.manifest,
      evidenceRefs: review.evidenceRefs,
      findings: review.findings,
      recommendations: review.recommendations,
      verdict: review.verdict,

      // Entity type discriminator (useful for future single-table patterns)
      entityType: 'EngineeringReviewReport',
    };
  }

  private deserialize(item: Record<string, unknown>): EngineeringReviewReport {
    return EngineeringReviewReport.rehydrate({
      id: item.reviewId as ReviewId,
      workflowId: item.workflowId as string,
      reviewVersion: item.reviewVersion as number,
      manifest: item.manifest as ReviewManifest,
      createdAt: item.createdAt as Timestamp,
      state: item.state as ReviewState,
      evidenceRefs: (item.evidenceRefs ?? []) as EvidenceReference[],
      findings: (item.findings ?? []) as ReviewFinding[],
      recommendations: (item.recommendations ?? []) as ReviewRecommendation[],
      verdict: item.verdict as ReviewVerdict | undefined,
      publishedAt: item.publishedAt as Timestamp | undefined,
    });
  }
}
