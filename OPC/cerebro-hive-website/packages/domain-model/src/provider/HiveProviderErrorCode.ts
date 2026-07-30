/**
 * The shared platform failure taxonomy every `HiveProviderExecutor` must
 * translate its own provider-specific errors onto, per `ADR-027` (Failure
 * Handling and Retry Classification) and `04-PROVIDER-FRAMEWORK.md` §6.
 * `OperationTracker` (control-plane) classifies and retries based on this
 * normalized taxonomy — never on provider-specific error codes or messages
 * leaking through. The taxonomy itself extends only when a genuinely new
 * failure category is identified across providers, not per-provider special
 * cases (ADR-027 "Consequences").
 */
export const HiveProviderErrorCode = {
  QuotaExceeded: 'QuotaExceeded',
  RegionUnavailable: 'RegionUnavailable',
  AuthenticationFailed: 'AuthenticationFailed',
  ProvisioningTimeout: 'ProvisioningTimeout',
  InvalidSpecification: 'InvalidSpecification',
  TransientProviderFailure: 'TransientProviderFailure',
} as const;

export type HiveProviderErrorCode =
  (typeof HiveProviderErrorCode)[keyof typeof HiveProviderErrorCode];

/**
 * ADR-027's Retryable/Terminal split, fixed per error code rather than left
 * to each `HiveProviderExecutor` to decide independently — retry behavior
 * is a platform-wide architectural decision (ADR-027 §Context), not an
 * implementation detail. `OperationTracker` retries only codes classified
 * `Retryable` here.
 */
export const HIVE_PROVIDER_ERROR_RETRYABILITY: Readonly<
  Record<HiveProviderErrorCode, 'Retryable' | 'Terminal'>
> = {
  QuotaExceeded: 'Terminal',
  RegionUnavailable: 'Terminal',
  AuthenticationFailed: 'Terminal',
  ProvisioningTimeout: 'Retryable',
  InvalidSpecification: 'Terminal',
  TransientProviderFailure: 'Retryable',
};

/**
 * The normalized error shape a `HiveProviderExecutor` produces once it has
 * translated a provider-specific failure. `retryable` is derived from
 * `HIVE_PROVIDER_ERROR_RETRYABILITY`, not independently decided per call
 * site — kept as an explicit field (rather than requiring every caller to
 * re-look-up the table) so `OperationTracker` can branch on it directly.
 */
export interface HiveProviderError {
  readonly code: HiveProviderErrorCode;
  readonly retryable: boolean;
  readonly message: string;
  /** The raw, provider-specific error/response, kept only for diagnostics —
   * control-plane retry/terminal logic must never inspect this field
   * (ADR-027 §Context: "not from provider-specific error codes leaking
   * into control-plane logic"). */
  readonly providerErrorDetail?: unknown;
}
