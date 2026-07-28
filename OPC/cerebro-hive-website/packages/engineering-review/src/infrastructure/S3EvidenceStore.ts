import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';

/**
 * S3-backed immutable evidence store.
 *
 * Evidence blobs are keyed by EvidenceReferenceId and stored as
 * versioned, server-side-encrypted objects. Once written, evidence
 * is never overwritten or deleted — new versions create new S3
 * object versions.
 *
 * This is the infrastructure adapter for the IEvidenceStore port
 * described in M26.1 ADR-007 (persistence split: operational DB
 * handles review metadata; evidence store handles immutable blobs).
 */
export class S3EvidenceStore {
  private readonly client: S3Client;
  private readonly bucketName: string;

  constructor(bucketName: string, region?: string) {
    this.bucketName = bucketName;
    this.client = new S3Client({ region: region ?? 'us-east-1' });
  }

  /**
   * Store an immutable evidence blob.
   * Key format: evidence/<evidenceReferenceId>.json
   *
   * ContentType is always application/json for structured evidence.
   * The bucket has versioning enabled, so re-puts create new versions
   * rather than overwriting.
   */
  async store(evidenceReferenceId: string, payload: Record<string, unknown>): Promise<string> {
    const key = `evidence/${evidenceReferenceId}.json`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: JSON.stringify(payload, null, 2),
        ContentType: 'application/json',
        Metadata: {
          'evidence-reference-id': evidenceReferenceId,
          'stored-at': new Date().toISOString(),
        },
      })
    );

    return key;
  }

  /**
   * Retrieve an evidence blob by its reference ID.
   * Returns the parsed JSON payload, or undefined if not found.
   */
  async retrieve(evidenceReferenceId: string): Promise<Record<string, unknown> | undefined> {
    const key = `evidence/${evidenceReferenceId}.json`;

    try {
      const result = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );

      if (!result.Body) return undefined;

      const bodyString = await this.streamToString(result.Body as Readable);
      return JSON.parse(bodyString);
    } catch (err: any) {
      if (err.name === 'NoSuchKey') return undefined;
      throw err;
    }
  }

  /**
   * Check if evidence exists without downloading the payload.
   * Useful for validation and reference integrity checks.
   */
  async exists(evidenceReferenceId: string): Promise<boolean> {
    const key = `evidence/${evidenceReferenceId}.json`;

    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
      return true;
    } catch (err: any) {
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw err;
    }
  }

  /**
   * Store an exported review report (PDF, SARIF, Markdown).
   * Key format: exports/<reviewId>/<filename>
   */
  async storeExport(
    reviewId: string,
    filename: string,
    body: Buffer | string,
    contentType: string
  ): Promise<string> {
    const key = `exports/${reviewId}/${filename}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: typeof body === 'string' ? Buffer.from(body) : body,
        ContentType: contentType,
        Metadata: {
          'review-id': reviewId,
          'exported-at': new Date().toISOString(),
        },
      })
    );

    return key;
  }

  private async streamToString(stream: Readable): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
  }
}
