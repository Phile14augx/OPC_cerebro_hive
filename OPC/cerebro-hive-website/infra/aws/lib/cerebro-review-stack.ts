import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sns_subs from 'aws-cdk-lib/aws-sns-subscriptions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

/**
 * CerebroHive Engineering Review Stack
 *
 * ALL resources are configured for AWS Free Tier:
 * - DynamoDB: On-Demand (25 RCU/WCU free forever)
 * - S3: Standard (5 GB free for 12 months)
 * - Lambda: (1M requests/month free forever)
 * - API Gateway: (1M calls/month free for 12 months)
 * - SNS: (1M publishes free forever)
 * - SQS: (1M requests free forever)
 *
 * Architecture mapping:
 * - DynamoDB → IEngineeringReviewRepository (aggregate persistence)
 * - S3       → IEvidenceStore (immutable evidence blobs)
 * - Lambda   → Review API handlers + ContributorHost
 * - SNS/SQS  → Integration events (ReviewPublished → Analytics pipeline)
 * - API GW   → M26.2 REST endpoints
 */
export class CerebroHiveReviewStack extends cdk.Stack {
  /** Exposed for adapter code to reference table/bucket names at build time. */
  public readonly reviewTable: dynamodb.Table;
  public readonly evidenceBucket: s3.Bucket;
  public readonly reviewEventsTopic: sns.Topic;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ─── DynamoDB: Engineering Review Repository ──────────────────────
    // Single-table design. PK = ReviewId, GSI-1 on workflowId for
    // findByWorkflow / findLatest queries. On-Demand billing stays
    // within the 25 WCU / 25 RCU always-free tier.
    this.reviewTable = new dynamodb.Table(this, 'EngineeringReviewTable', {
      tableName: 'cerebro-engineering-reviews',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
    });

