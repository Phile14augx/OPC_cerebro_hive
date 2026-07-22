"use client";

import { useState } from "react";
import {
  api, KEY, WIZARD_REGIONS,
  type CatalogItem, type ProvisionedResource, type MarketplaceInstallation, type SizeTier,
} from "./lib";
import { wizardConfigForKind } from "./wizardKinds";

interface Props {
  item: CatalogItem;
  /** "provision" opens the full 3-step config→review→result wizard against POST /provision.
   *  "install" opens a lighter 2-step review→confirm wizard against POST /marketplace/install. */
  mode?: "provision" | "install";
  onClose: () => void;
  /** Called once the action has successfully completed, so the parent can refresh its lists. */
  onDone: () => void;
}

const TIER_MULTIPLIER: Record<SizeTier, number> = { small: 0.5, medium: 1, large: 2, xlarge: 4 };

/**
 * Shared multi-step provisioning wizard used by every HiveForge console (all 24 catalog category
 * pages, Cloud Compute, Data & Networking, and — in "install" mode — the Marketplace). The
 * Configure step is kind-specific (see wizardKinds.ts): a GPU item shows GPU-class options and
 * interconnect add-ons, a database shows storage/replica tiers and data-protection add-ons, an AI
 * model shows parameter-size/context-window tiers, and so on — 25 distinct configuration surfaces
 * mirroring the real product, not one generic form reused for all 230+ line items.
 */
export function HiveForgeWizard({ item, mode = "provision", onClose, onDone }: Props) {
  const config = wizardConfigForKind(item.kind);
  const [step, setStep] = useState(1);
  const [region, setRegion] = useState(WIZARD_REGIONS[0]!);
  const [sizeTier, setSizeTier] = useState<SizeTier>("medium");
  const [replicas, setReplicas] = useState<number | "">("");
  const [options, setOptions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProvisionedResource | MarketplaceInstallation | null>(null);

  const reviewStep = mode === "provision" ? 2 : 1;
  const resultStep = mode === "provision" ? 3 : 2;
  const totalSteps = resultStep;

  const estRate = item.hourlyRateUsd ? item.hourlyRateUsd * TIER_MULTIPLIER[sizeTier] : 0;

  const toggleOption = (o: string) => setOptions(prev => (prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]));

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (mode === "provision") {
        const body: Record<string, unknown> = { itemId: item.id, region, sizeTier };
        if (replicas !== "") body.replicas = replicas;
        if (options.length) body.options = options;
        const res = await api<ProvisionedResource>("/v1/hiveforge/provision", { method: "POST", body: JSON.stringify(body) });
        setResult(res);
      } else {
        const res = await api<MarketplaceInstallation>("/v1/hiveforge/marketplace/install", { method: "POST", body: JSON.stringify({ itemId: item.id }) });
        setResult(res);
      }
      setStep(resultStep);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-primary">
            {mode === "provision" ? "Provision" : "Install"} {item.name}
          </h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary" aria-label="Close">✕</button>
        </div>
        {mode === "provision" && step === 1 && <p className="mt-1 text-xs text-text-secondary">{config.subtitle}</p>}

        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? "bg-primary-accent" : "bg-border"}`} />
          ))}
        </div>
        <div className="mt-1.5 text-[11px] uppercase tracking-widest text-text-secondary">
          Step {step} of {totalSteps} · {step === reviewStep ? "Review" : step === resultStep ? "Result" : "Configure"}
        </div>

        {mode === "provision" && step === 1 && (
          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-text-secondary">Region</label>
              <select value={region} onChange={e => setRegion(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary">
                {WIZARD_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-text-secondary">{config.sizeLabel}</label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {(Object.keys(config.sizeTiers) as SizeTier[]).map(tierId => {
                  const t = config.sizeTiers[tierId];
                  return (
                    <button
                      key={tierId}
                      type="button"
                      onClick={() => setSizeTier(tierId)}
                      className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${sizeTier === tierId ? "border-primary-accent text-primary-accent" : "border-border text-text-secondary hover:border-text-secondary"}`}
                    >
                      <div className="font-semibold">{t.label}</div>
                      <div className="mt-0.5 text-[10px] text-text-secondary">{t.blurb}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {config.showReplicas && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-text-secondary">{config.replicasLabel} (optional)</label>
                <input
                  type="number" min={1} max={64}
                  value={replicas}
                  onChange={e => setReplicas(e.target.value === "" ? "" : Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary"
                  placeholder={config.replicasPlaceholder}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-text-secondary">{config.optionsLabel}</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {config.optionChoices.map(o => (
                  <button
                    key={o} type="button" onClick={() => toggleOption(o)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${options.includes(o) ? "border-primary-accent text-primary-accent" : "border-border text-text-secondary hover:border-text-secondary"}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary">Cancel</button>
              <button onClick={() => setStep(2)} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent">Next: Review</button>
            </div>
          </div>
        )}

        {step === reviewStep && (
          <div className="mt-5 space-y-3">
            <div className="rounded-lg border border-border bg-surface-elevated/60 p-4 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Item</span><span className="text-text-primary">{item.name}</span></div>
              {mode === "provision" && (
                <>
                  <div className="mt-1 flex justify-between"><span className="text-text-secondary">Region</span><span className="text-text-primary">{region}</span></div>
                  <div className="mt-1 flex justify-between"><span className="text-text-secondary">{config.sizeLabel}</span><span className="text-text-primary">{config.sizeTiers[sizeTier].label}</span></div>
                  {config.showReplicas && (
                    <div className="mt-1 flex justify-between"><span className="text-text-secondary">{config.replicasLabel}</span><span className="text-text-primary">{replicas === "" ? "Auto" : replicas}</span></div>
                  )}
                  <div className="mt-1 flex justify-between"><span className="text-text-secondary">{config.optionsLabel}</span><span className="text-text-primary text-right">{options.length ? options.join(", ") : "None"}</span></div>
                  <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold"><span className="text-text-secondary">Est. rate</span><span className="text-primary-accent">${estRate.toFixed(4)}/hr</span></div>
                </>
              )}
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex justify-end gap-2 pt-1">
              {mode === "provision" && <button onClick={() => setStep(1)} className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary">Back</button>}
              <button onClick={() => void submit()} disabled={busy || !KEY} className="rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent disabled:opacity-40">
                {busy ? "Working…" : mode === "provision" ? "Confirm & Provision" : "Confirm & Install"}
              </button>
            </div>
          </div>
        )}

        {step === resultStep && result && (
          <div className="mt-5 space-y-3">
            <p className="text-sm text-primary-accent">✓ {mode === "provision" ? "Provisioned" : "Installed"} successfully.</p>
            {"endpoint" in result && <p className="text-xs text-text-secondary break-all">{(result as ProvisionedResource).endpoint}</p>}
            {"specs" in result && (
              <div className="rounded-lg border border-border bg-surface-elevated/60 p-3 text-xs text-text-secondary">
                {Object.entries((result as ProvisionedResource).specs).filter(([k]) => k !== "options").map(([k, v]) => (
                  <div key={k} className="flex justify-between py-0.5"><span className="capitalize">{k}</span><span className="text-text-primary">{String(v)}</span></div>
                ))}
              </div>
            )}
            <button onClick={onClose} className="mt-2 w-full rounded-lg border border-primary-accent px-4 py-2 text-sm font-semibold text-primary-accent">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
