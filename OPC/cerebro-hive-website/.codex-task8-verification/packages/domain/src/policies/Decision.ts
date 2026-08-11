export interface Decision {
  allowed: boolean;
  reason?: string;
  missingPermissions?: string[];
  conditions?: Record<string, any>;
}

export interface IPermissionPolicy<TContext = any, TResource = any> {
  evaluate(context: TContext, resource?: TResource): Promise<Decision>;
}
