import { z } from "zod";

/**
 * Zod schemas for every mutating API route under app/api/**. Centralized here
 * so field limits (the "input validation" layer — see the security roadmap doc,
 * section 10) are consistent and easy to audit in one place rather than
 * scattered `if (!field)` checks per route.
 *
 * These are demo/marketing-site endpoints backed by a flat-file JSON store
 * (lib/db.ts), not a real customer database — but they're still public,
 * unauthenticated, internet-reachable POST endpoints, so they get real bounds:
 * every string field has a max length, emails are actually validated as
 * emails, and unknown extra fields are rejected (.strict()) rather than
 * silently accepted and stored.
 */

const email = z.string().trim().email().max(320);
const shortText = (max: number) => z.string().trim().min(1).max(max);

export const contactSchema = z
  .object({
    name: shortText(200),
    email,
    subject: shortText(300),
    message: shortText(5000),
  })
  .strict();

export const leadSchema = z
  .object({
    name: shortText(200),
    email,
    company: shortText(200),
    type: shortText(100),
    target: z.string().trim().max(200).optional(),
    score: z.number().finite().min(0).max(100).optional(),
    inputs: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const ticketSchema = z
  .object({
    subject: shortText(300),
    message: shortText(5000),
  })
  .strict();

export const academyEnrollSchema = z
  .object({
    email,
    courseSlug: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(/^[a-z0-9-]+$/, "courseSlug must be a lowercase slug"),
  })
  .strict();

export const enterpriseEmployeeSchema = z
  .object({
    name: shortText(200),
    email,
    course: shortText(200),
  })
  .strict();

export const enterpriseEmployeeIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9-]+$/, "id must be alphanumeric");

export const jobApplicationSchema = z
  .object({
    applicantName: shortText(200),
    applicantEmail: email,
    roleTitle: shortText(200),
    resumeText: shortText(20_000),
    linkedinUrl: z
      .string()
      .trim()
      .max(300)
      .refine(v => v === "" || /^https?:\/\/([\w-]+\.)?linkedin\.com\//i.test(v), "must be a linkedin.com URL")
      .optional()
      .default(""),
  })
  .strict();
