"use client";

import { useEffect, useState } from "react";
import { platformRegistry } from "../core/registry/PlatformRegistry";
import { Plugin } from "../core/contracts/plugin";
import { CapabilityGrid } from "../../../../components/platform/hiveforge/CapabilityGrid";

export default function DiagnosticsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [snapshot, setSnapshot] = useState<string>("");

  useEffect(() => {
    setPlugins(platformRegistry.getAll());
    setSnapshot(platformRegistry.exportSnapshot());
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Registry Diagnostics</h1>
        <p className="text-sm text-text-secondary mt-1">
          Developer Mode Explorer. Inspect all plugins, actions, and metadata registered within the Platform Kernel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold text-text-primary border-b border-border pb-2">Registered Plugins ({plugins.length})</h2>
          
          {plugins.length === 0 ? (
            <div className="text-sm text-text-secondary">No plugins registered in the kernel yet.</div>
          ) : (
            plugins.map(p => (
              <div key={p.manifest.metadata.id} className="border border-border bg-surface/30 p-6 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-text-primary">{p.manifest.metadata.name}</h3>
                    <div className="text-sm text-text-secondary mt-1">
                      ID: <span className="font-mono">{p.manifest.metadata.id}</span> • 
                      Version: {p.manifest.metadata.version} • 
                      Kind: <span className="uppercase text-primary-accent">{p.manifest.kind}</span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 text-xs font-semibold rounded uppercase tracking-wider ${
                    p.health === "Healthy" ? "bg-green-500/10 text-green-500" :
                    p.health === "Failed" ? "bg-red-500/10 text-red-500" :
                    "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {p.health}
                  </div>
                </div>

                <div className="mt-4 text-sm text-text-secondary">
                  {p.manifest.metadata.description || "No description provided."}
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-text-secondary uppercase text-[10px] font-semibold tracking-wider">State</div>
                    <div className="text-text-primary mt-0.5">{p.state}</div>
                  </div>
                  <div>
                    <div className="text-text-secondary uppercase text-[10px] font-semibold tracking-wider">Dependencies</div>
                    <div className="text-text-primary mt-0.5">{p.manifest.dependencies?.length || 0} required</div>
                  </div>
                  <div>
                    <div className="text-text-secondary uppercase text-[10px] font-semibold tracking-wider">Nav Nodes</div>
                    <div className="text-text-primary mt-0.5">{p.navigationNodes?.length || 0} nodes</div>
                  </div>
                  <div>
                    <div className="text-text-secondary uppercase text-[10px] font-semibold tracking-wider">Actions</div>
                    <div className="text-text-primary mt-0.5">{p.actions?.length || 0} registered</div>
                  </div>
                </div>

                <CapabilityGrid plugin={p} />
              </div>
            ))
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-primary border-b border-border pb-2 mb-4">Registry Snapshot</h2>
          <div className="bg-[#0d1117] border border-border rounded-xl p-4 overflow-x-auto">
            <pre className="text-xs text-text-secondary font-mono leading-relaxed">
              {snapshot || "Loading snapshot..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
