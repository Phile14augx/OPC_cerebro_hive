import { Amplify } from 'aws-amplify';
import { fetchAuthSession, getCurrentUser, signInWithRedirect, signOut } from 'aws-amplify/auth';
import { IdentityProvider, UserSession } from './IdentityProvider';

export class CognitoProvider implements IdentityProvider {
  initialize(config: { userPoolId: string; userPoolClientId: string; region: string }): void {
    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId: config.userPoolId,
          userPoolClientId: config.userPoolClientId,
          loginWith: {
            oauth: {
              domain: '', // Will be set if using Hosted UI, but for now we might use standard UI
              scopes: ['email', 'openid'],
              redirectSignIn: [typeof window !== 'undefined' ? window.location.origin : ''],
              redirectSignOut: [typeof window !== 'undefined' ? window.location.origin : ''],
              responseType: 'code'
            }
          }
        }
      }
    });
  }

  async getSession(): Promise<UserSession | null> {
    try {
      const session = await fetchAuthSession();
      if (!session.tokens) return null;

      const user = await getCurrentUser();

      return {
        userId: user.userId,
        email: user.signInDetails?.loginId || '',
        accessToken: session.tokens.accessToken.toString()
      };
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ARCH-LINT: Deferred
    } catch (err) {
      return null;
    }
  }

  async signIn(): Promise<void> {
    // If Hosted UI is configured, this works. Otherwise we need a custom UI.
    // For M26.4, we'll use Amplify's standard auth flow, but we can wrap it.
    await signInWithRedirect();
  }

  async signOut(): Promise<void> {
    await signOut();
  }
}

export const cognitoProvider = new CognitoProvider();
