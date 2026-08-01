/**
 * Identity value objects — ADR 0011 (D9).
 *
 * The Blueprint treats stable identity as the platform cornerstone. The failure
 * this file exists to prevent is passing an artifact id where a blob id belongs,
 * or a finding signature where an artifact id belongs — mistakes that are
 * invisible when every identifier is `string`, and expensive once persisted.
 *
 * Every id is a branded type. They are structurally incompatible with each other
 * and with raw `string`, so misuse is a compile error rather than a support ticket.
 */

declare const brand: unique symbol;

/** Nominal typing helper. `Branded<string, 'X'>` is not assignable to `string`. */
export type Branded<T, B extends string> = T & { readonly [brand]: B };

// ---------------------------------------------------------------------------
// The four identity types of ADR 0011. These are NOT interchangeable.
// ---------------------------------------------------------------------------

/** Content address of a byte sequence. `b3:<blake3-256>`. Equal bytes ⇒ equal id. */
export type BlobId = Branded<string, 'BlobId'>;

/** Logical output of a job. Opaque ULID. Two jobs producing identical bytes yield two ArtifactIds and one BlobId. */
export type ArtifactId = Branded<string, 'ArtifactId'>;

/**
 * Semantic identity of a finding across runs — `sig:<type>.v<n>:<blake3-128>`.
 * Deliberately excludes measured values, run metadata, position and presentation.
 */
export type FindingSignature = Branded<string, 'FindingSignature'>;

/** Hash over (flowVersion, revision, params, tool digests, pdk, seed). Answers "has this exact computation run?" */
export type ReproducibilityKey = Branded<string, 'ReproducibilityKey'>;

// ---------------------------------------------------------------------------
// Entity identifiers
// ---------------------------------------------------------------------------

export type OrgId = Branded<string, 'OrgId'>;
export type ProjectId = Branded<string, 'ProjectId'>;
export type UserId = Branded<string, 'UserId'>;
export type RepositoryId = Branded<string, 'RepositoryId'>;
export type RevisionId = Branded<string, 'RevisionId'>;
export type DesignUnitId = Branded<string, 'DesignUnitId'>;
export type FlowRunId = Branded<string, 'FlowRunId'>;
export type JobId = Branded<string, 'JobId'>;
export type PdkId = Branded<string, 'PdkId'>;
export type PluginId = Branded<string, 'PluginId'>;
export type AgentRunId = Branded<string, 'AgentRunId'>;
export type GraphNodeId = Branded<string, 'GraphNodeId'>;

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

const ULID_RE = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
const BLOB_RE = /^b3:[0-9a-f]{64}$/;
const SIGNATURE_RE = /^sig:[a-z_]+\.v\d+:[0-9a-f]{32}$/;
const REPRO_RE = /^[0-9a-f]{32}$/;

export class InvalidIdentifierError extends Error {
  constructor(kind: string, value: string) {
    // Values are truncated: identifiers appear in logs, and some carry design
    // hierarchy paths that are export-controlled (ADR 0010).
    super(`Invalid ${kind}: ${value.slice(0, 16)}${value.length > 16 ? '…' : ''}`);
    this.name = 'InvalidIdentifierError';
  }
}

function prefixed<T extends string>(kind: string, prefix: string) {
  return (raw: string): Branded<string, T> => {
    if (!raw.startsWith(`${prefix}_`) || !ULID_RE.test(raw.slice(prefix.length + 1))) {
      throw new InvalidIdentifierError(kind, raw);
    }
    return raw as Branded<string, T>;
  };
}

export const OrgId = prefixed<'OrgId'>('OrgId', 'org');
export const ProjectId = prefixed<'ProjectId'>('ProjectId', 'prj');
export const UserId = prefixed<'UserId'>('UserId', 'usr');
export const RepositoryId = prefixed<'RepositoryId'>('RepositoryId', 'repo');
export const RevisionId = prefixed<'RevisionId'>('RevisionId', 'rev');
export const DesignUnitId = prefixed<'DesignUnitId'>('DesignUnitId', 'du');
export const FlowRunId = prefixed<'FlowRunId'>('FlowRunId', 'run');
export const JobId = prefixed<'JobId'>('JobId', 'job');
export const PdkId = prefixed<'PdkId'>('PdkId', 'pdk');
export const PluginId = prefixed<'PluginId'>('PluginId', 'plg');
export const AgentRunId = prefixed<'AgentRunId'>('AgentRunId', 'agr');
export const ArtifactId = prefixed<'ArtifactId'>('ArtifactId', 'art');
export const GraphNodeId = prefixed<'GraphNodeId'>('GraphNodeId', 'gn');

export const BlobId = (raw: string): BlobId => {
  if (!BLOB_RE.test(raw)) throw new InvalidIdentifierError('BlobId', raw);
  return raw as BlobId;
};

export const FindingSignature = (raw: string): FindingSignature => {
  if (!SIGNATURE_RE.test(raw)) throw new InvalidIdentifierError('FindingSignature', raw);
  return raw as FindingSignature;
};

export const ReproducibilityKey = (raw: string): ReproducibilityKey => {
  if (!REPRO_RE.test(raw)) throw new InvalidIdentifierError('ReproducibilityKey', raw);
  return raw as ReproducibilityKey;
};

/**
 * Parse the version out of a signature.
 *
 * ADR 0011 requires that comparison across signature versions be refused rather
 * than silently wrong: a v1 and a v2 signature for the same underlying finding
 * are different strings, so naive comparison reports every finding as new.
 */
export function signatureVersion(sig: FindingSignature): { type: string; version: number } {
  const [, typed] = sig.split(':', 2) as [string, string];
  const [type, v] = typed.split('.v') as [string, string];
  return { type, version: Number(v) };
}

/** Comparing signatures of differing versions is a bug. Fail loudly. */
export function assertComparable(a: FindingSignature, b: FindingSignature): void {
  const va = signatureVersion(a);
  const vb = signatureVersion(b);
  if (va.type !== vb.type || va.version !== vb.version) {
    throw new Error(
      `Refusing to compare ${va.type}.v${String(va.version)} with ${vb.type}.v${String(vb.version)}. ` +
        'Cross-version comparison requires an equivalence map (ADR 0011).',
    );
  }
}
