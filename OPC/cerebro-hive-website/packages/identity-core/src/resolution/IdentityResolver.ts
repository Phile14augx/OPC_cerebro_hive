import { IdentityContext } from '../context/IdentityContext';
import { Principal } from '../principals/Principal';

export interface IdentityResolver {
  /**
   * Reconstructs the full IdentityContext from a given session ID or API key.
   */
  resolveContext(authenticationToken: string): Promise<IdentityContext>;
  
  /**
   * Creates a delegated IdentityContext for a Robot/Service acting on behalf of an Original Principal.
   */
  delegate(currentContext: IdentityContext, targetPrincipal: Principal, reason: string): IdentityContext;
}
