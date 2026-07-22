"use client";

import React, { useState } from "react";
import { Lock, ShieldCheck, Loader2 } from "lucide-react";
import { AgentOSBackendConsole } from "./AgentOSBackendConsole";
import { AgentOSPlatformConsole } from "./AgentOSPlatformConsole";

/**
 * Gates the "Full Backend" consoles behind an admin-secret prompt. This is
 * the website-side half of the production security model: the backend only
 * mints API keys when the caller presents X-Admin-Secret matching its
 * AGENTOS_ADMIN_SECRET env var (see agentos/app/security.py). Locally, with
 * no secret configured on the backend, any value here (including leaving it
 * blank) still works — the backend accepts all requests when the env var is
 * unset.
 *
 * The secret is held only in component state for this render — never
 * persisted to localStorage/sessionStorage/cookies, so it doesn't survive a
 * refresh and isn't retrievable by any other script on the page.
 */
export const AgentOSBackendGate = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [secretInput, setSecretInput] = useState("");
  const [adminSecret, setAdminSecret] = useState<string | undefined>(undefined);
  const [checking, setChecking] = useState(false);

  const enter = () => {
    setChecking(true);
    setAdminSecret(secretInput || undefined);
    setUnlocked(true);
    // AgentOSBackendConsole reports "unauthorized" itself if this is wrong —
    // this local spinner is just a small affordance while it bootstraps.
    setTimeout(() => setChecking(false), 400);
  };

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto bg-surface border border-border rounded-2xl p-8 flex flex-col items-center text-center gap-4">
        <div className="w-11 h-11 rounded-full bg-primary-accent/10 border border-primary-accent/30 flex items-center justify-center">
          <Lock size={18} className="text-primary-accent" />
        </div>
        <div>
          <h3 className="font-space font-bold text-text-primary mb-1.5">Full Backend access</h3>
          <p className="text-sm text-text-secondary">
            This tab talks to the real AgentOS service — registered agents, live governance policies, and a
            persistent database. In production it&apos;s gated by an admin secret; locally, it&apos;s open by default.
          </p>
        </div>
        <input
          type="password"
          value={secretInput}
          onChange={(e) => setSecretInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enter()}
          placeholder="Admin secret (leave blank for local dev)"
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-text-primary text-center focus:outline-none focus:border-primary-accent/60"
        />
        <button
          onClick={enter}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg transition-transform hover:-translate-y-0.5"
        >
          <ShieldCheck size={16} /> Connect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {checking && (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Loader2 size={12} className="animate-spin" /> Verifying…
        </div>
      )}
      <AgentOSBackendConsole adminSecret={adminSecret} />
      <AgentOSPlatformConsole adminSecret={adminSecret} />
      <button
        onClick={() => {
          setUnlocked(false);
          setSecretInput("");
          setAdminSecret(undefined);
        }}
        className="self-start text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-text-secondary transition-colors"
      >
        ← Change secret / disconnect
      </button>
    </div>
  );
};
