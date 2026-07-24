/**
 * platform-api — Organization CRUD + member management routes
 */

import { Router } from "express";
import { requireAuth, requirePermission, requireOrgAccess } from "@cerebro/auth";
import { orgRepository, auditRepository } from "@cerebro/db";
import { asyncHandler, ValidationError, ConflictError } from "@cerebro/errors";

export const orgsRouter = Router();

orgsRouter.use(requireAuth);

// POST /v1/orgs
orgsRouter.post("/", asyncHandler(async (req, res) => {
  const { userId } = req.auth!;
  const { name, slug } = req.body as { name?: string; slug?: string };

  if (!name?.trim()) throw new ValidationError("name is required");
  if (!slug?.trim()) throw new ValidationError("slug is required");
  if (!/^[a-z0-9-]{2,63}$/.test(slug)) {
    throw new ValidationError("slug must be 2-63 lowercase alphanumeric chars or hyphens");
  }

  const existing = await orgRepository.findBySlug(slug);
  if (existing) throw new ConflictError(`Slug '${slug}' is already taken`);

  const org = await orgRepository.create({ name: name.trim(), slug, ownerId: userId });

  await auditRepository.record({
    orgId:        org.id,
    actorId:      userId,
    eventType:    "org.created",
    resourceType: "organization",
    resourceId:   org.id,
    action:       "create",
    outcome:      "success",
  });

  res.status(201).json(org);
}));

// GET /v1/orgs/:orgId
orgsRouter.get("/:orgId", requireOrgAccess, requirePermission("org:read"), asyncHandler(async (req, res) => {
  const org = await orgRepository.findByIdOrThrow(req.params["orgId"]!);
  res.json(org);
}));

// PATCH /v1/orgs/:orgId
orgsRouter.patch("/:orgId", requireOrgAccess, requirePermission("org:update"), asyncHandler(async (req, res) => {
  const { userId } = req.auth!;
  const { name, avatarUrl, settings } = req.body as Record<string, unknown>;

  const org = await orgRepository.update(req.params["orgId"]!, { name: name as string, avatarUrl: avatarUrl as string, settings: settings as never });

  await auditRepository.record({
    orgId:        req.params["orgId"]!,
    actorId:      userId,
    eventType:    "org.updated",
    resourceType: "organization",
    resourceId:   req.params["orgId"]!,
    action:       "update",
    outcome:      "success",
  });

  res.json(org);
}));

// GET /v1/orgs/:orgId/members
orgsRouter.get("/:orgId/members", requireOrgAccess, requirePermission("members:read"), asyncHandler(async (req, res) => {
  const members = await orgRepository.getMembers(req.params["orgId"]!);
  res.json({ items: members, total: members.length });
}));

// POST /v1/orgs/:orgId/members
orgsRouter.post("/:orgId/members", requireOrgAccess, requirePermission("members:invite"), asyncHandler(async (req, res) => {
  const { userId } = req.auth!;
  const { userId: targetUserId, role = "MEMBER" } = req.body as { userId?: string; role?: string };

  if (!targetUserId) throw new ValidationError("userId is required");

  const membership = await orgRepository.addMember(req.params["orgId"]!, targetUserId, role);

  await auditRepository.record({
    orgId:        req.params["orgId"]!,
    actorId:      userId,
    eventType:    "org.member_added",
    resourceType: "membership",
    resourceId:   targetUserId,
    action:       "invite",
    outcome:      "success",
    details:      { role },
  });

  res.status(201).json(membership);
}));

// PATCH /v1/orgs/:orgId/members/:userId
orgsRouter.patch("/:orgId/members/:memberId", requireOrgAccess, requirePermission("members:manage_roles"), asyncHandler(async (req, res) => {
  const { userId } = req.auth!;
  const { role } = req.body as { role?: string };

  if (!role) throw new ValidationError("role is required");

  const membership = await orgRepository.updateMemberRole(req.params["orgId"]!, req.params["memberId"]!, role);

  await auditRepository.record({
    orgId:        req.params["orgId"]!,
    actorId:      userId,
    eventType:    "org.member_role_updated",
    resourceType: "membership",
    resourceId:   req.params["memberId"]!,
    action:       "update_role",
    outcome:      "success",
    details:      { newRole: role },
  });

  res.json(membership);
}));

// DELETE /v1/orgs/:orgId/members/:memberId
orgsRouter.delete("/:orgId/members/:memberId", requireOrgAccess, requirePermission("members:remove"), asyncHandler(async (req, res) => {
  const { userId } = req.auth!;

  await orgRepository.removeMember(req.params["orgId"]!, req.params["memberId"]!);

  await auditRepository.record({
    orgId:        req.params["orgId"]!,
    actorId:      userId,
    eventType:    "org.member_removed",
    resourceType: "membership",
    resourceId:   req.params["memberId"]!,
    action:       "remove",
    outcome:      "success",
  });

  res.status(204).send();
}));
