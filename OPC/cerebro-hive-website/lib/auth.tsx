/**
 * CerebroHive Auth — Keycloak OIDC integration
 *
 * Provides:
 *  - useAuth()          → client-side hook (token + user profile)
 *  - AuthProvider       → wraps app, manages Keycloak lifecycle
 *  - getServerSession() → server-side token extraction from cookie/header
 *
 * Token flow:
 *  Browser → Keycloak PKCE → access_token (JWT) stored in memory
 *  → injected as Bearer in api-client requests
 *  → validated by Rust gateway → forwarded as trusted headers to Java services
 */

"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  sub: string;
  email: string;
  name: string;
  given_name?: string;
  family_name?: string;
  org_id?: string;
  org_role?: string;
  roles: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  token: string | null;
  login: () => void;
  logout: () => void;
  getToken: () => Promise<string | null>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  getToken: async () => null,
});

// ── Keycloak config ───────────────────────────────────────────────────────────

interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
}

function getConfig(): KeycloakConfig {
  return {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? "http://localhost:8080",
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? "cerebro",
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? "cerebro-web",
  };
}

// ── Token helpers ─────────────────────────────────────────────────────────────

function parseJwt(token: string): Record<string, unknown> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

function isExpired(token: string, bufferSecs = 30): boolean {
  const { exp } = parseJwt(token);
  if (!exp) return true;
  return Date.now() / 1000 > (exp as number) - bufferSecs;
}

function profileFromToken(token: string): UserProfile {
  const claims = parseJwt(token) as Record<string, unknown>;
  const realmRoles = ((claims.realm_access as { roles?: string[] })?.roles ?? []);
  const resourceRoles = Object.values((claims.resource_access ?? {}) as Record<string, { roles?: string[] }>)
    .flatMap(r => r.roles ?? []);

  return {
    sub: claims.sub as string,
    email: claims.email as string,
    name: (claims.name as string) ?? (claims.preferred_username as string),
    given_name: claims.given_name as string | undefined,
    family_name: claims.family_name as string | undefined,
    org_id: claims.org_id as string | undefined,
    org_role: claims.org_role as string | undefined,
    roles: [...new Set([...realmRoles, ...resourceRoles])],
  };
}

// ── PKCE helpers ──────────────────────────────────────────────────────────────

async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

// ── AuthProvider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const cfg = getConfig();
  const tokenRef = useRef<string | null>(null);
  const refreshRef = useRef<string | null>(null);
  const [state, setState] = useState<Omit<AuthState, "login" | "logout" | "getToken">>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
  });

  const base = `${cfg.url}/realms/${cfg.realm}/protocol/openid-connect`;

  // ── Token exchange ──────────────────────────────────────────────────────────

  const exchangeCode = useCallback(async (code: string, verifier: string) => {
    const res = await fetch(`${base}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: cfg.clientId,
        code,
        code_verifier: verifier,
        redirect_uri: `${window.location.origin}/auth/callback`,
      }),
    });
    if (!res.ok) throw new Error("Token exchange failed");
    return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>;
  }, [base, cfg.clientId]);

  const refreshToken = useCallback(async (refresh: string) => {
    const res = await fetch(`${base}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: cfg.clientId,
        refresh_token: refresh,
      }),
    });
    if (!res.ok) throw new Error("Refresh failed");
    return res.json() as Promise<{ access_token: string; refresh_token: string }>;
  }, [base, cfg.clientId]);

  const setTokens = useCallback((access: string, refresh: string) => {
    tokenRef.current = access;
    refreshRef.current = refresh;
    const user = profileFromToken(access);
    setState({ isAuthenticated: true, isLoading: false, user, token: access });
    // Persist refresh token in sessionStorage (survives page refresh, not tab close)
    sessionStorage.setItem("cerebro_refresh", refresh);
  }, []);

  // ── Initialise on mount ─────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      // Handle OAuth callback
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const verifier = sessionStorage.getItem("pkce_verifier");

      if (code && verifier) {
        try {
          const tokens = await exchangeCode(code, verifier);
          sessionStorage.removeItem("pkce_verifier");
          setTokens(tokens.access_token, tokens.refresh_token);
          // Clean URL
          window.history.replaceState({}, "", window.location.pathname);
          return;
        } catch {
          // Fall through to check stored refresh token
        }
      }

      // Try to restore from stored refresh token
      const storedRefresh = sessionStorage.getItem("cerebro_refresh");
      if (storedRefresh) {
        try {
          const tokens = await refreshToken(storedRefresh);
          setTokens(tokens.access_token, tokens.refresh_token);
          return;
        } catch {
          sessionStorage.removeItem("cerebro_refresh");
        }
      }

      setState(s => ({ ...s, isLoading: false }));
    };

    init();
  }, []); 

  // ── Proactive token refresh (1 min before expiry) ───────────────────────────

  useEffect(() => {
    const interval = setInterval(async () => {
      const token = tokenRef.current;
      const refresh = refreshRef.current;
      if (token && isExpired(token, 60) && refresh) {
        try {
          const tokens = await refreshToken(refresh);
          setTokens(tokens.access_token, tokens.refresh_token);
        } catch {
          setState({ isAuthenticated: false, isLoading: false, user: null, token: null });
          sessionStorage.removeItem("cerebro_refresh");
        }
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [refreshToken, setTokens]);

  // ── Public methods ──────────────────────────────────────────────────────────

  const login = useCallback(async () => {
    const verifier = await generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    sessionStorage.setItem("pkce_verifier", verifier);

    const authUrl = new URL(`${base}/auth`);
    authUrl.searchParams.set("client_id", cfg.clientId);
    authUrl.searchParams.set("redirect_uri", `${window.location.origin}/auth/callback`);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "openid email profile");
    authUrl.searchParams.set("code_challenge", challenge);
    authUrl.searchParams.set("code_challenge_method", "S256");

    window.location.href = authUrl.toString();
  }, [base, cfg.clientId]);

  const logout = useCallback(() => {
    tokenRef.current = null;
    refreshRef.current = null;
    sessionStorage.removeItem("cerebro_refresh");
    setState({ isAuthenticated: false, isLoading: false, user: null, token: null });

    const logoutUrl = new URL(`${base}/logout`);
    logoutUrl.searchParams.set("client_id", cfg.clientId);
    logoutUrl.searchParams.set("post_logout_redirect_uri", window.location.origin);
    window.location.href = logoutUrl.toString();
  }, [base, cfg.clientId]);

  const getToken = useCallback(async (): Promise<string | null> => {
    const token = tokenRef.current;
    if (!token) return null;

    if (isExpired(token, 30)) {
      const refresh = refreshRef.current;
      if (!refresh) return null;
      try {
        const tokens = await refreshToken(refresh);
        setTokens(tokens.access_token, tokens.refresh_token);
        return tokens.access_token;
      } catch {
        return null;
      }
    }
    return token;
  }, [refreshToken, setTokens]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

// ── Permission helpers ────────────────────────────────────────────────────────

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.roles.includes("admin") ?? false;
}

export function useHasRole(role: string): boolean {
  const { user } = useAuth();
  return user?.roles.includes(role) ?? false;
}
