/**
 * Lifecycle hooks for transformers. Implementing these is optional.
 * The engine will call them when a transformer is loaded or unloaded.
 */
export interface ITransformerLifecycle {
  /** Called once after the transformer is registered and loaded. */
  onLoad?(): Promise<void>;

  /** Called once before the transformer is unregistered and unloaded. */
  onUnload?(): Promise<void>;
}

/** The state a transformer can be in within the engine. */
export type TransformerState = 'unloaded' | 'loading' | 'loaded' | 'unloading' | 'error';

/** Entry stored in the registry. */
export interface TransformerRegistryEntry {
  readonly transformerName: string;
  readonly version: string;
  state: TransformerState;
  loadedAt?: number;
  error?: Error;
}
