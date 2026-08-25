export interface Decision {
  allowed: boolean;
  reason?: string;
  missingPermissions?: string[];
  conditions?: Record<string, unknown>;
}

export interface IPermissionPolicy<TContext = unknown, TResource = unknown> {
  evaluate(context: TContext, resource?: TResource): Promise<Decision>;
}
