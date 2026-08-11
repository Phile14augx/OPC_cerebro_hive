// ── Billing domain types ──────────────────────────────────────────────────────

import type { OrgId, UserId } from "./user.js";

export type InvoiceId       = string & { readonly __brand: "InvoiceId" };
export type SubscriptionId  = string & { readonly __brand: "SubscriptionId" };
export type PaymentMethodId = string & { readonly __brand: "PaymentMethodId" };

export type InvoiceStatus       = "draft" | "open" | "paid" | "uncollectible" | "void";
export type SubscriptionStatus  = "active" | "past_due" | "canceled" | "trialing" | "incomplete";
export type BillingInterval     = "monthly" | "annual";

export interface Subscription {
  id:                SubscriptionId;
  orgId:             OrgId;
  stripeSubscriptionId: string;
  stripeCustomerId:  string;
  plan:              string;
  status:            SubscriptionStatus;
  interval:          BillingInterval;
  currentPeriodStart: string;
  currentPeriodEnd:   string;
  cancelAtPeriodEnd:  boolean;
  canceledAt:         string | null;
  trialStart:         string | null;
  trialEnd:           string | null;
  seats:              number;
  addons:             SubscriptionAddon[];
  createdAt:          string;
  updatedAt:          string;
}

export interface SubscriptionAddon {
  name:       string;
  quantity:   number;
  unitAmount: number;   // cents
}

export interface Invoice {
  id:          InvoiceId;
  orgId:       OrgId;
  stripeInvoiceId: string;
  subscriptionId:  SubscriptionId | null;
  status:      InvoiceStatus;
  amount:      number;        // cents
  currency:    string;        // "usd"
  tax:         number;        // cents
  periodStart: string;
  periodEnd:   string;
  paidAt:      string | null;
  invoiceUrl:  string | null;
  pdfUrl:      string | null;
  lineItems:   InvoiceLineItem[];
  createdAt:   string;
}

export interface InvoiceLineItem {
  description: string;
  quantity:    number;
  unitAmount:  number;    // cents
  amount:      number;    // cents
  type:        "subscription" | "ai_usage" | "storage" | "seats" | "addon";
}

export interface UsageBudget {
  orgId:          OrgId;
  monthlyCapUsd:  number;
  alertThreshold: number;   // 0–1 (e.g. 0.8 = alert at 80%)
  alertEmail:     string;
  hardCap:        boolean;  // if true, block AI calls when budget exceeded
  currentSpendUsd: number;
  periodStart:    string;
  periodEnd:      string;
}
