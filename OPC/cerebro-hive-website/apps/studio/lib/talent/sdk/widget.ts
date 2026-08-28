/**
 * Widget SDK: The universal contract for all Talent OS Assessment Widgets
 */

// 1. Telemetry and Analytics Hooks
export interface WidgetTelemetry {
  events: {
onStart?: (context: unknown) => void;
onInput?: (data: unknown) => void;
onCompile?: (data: unknown) => void;
    onError?: (error: Error) => void;
onComplete?: (result: unknown) => void;
  };
}

// 2. The Universal Widget SDK Interface
export interface IWidgetSDK<TConfig = unknown, TState = unknown, TResult = unknown> {
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
compile: (config: TConfig, resolveResource: (id: string) => unknown) => Promise<TConfig>;

  // Execution & Scoring Hooks
  executionHooks: {
prepareEnvironment: (config: TConfig) => Promise<unknown>;
execute: (state: TState, envContext: unknown) => Promise<TResult>;
cleanup: (envContext: unknown) => Promise<void>;
  };

  evaluationHooks: {
    scoreDeterministic: (result: TResult, config: TConfig) => number;
    generateAIPromptContext: (result: TResult, config: TConfig) => string;
  };

  telemetry: WidgetTelemetry;
}

// 3. Dynamic Widget Registry
class Registry {
private widgets: Map<string, IWidgetSDK<unknown, unknown, unknown>> = new Map();

register(widget: IWidgetSDK<unknown, unknown, unknown>) {
    if (!widget || !widget.metadata || typeof widget.metadata.type !== 'string' || !widget.Renderer || !widget.ConfigUI || !widget.validateConfig || !widget.compile || !widget.executionHooks || !widget.evaluationHooks || !widget.telemetry) {
      return;
    }
    if (this.widgets.has(widget.metadata.type)) {
      console.warn(`Widget ${widget.metadata.type} is already registered. Overwriting.`);
    }
    this.widgets.set(widget.metadata.type, widget);
  }

get(type: string): IWidgetSDK<unknown, unknown, unknown> | undefined {
    return this.widgets.get(type);
  }

getAll(): IWidgetSDK<unknown, unknown, unknown>[] {
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
