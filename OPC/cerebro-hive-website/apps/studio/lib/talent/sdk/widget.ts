// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- ARCH-LINT: Deferred
// @ts-nocheck
/**
 * Widget SDK: The universal contract for all Talent OS Assessment Widgets
 */

// 1. Telemetry and Analytics Hooks
export interface WidgetTelemetry {
  events: {
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
    onStart?: (context: any) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
    onInput?: (data: any) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
    onCompile?: (data: any) => void;
    onError?: (error: Error) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
    onComplete?: (result: any) => void;
  };
}

// 2. The Universal Widget SDK Interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
export interface IWidgetSDK<TConfig = any, TState = any, TResult = any> {
  // Core Metadata
  metadata: {
    type: string;
    label: string;
    version: string;
    author: string;
    description: string;
    skillsMeasured: string[];
    icon: string;
  };

  // Rendering & UI
  Renderer: React.FC<{
    config: TConfig;
    state: TState;
    readOnly?: boolean;
    onChange?: (newState: TState) => void;
  }>;
  
  ConfigUI: React.FC<{
    config: TConfig;
    onChange: (newConfig: TConfig) => void;
  }>;

  // Compilation & Validation
  validateConfig: (config: TConfig) => { valid: boolean; errors: string[] };
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  compile: (config: TConfig, resolveResource: (id: string) => any) => Promise<TConfig>;

  // Execution & Scoring Hooks
  executionHooks: {
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
    prepareEnvironment: (config: TConfig) => Promise<any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
    execute: (state: TState, envContext: any) => Promise<TResult>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
    cleanup: (envContext: any) => Promise<void>;
  };

  evaluationHooks: {
    scoreDeterministic: (result: TResult, config: TConfig) => number;
    generateAIPromptContext: (result: TResult, config: TConfig) => string;
  };

  telemetry: WidgetTelemetry;
}

// 3. Dynamic Widget Registry
class Registry {
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  private widgets: Map<string, IWidgetSDK<any, any, any>> = new Map();

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  register(widget: IWidgetSDK<any, any, any>) {
    if (this.widgets.has(widget.metadata.type)) {
      console.warn(`Widget ${widget.metadata.type} is already registered. Overwriting.`);
    }
    this.widgets.set(widget.metadata.type, widget);
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  get(type: string): IWidgetSDK<any, any, any> | undefined {
    return this.widgets.get(type);
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
  getAll(): IWidgetSDK<any, any, any>[] {
    return Array.from(this.widgets.values());
  }
}

export const WidgetRegistry = new Registry();

// 4. Plugin Loader (For Marketplace Extensibility)
export class PluginLoader {
  static async loadFromUrl(url: string): Promise<void> {
    // In production, this would dynamically import remote ESM modules (e.g. Webpack Module Federation)
    // and call WidgetRegistry.register(module.default)
    console.log(`[PluginLoader] Loading remote widget from ${url}...`);
  }
}
