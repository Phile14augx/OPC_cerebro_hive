"use client";

import { useEffect, useState } from "react";
import { platformRegistry } from "../core/registry/PlatformRegistry";
import { Plugin } from "../core/contracts/plugin";

export default function CatalogExplorerPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [activeTab, setActiveTab] = useState<"clouds" | "services" | "providers">("clouds");

  useEffect(() => {
    // Basic polling or listening to registry updates could happen here
    const checkRegistry = () => {
      setPlugins(platformRegistry.getAll());
    };
    checkRegistry();
    const interval = setInterval(checkRegistry, 1000); // Polling for demo UX
    return () => clearInterval(interval);
  }, []);

  const renderClouds = () => {
    const clouds = plugins.filter(p => p.manifest.kind === "cloud");
    if (clouds.length === 0) return <div className="text-text-secondary">No clouds registered.</div>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clouds.map(c => (
          <div key={c.manifest.metadata.id} className="border border-border bg-surface/30 p-6 rounded-xl hover:border-primary-accent/50 transition-colors cursor-pointer group">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{c.manifest.metadata.icon || "☁️"}</div>
            <h3 className="text-lg font-bold text-text-primary">{c.manifest.metadata.name}</h3>
            <p className="text-sm text-text-secondary mt-2">{c.manifest.metadata.description}</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs bg-surface border border-border px-2 py-1 rounded">v{c.manifest.metadata.version}</span>
              <span className="text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded">{c.health}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderServices = () => {
    // In our mock, DatabaseCloud registers actions/services implicitly for now.
    // We would have actual service plugins. Let's mock a Postgres service view.
    return (
      <div className="border border-border bg-surface/30 p-6 rounded-xl">
        <h3 className="text-xl font-bold text-text-primary mb-2">Managed PostgreSQL</h3>
        <p className="text-sm text-text-secondary">High-performance distributed PostgreSQL cluster.</p>
        
        <div className="mt-6">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">Capabilities</h4>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-primary-accent/10 text-primary-accent px-2 py-1 rounded border border-primary-accent/20">Relational DB</span>
            <span className="text-xs bg-primary-accent/10 text-primary-accent px-2 py-1 rounded border border-primary-accent/20">Point-in-Time Recovery</span>
            <span className="text-xs bg-primary-accent/10 text-primary-accent px-2 py-1 rounded border border-primary-accent/20">Monitoring</span>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">Provider Comparison</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* AWS RDS Provider Card */}
            <div className="border border-green-500/30 bg-green-500/5 p-4 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">RECOMMENDED</div>
              <div className="font-bold text-text-primary">AWS RDS (us-east-1)</div>
              <div className="text-xs text-text-secondary mt-1">Cost Estimate: <span className="text-text-primary font-medium">$150 / mo</span></div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-xs text-text-secondary"><span className="text-green-500">✓</span> Supports PITR Backups</div>
                <div className="flex items-center gap-2 text-xs text-text-secondary"><span className="text-green-500">✓</span> Low Latency (Multi-AZ)</div>
              </div>
              <button className="mt-4 w-full bg-surface border border-border text-text-primary text-xs font-semibold py-2 rounded hover:bg-white hover:text-black transition-colors">
                Select Provider
              </button>
            </div>

            {/* Azure Provider Card */}
            <div className="border border-border bg-surface/50 p-4 rounded-lg">
              <div className="font-bold text-text-primary">Azure Flexible Server</div>
              <div className="text-xs text-text-secondary mt-1">Cost Estimate: <span className="text-text-primary font-medium">$145 / mo</span></div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-xs text-text-secondary"><span className="text-yellow-500">⚠</span> Partial PITR Support</div>
                <div className="flex items-center gap-2 text-xs text-text-secondary"><span className="text-green-500">✓</span> Medium Latency</div>
              </div>
              <button className="mt-4 w-full bg-surface border border-border text-text-secondary text-xs font-semibold py-2 rounded hover:text-text-primary transition-colors">
                Select Provider
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Service Catalog</h1>
        <p className="text-text-secondary mt-2">
          Discover, compare, and provision infrastructure across the Enterprise AI Cloud.
        </p>
      </div>

      <div className="flex items-center gap-4 border-b border-border">
        {(["clouds", "services", "providers"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab ? "border-primary-accent text-primary-accent" : "border-transparent text-text-secondary hover:text-text-primary"}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "clouds" && renderClouds()}
        {activeTab === "services" && renderServices()}
        {activeTab === "providers" && <div className="text-text-secondary">Provider Explorer (To be implemented)</div>}
      </div>
    </div>
  );
}