    // GSI: Query reviews by workflowId (for findByWorkflow, findLatest)
    this.reviewTable.addGlobalSecondaryIndex({
      indexName: 'GSI-WorkflowId',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI: Query reviews by manifest ID (for findByManifest)
    this.reviewTable.addGlobalSecondaryIndex({
      indexName: 'GSI-ManifestId',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI: Query reviews by verdict outcome (for findByVerdict)
    this.reviewTable.addGlobalSecondaryIndex({
      indexName: 'GSI-Verdict',
      partitionKey: { name: 'GSI3PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI3SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ─── S3: Immutable Evidence Store ────────────────────────────────
    // Object Lock is not available on free tier, but versioning +
    // lifecycle rules provide practical immutability. Evidence blobs
    // are keyed by EvidenceReferenceId.
    this.evidenceBucket = new s3.Bucket(this, 'EvidenceBucket', {
      bucketName: `cerebro-evidence-store-${this.account}`,
      versioned: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [
        {
          // Move old evidence to Infrequent Access after 90 days
          // to reduce storage costs once free tier expires
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
      ],
    });

    // ─── SNS: Integration Event Topic ────────────────────────────────
    // Publishes EngineeringReviewPublished events. M27 analytics
    // pipeline subscribes here.
    this.reviewEventsTopic = new sns.Topic(this, 'ReviewEventsTopic', {
      topicName: 'cerebro-review-events',
      displayName: 'Cerebro Hive Engineering Review Events',
    });

    // ─── SQS: Analytics Projection Queue ─────────────────────────────
    // Dead-letter queue for failed projections
    const analyticsDLQ = new sqs.Queue(this, 'AnalyticsDLQ', {
      queueName: 'cerebro-analytics-dlq',
      retentionPeriod: cdk.Duration.days(14),
    });

    // Main analytics queue — receives ReviewPublished events from SNS
    const analyticsQueue = new sqs.Queue(this, 'AnalyticsProjectionQueue', {
      queueName: 'cerebro-analytics-projection',
      visibilityTimeout: cdk.Duration.seconds(30),
      deadLetterQueue: {
        maxReceiveCount: 3,
        queue: analyticsDLQ,
      },
    });

    // SNS → SQS subscription (fan-out for future consumers)
    this.reviewEventsTopic.addSubscription(
      new sns_subs.SqsSubscription(analyticsQueue)
    );

    // ─── Lambda: Review API Handler ──────────────────────────────────
    // Single Lambda function handling all M26.2 API routes.
    // 128MB memory keeps execution within free tier compute limits.
    const reviewApiHandler = new lambda.Function(this, 'ReviewApiHandler', {
      functionName: 'cerebro-review-api',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Cerebro Review API — Ready for adapter wiring' }),
          };
        };
      `),
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      environment: {
        REVIEW_TABLE_NAME: this.reviewTable.tableName,
        EVIDENCE_BUCKET_NAME: this.evidenceBucket.bucketName,
        REVIEW_EVENTS_TOPIC_ARN: this.reviewEventsTopic.topicArn,
      },
    });

    // Grant the Lambda permission to access DynamoDB, S3, and SNS
    this.reviewTable.grantReadWriteData(reviewApiHandler);
    this.evidenceBucket.grantRead(reviewApiHandler);
    this.reviewEventsTopic.grantPublish(reviewApiHandler);

    // ─── API Gateway: REST API ───────────────────────────────────────
    // Exposes the M26.2 endpoints. 1M calls/month free for 12 months.
    const api = new apigateway.RestApi(this, 'CerebroReviewApi', {
      restApiName: 'Cerebro Engineering Review API',
      description: 'M26.2 REST API for Engineering Review read models',
      deployOptions: {
        stageName: 'v1',
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(reviewApiHandler);

    // /api/v1/reviews/{reviewId}
    const reviews = api.root.addResource('reviews');
    const reviewById = reviews.addResource('{reviewId}');
    reviewById.addMethod('GET', lambdaIntegration);

    // /api/v1/reviews/{reviewId}/findings
    const findings = reviewById.addResource('findings');
    findings.addMethod('GET', lambdaIntegration);

    // /api/v1/reviews/{reviewId}/findings/{findingId}
    const findingById = findings.addResource('{findingId}');
    findingById.addMethod('GET', lambdaIntegration);

    // /api/v1/reviews/{reviewId}/contributors
    const contributors = reviewById.addResource('contributors');
    contributors.addMethod('GET', lambdaIntegration);

    // /api/v1/reviews/{reviewId}/evidence/{findingId}
    const evidence = reviewById.addResource('evidence');
    const evidenceByFinding = evidence.addResource('{findingId}');
    evidenceByFinding.addMethod('GET', lambdaIntegration);

    // /api/v1/reviews/{reviewId}/freshness/check
    const freshness = reviewById.addResource('freshness');
    const freshnessCheck = freshness.addResource('check');
    freshnessCheck.addMethod('POST', lambdaIntegration);

    // /api/v1/workflows/{workflowId}/reviews
    const workflows = api.root.addResource('workflows');
    const workflowById = workflows.addResource('{workflowId}');
    const workflowReviews = workflowById.addResource('reviews');
    workflowReviews.addMethod('GET', lambdaIntegration);

    // /api/v1/workflows/{workflowId}/reviews/compare
    const compare = workflowReviews.addResource('compare');
    compare.addMethod('GET', lambdaIntegration);

    // ─── Outputs ─────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'Cerebro Engineering Review API URL',
    });

    new cdk.CfnOutput(this, 'ReviewTableName', {
      value: this.reviewTable.tableName,
      description: 'DynamoDB table for engineering reviews',
    });

    new cdk.CfnOutput(this, 'EvidenceBucketName', {
      value: this.evidenceBucket.bucketName,
      description: 'S3 bucket for immutable evidence',
    });

    new cdk.CfnOutput(this, 'ReviewEventsTopicArn', {
      value: this.reviewEventsTopic.topicArn,
      description: 'SNS topic for review integration events',
    });
  }
}
