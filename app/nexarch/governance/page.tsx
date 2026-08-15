/**
 * Nexarch — Governance: Policies + Budgets
 */
"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, DollarSign, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react";

const EFFECT_COLORS: Record<string, string> = {
  allow:            "text-emerald-400",
  deny:             "text-red-400",
  require_approval: "text-amber-400",
  rate_limit:       "text-blue-400",
  quarantine:       "text-orange-400",
};

export default function GovernancePage() {
  const [policies, setPolicies]   = useState<any[]>([]);
  const [budgets, setBudgets]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState<"policies" | "budgets">("policies");

  useEffect(() => {
    Promise.all([
      fetch("/api/nexarch/policies").then(r => r.json()),
      fetch("/api/nexarch/metrics").then(r => r.json()),
    ]).then(([pData, mData]) => {
      setPolicies(pData.data ?? []);
      // Extract budget info from metrics if available
      setBudgets(mData.data?.budgets ?? []);
      setLoading(false);
    });
  }, []);

  const togglePolicy = async (id: string, enabled: boolean) => {
    await fetch("/api/nexarch/policies", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id, enabled }),
    });
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled } : p));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Governance</h1>
        <p className="text-sm text-gray-500">Policies, budgets and access controls</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800">
        {(["policies", "budgets"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm transition-colors border-b-2 -mb-px capitalize ${
              tab === t ? "border-violet-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-500 text-sm">Loading governance data…</div>
      ) : tab === "policies" ? (
        <div className="space-y-3">
          {policies.length === 0 ? (
            <div className="py-10 text-center">
              <ShieldCheck className="w-10 h-10 text-gray-800 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No policies configured</p>
            </div>
          ) : (
            policies.map((policy: any) => (
              <div key={policy.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className={`w-5 h-5 flex-shrink-0 mt-0.5 ${policy.enabled ? "text-violet-400" : "text-gray-600"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-sm font-semibold text-white">{policy.name}</h3>
                      <span className={`text-xs font-medium ${EFFECT_COLORS[policy.effect] ?? "text-gray-400"}`}>
                        {policy.effect?.toUpperCase().replace("_", " ")}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        policy.enabled
                          ? "bg-emerald-900/40 text-emerald-400 border-emerald-800"
                          : "bg-gray-800 text-gray-600 border-gray-700"
                      }`}>
                        {policy.enabled ? "enabled" : "disabled"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{policy.description}</p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      {policy.riskThreshold && (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Triggers at: <span className="text-gray-400">{policy.riskThreshold}</span>
                        </span>
                      )}
                      {policy.appliesTo && (
                        <span>Applies to: <span className="text-gray-400">{policy.appliesTo.join(", ")}</span></span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => togglePolicy(policy.id, !policy.enabled)}
                    className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
                    title={policy.enabled ? "Disable policy" : "Enable policy"}
                  >
                    {policy.enabled
                      ? <ToggleRight className="w-6 h-6 text-violet-400" />
                      : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Budgets tab */
        <div className="space-y-3">
          {budgets.length === 0 ? (
            <div className="py-10 text-center">
              <DollarSign className="w-10 h-10 text-gray-800 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No budget accounts configured</p>
              <p className="text-xs text-gray-700 mt-1">Budgets are created per-agent and per-mission in the store</p>
            </div>
          ) : (
            budgets.map((budget: any) => {
              const pct = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
              return (
                <div key={budget.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">{budget.entityId}</p>
                      <p className="text-xs text-gray-500">{budget.entityType} · {budget.period}</p>
                    </div>
                    <p className={`text-sm font-bold ${pct > 90 ? "text-red-400" : pct > 70 ? "text-yellow-400" : "text-gray-300"}`}>
                      ${budget.spent?.toFixed(2)} / ${budget.limit?.toFixed(2)}
                    </p>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct > 90 ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-violet-500"
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{pct.toFixed(1)}% used</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
