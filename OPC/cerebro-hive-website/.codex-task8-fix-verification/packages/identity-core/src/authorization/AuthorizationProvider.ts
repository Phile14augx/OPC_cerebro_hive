import { IdentityContext } from '../context/IdentityContext';

export interface AuthorizationProvider {
  /**
   * Evaluates if the current IdentityContext has the required capability permission.
   * e.g. checkPermission(ctx, 'workflows:execute', 'ws:123:workflow:456')
   */
  checkPermission(context: IdentityContext, capability: string, resourceUrn?: string): Promise<boolean>;
  
  /**
   * Retrieves all capability strings granted to the context.
   */
  getGrantedCapabilities(context: IdentityContext): Promise<string[]>;
}
