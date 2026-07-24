/**
 * platform-api — Auth routes
 * POST /v1/auth/token/refresh   — refresh access token via Keycloak
 * GET  /v1/auth/me              — current user info
 * POST /v1/auth/logout          — revoke session
 */

import { Router } from "express";
import { requireAuth } from "@cerebro/auth";
import { userRepository } from "@cerebro/db";
import { asyncHandler } from "@cerebro/errors";
import { getPlatformApiConfig } from "@cerebro/config";

export const authRouter = Router();

const cfg = getPlatformApiConfig();

// POST /v1/auth/token/refresh
authRouter.post("/token/refresh", asyncHandler(async (req, res) => {
  const { refresh_token } = req.body as { refresh_token?: string };
  if (!refresh_token) {
    res.status(400).json({ error: "MISSING_REFRESH_TOKEN", message: "refresh_token is required" });
    return;
  }

  // Proxy to Keycloak token endpoint
  const tokenUrl = `${cfg.KEYCLOAK_SERVER_URL}/realms/${cfg.KEYCLOAK_REALM}/protocol/openid-connect/token`;
  const body = new URLSearchParams({
    grant_type:    "refresh_token",
    client_id:     cfg.KEYCLOAK_CLIENT_ID,
    client_secret: cfg.KEYCLOAK_CLIENT_SECRET,
    refresh_token,
  });

  const upstream = await fetch(tokenUrl, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    body.toString(),
  });

  const data = await upstream.json() as Record<string, unknown>;

  if (!upstream.ok) {
    res.status(upstream.status).json({
      error:   "TOKEN_REFRESH_FAILED",
      message: (data["error_description"] as string | undefined) ?? "Token refresh failed",
    });
    return;
  }

  res.json({
    access_token:  data["access_token"],
    refresh_token: data["refresh_token"],
    expires_in:    data["expires_in"],
    token_type:    "Bearer",
  });
}));

// GET /v1/auth/me
authRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const { userId } = req.auth!;
  const user = await userRepository.findById(userId);

  if (!user) {
    res.status(404).json({ error: "NOT_FOUND", message: "User not found" });
    return;
  }

  // Fire-and-forget last active update
  void userRepository.recordLogin(userId);

  res.json({
    id:           user.id,
    email:        user.email,
    displayName:  user.displayName,
    avatarUrl:    user.avatarUrl,
    status:       user.status,
    createdAt:    user.createdAt,
    orgId:        req.auth!.orgId,
    orgRole:      req.auth!.orgRole,
    isAdmin:      req.auth!.isAdmin,
    authType:     req.auth!.authType,
  });
}));

// POST /v1/auth/logout
authRouter.post("/logout", requireAuth, asyncHandler(async (req, res) => {
  const jwtPayload = req.auth?.jwtPayload;
  if (!jwtPayload?.session_state) {
    res.json({ success: true });
    return;
  }

  // Proxy logout to Keycloak
  const logoutUrl = `${cfg.KEYCLOAK_SERVER_URL}/realms/${cfg.KEYCLOAK_REALM}/protocol/openid-connect/logout`;
  await fetch(logoutUrl, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     cfg.KEYCLOAK_CLIENT_ID,
      client_secret: cfg.KEYCLOAK_CLIENT_SECRET,
      refresh_token: (req.body as { refresh_token?: string }).refresh_token ?? "",
    }).toString(),
  }).catch(() => {}); // Best-effort

  res.json({ success: true });
}));
