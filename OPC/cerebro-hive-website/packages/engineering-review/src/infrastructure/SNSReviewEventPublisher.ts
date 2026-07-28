import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { EngineeringReviewReport } from '../EngineeringReviewReport';

/**
 * Publishes integration events to SNS when a review is published.
 *
 * This is the bridge between M26.1 (domain events) and M27 (analytics
 * pipeline). The M27 Evidence Warehouse subscribes to this topic via
 * SQS and projects the events into its dimensional model.
 *
 * Event types:
 *   - EngineeringReviewPublished: Emitted when a review transitions to Published state.
 *   - EngineeringReviewStale: Emitted when a freshness check determines the review is stale.
 */
export class SNSReviewEventPublisher {
  private readonly client: SNSClient;
  private readonly topicArn: string;

  constructor(topicArn: string, region?: string) {
    this.topicArn = topicArn;
    this.client = new SNSClient({ region: region ?? 'us-east-1' });
  }

  /**
   * Publish an EngineeringReviewPublished integration event.
   * The message body contains a denormalized snapshot of the review
   * suitable for downstream analytics projection.
   */
  async publishReviewPublished(review: EngineeringReviewReport): Promise<void> {
    const event = {
      eventType: 'EngineeringReviewPublished',
      eventId: `evt_${Date.now()}_${review.id}`,
      occurredAt: new Date().toISOString(),
      payload: {
        reviewId: review.id,
        workflowId: review.workflowId,
        reviewVersion: review.reviewVersion,
        state: review.state,
        verdict: review.verdict?.outcome,
        findingCount: review.findings.length,
        recommendationCount: review.recommendations.length,
        evidenceCount: review.evidenceRefs.length,
        manifestId: review.manifest.id,
        snapshotId: review.manifest.snapshotId,
        platformVersion: review.manifest.platformVersion,
        policyVersion: review.manifest.policyVersion,
        createdAt: review.createdAt,
        publishedAt: review.publishedAt,
      },
    };

    await this.client.send(
      new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify(event),
        MessageAttributes: {
          eventType: {
            DataType: 'String',
            StringValue: 'EngineeringReviewPublished',
          },
          workflowId: {
            DataType: 'String',
            StringValue: review.workflowId,
          },
        },
      })
    );
  }

  /**
   * Publish an EngineeringReviewStale integration event.
   * Triggered when a freshness check determines the review's
   * underlying policies or platform have changed.
   */
  async publishReviewStale(
    reviewId: string,
    reason: 'POLICY_CHANGED' | 'PLATFORM_CHANGED' | 'CONTRIBUTOR_UPGRADED' | 'WORKFLOW_CHANGED'
  ): Promise<void> {
    const event = {
      eventType: 'EngineeringReviewStale',
      eventId: `evt_${Date.now()}_${reviewId}`,
      occurredAt: new Date().toISOString(),
      payload: {
        reviewId,
        reason,
      },
    };

    await this.client.send(
      new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify(event),
        MessageAttributes: {
          eventType: {
            DataType: 'String',
            StringValue: 'EngineeringReviewStale',
          },
        },
      })
    );
  }
}
