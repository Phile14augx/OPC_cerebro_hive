/**
 * platform-api — API Key management routes
 */

import { Router } from "express";
import { requireAuth, requirePermission, requireOrgAccess } from "@cerebro/auth";
import { apiKeyRepository, auditRepository } from "@cerebro/db";
import { asyncHandler, ValidationError } from "@cerebro/errors";
import { randomBytes, createHash } from "node:crypto";

export const apiKeysRouter = Router();

apiKeysRouter.use(requireAuth);

function generateApiKey(): { raw: string; prefix: string; hash: string } {
  const secret = randomBytes(32).toString("base64url");
  const prefix = randomBytes(8).toString("hex");
  const raw    = `ck_${prefix}_${secret}`;
  const hash   = createHash("sha256").update(raw).digest("hex");
  return { raw, prefix, hash };
}

// GET /v1/api-keys
apiKeysRouter.get("/", requirePermission("api_keys:read"), asyncHandler(async (req, res) => {
  const { orgId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const keys = await apiKeyRepository.findByOrgId(orgId);

  // Never return keyHash in list
  res.json({
    items: keys.map(({ keyHash: _kh, ...rest }) => rest),
    total: keys.length,
  });
}));

// POST /v1/api-keys
apiKeysRouter.post("/", requirePermission("api_keys:create"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  const { name, scopes = ["*"], expiresAt } = req.body as {
    name?:      string;
    scopes?:    string[];
    expiresAt?: string;
  };

  if (!name?.trim()) throw new ValidationError("name is required");

  const { raw, prefix, hash } = generateApiKey();

  const key = await apiKeyRepository.create({
    orgId,
    userId,
    name:      name.trim(),
    keyHash:   hash,
    keyPrefix: prefix,
    scopes,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
  });

  await auditRepository.record({
    orgId,
    actorId:      userId,
    eventType:    "api_key.created",
    resourceType: "api_key",
    resourceId:   key.id,
    action:       "create",
    outcome:      "success",
    details:      { scopes },
  });

  // Return raw key ONCE — never retrievable again
  res.status(201).json({
    id:        key.id,
    name:      key.name,
    keyPrefix: key.keyPrefix,
    scopes:    key.scopes,
    expiresAt: key.expiresAt,
    createdAt: key.createdAt,
    // ⚠ Only returned at creation
    key:       raw,
  });
}));

// DELETE /v1/api-keys/:id
apiKeysRouter.delete("/:id", requirePermission("api_keys:revoke"), asyncHandler(async (req, res) => {
  const { orgId, userId } = req.auth!;
  if (!orgId) { res.status(400).json({ error: "MISSING_ORG" }); return; }

  await apiKeyRepository.revoke(req.params["id"]!, orgId);

  await auditRepository.record({
    orgId,
    actorId:      userId,
    eventType:    "api_key.revoked",
    resourceType: "api_key",
    resourceId:   req.params["id"]!,
    action:       "revoke",
    outcome:      "success",
  });

  res.status(204).send();
}));
