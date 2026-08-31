import { ReasonCode, Severity } from '../types.js';

export class PublicationDeniedError extends Error {
  public readonly code: ReasonCode;
  public readonly severity: Severity = 'FATAL';
  
  constructor(
    message: string,
    public readonly evidenceRefs: string[] = [],
    code: ReasonCode | 'PUBLICATION_NOT_AUTHORIZED' = 'CAS_CONFLICT'
  ) {
    super(message);
    this.name = 'PublicationDeniedError';
    // Use CAS_CONFLICT if PUBLICATION_NOT_AUTHORIZED is not in the type definitions,
    // though the instructions refer to both.
    this.code = (code === 'PUBLICATION_NOT_AUTHORIZED') ? 'CAS_CONFLICT' : code as ReasonCode;
  }
}

export interface AtomicReplaceResult {
  readonly replaced: boolean;
  readonly targetPath: string;
  readonly bytesWritten: number;
  readonly resultingSha256: string;
  readonly timestampUtc: string;
}

export interface LiveControlWriteAdapter {
  readonly capability: 'LIVE_WRITE' | 'FIXTURE_ONLY' | 'DISABLED';
  readonly isLiveCapable: boolean;
  
  atomicReplace(
    targetPath: string,
    candidateBytes: Buffer | string,
    expectedPreviousSha256: string
  ): Promise<AtomicReplaceResult>;
}

export class DisabledWriteAdapter implements LiveControlWriteAdapter {
  public readonly capability = 'DISABLED' as const;
  public readonly isLiveCapable = false as const;

  public async atomicReplace(
    targetPath: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    candidateBytes: Buffer | string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    expectedPreviousSha256: string
  ): Promise<AtomicReplaceResult> {
    throw new PublicationDeniedError(
      `Publication write denied: publisher is compiled with LIVE_WRITE_CAPABILITY = false. Target '${targetPath}' was NOT modified.`,
      [targetPath],
      'PUBLICATION_NOT_AUTHORIZED'
    );
  }
}

export interface PublicationRequest {
  readonly targetControlPath: string;
  readonly canonicalProposalBytes: string | Buffer;
  readonly expectedPreviousSha256: string;
}

export interface PublicationResult {
  readonly receipt: AtomicReplaceResult;
}

export interface GovernorAuthorizationToken {
  readonly isValid: boolean;
}

export interface PublisherOptions {
  readonly writeAdapter?: LiveControlWriteAdapter;
  readonly requireGovernorToken?: boolean;
}

export class Publisher {
  public static readonly LIVE_WRITE_CAPABILITY: boolean = false;
  private readonly writeAdapter: LiveControlWriteAdapter;

  constructor(options: PublisherOptions = {}) {
    this.writeAdapter = options.writeAdapter ?? new DisabledWriteAdapter();
  }

  public get isLiveWriteCapable(): boolean {
    return Publisher.LIVE_WRITE_CAPABILITY && this.writeAdapter.isLiveCapable;
  }

  public async publish(
    request: PublicationRequest,
    governorToken?: GovernorAuthorizationToken
  ): Promise<PublicationResult> {
    if (!this.writeAdapter.isLiveCapable) {
      throw new PublicationDeniedError(
        'PUBLICATION_NOT_AUTHORIZED: Publisher runtime write capability is disabled by default.',
        [request.targetControlPath],
        'PUBLICATION_NOT_AUTHORIZED'
      );
    }

    if (!governorToken || !governorToken.isValid) {
      throw new PublicationDeniedError(
        'PUBLICATION_NOT_AUTHORIZED: Missing or invalid Portfolio Governor publication token.',
        [request.targetControlPath],
        'PUBLICATION_NOT_AUTHORIZED'
      );
    }

    return await this.executeAtomicPublication(request, governorToken);
  }

  private async executeAtomicPublication(
    request: PublicationRequest,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    governorToken: GovernorAuthorizationToken
  ): Promise<PublicationResult> {
    const receipt = await this.writeAdapter.atomicReplace(
      request.targetControlPath,
      request.canonicalProposalBytes,
      request.expectedPreviousSha256
    );
    return { receipt };
  }
}
