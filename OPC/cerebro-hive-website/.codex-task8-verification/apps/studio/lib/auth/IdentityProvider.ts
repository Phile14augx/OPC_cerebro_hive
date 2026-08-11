export interface UserSession {
  userId: string;
  email: string;
  accessToken: string; // The JWT passed to the API
}

export interface IdentityProvider {
  /**
   * Initializes the provider (e.g., configuring Amplify)
   */
  initialize(config: any): void;

  /**
   * Gets the current session if the user is authenticated.
   */
  getSession(): Promise<UserSession | null>;

  /**
   * Navigates to the Hosted UI or initiates login
   */
  signIn(): Promise<void>;

  /**
   * Signs the user out
   */
  signOut(): Promise<void>;
}
