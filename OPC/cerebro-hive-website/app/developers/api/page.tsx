import React from "react";
import { Server, Lock, Globe2 } from "lucide-react";

export default function ApiReferencePage() {
  return (
    <div className="flex flex-col gap-12 pb-12">
      <div className="border-b border-border pb-8">
        <h1 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-4">
          API Reference
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl">
          Complete documentation for the CerebroHive REST API. Manage agents, ingest data, and orchestrate complex enterprise workflows programmatically.
        </p>
      </div>

      {/* Auth Section */}
      <section>
        <h2 className="text-2xl font-space font-bold text-text-primary mb-4 flex items-center gap-2">
          <Lock size={20} className="text-primary-accent" /> Authentication
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          The CerebroHive API uses Bearer tokens for authentication. You can generate API keys from your Enterprise Dashboard.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-text-primary mb-2">Bearer Token</h3>
            <p className="text-xs text-text-muted mb-4">Include your API key in the Authorization header of every request.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#0d1117] border border-border font-mono text-[13px] text-gray-300 overflow-x-auto">
            <span className="text-pink-400">Authorization</span>: Bearer ch_live_xxxxxxxxxxxxx
          </div>
        </div>
      </section>

      {/* Base URL Section */}
      <section className="border-t border-border pt-12">
        <h2 className="text-2xl font-space font-bold text-text-primary mb-4 flex items-center gap-2">
          <Globe2 size={20} className="text-secondary-accent" /> Base URL
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          All API requests should be made to the regional endpoint closest to your deployment.
        </p>
        
        <div className="p-4 rounded-xl bg-surface-elevated border border-border">
          <code className="text-sm text-text-primary font-mono">https://api.cerebro-hive.com/v1</code>
        </div>
      </section>

      {/* Endpoints */}
      <section className="border-t border-border pt-12">
        <h2 className="text-2xl font-space font-bold text-text-primary mb-8 flex items-center gap-2">
          <Server size={20} className="text-primary-accent" /> Core Endpoints
        </h2>
        
        <div className="flex flex-col gap-12">
          {/* Endpoint 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 font-mono text-[10px] font-bold">GET</span>
                <code className="text-sm font-bold text-text-primary font-mono">/v1/agents</code>
              </div>
              <p className="text-sm text-text-secondary">
                List all AI agents configured in your enterprise workspace. Returns a paginated list of agent objects.
              </p>
              
              <div className="mt-4">
                <h4 className="text-xs font-bold text-text-primary mb-2">Query Parameters</h4>
                <ul className="text-xs flex flex-col gap-2">
                  <li className="flex justify-between py-2 border-b border-border/50">
                    <span className="font-mono text-text-muted">limit</span>
                    <span className="text-text-secondary">integer (max 100)</span>
                  </li>
                  <li className="flex justify-between py-2 border-b border-border/50">
                    <span className="font-mono text-text-muted">status</span>
                    <span className="text-text-secondary">enum [active, idle, error]</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="rounded-xl overflow-hidden border border-border bg-[#0d1117]">
                <div className="bg-surface px-4 py-2 border-b border-border text-xs text-text-muted font-mono flex justify-between">
                  <span>cURL Request</span>
                </div>
                <div className="p-4 font-mono text-[12px] text-gray-300 overflow-x-auto whitespace-pre">
<span className="text-blue-400">curl</span> https://api.cerebro-hive.com/v1/agents \<br/>
  -H <span className="text-yellow-300">"Authorization: Bearer ch_live_xxx"</span>
                </div>
              </div>
              
              <div className="rounded-xl overflow-hidden border border-border bg-[#0d1117]">
                <div className="bg-surface px-4 py-2 border-b border-border text-xs text-text-muted font-mono flex justify-between">
                  <span>Response (200 OK)</span>
                </div>
                <div className="p-4 font-mono text-[12px] text-green-300 overflow-x-auto whitespace-pre">
{`{
  "data": [
    {
      "id": "agt_9s8d7f",
      "name": "Procurement Optimizer",
      "model": "cerebro-v2-turbo",
      "status": "active"
    }
  ],
  "has_more": false
}`}
                </div>
              </div>
            </div>
          </div>

          {/* Endpoint 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold">POST</span>
                <code className="text-sm font-bold text-text-primary font-mono">/v1/workflows/trigger</code>
              </div>
              <p className="text-sm text-text-secondary">
                Trigger a predefined autonomous workflow synchronously. This will block until the workflow completes or times out.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="rounded-xl overflow-hidden border border-border bg-[#0d1117]">
                <div className="bg-surface px-4 py-2 border-b border-border text-xs text-text-muted font-mono flex justify-between">
                  <span>cURL Request</span>
                </div>
                <div className="p-4 font-mono text-[12px] text-gray-300 overflow-x-auto whitespace-pre">
<span className="text-blue-400">curl</span> -X POST https://api.cerebro-hive.com/v1/workflows/trigger \<br/>
  -H <span className="text-yellow-300">"Authorization: Bearer ch_live_xxx"</span> \<br/>
  -H <span className="text-yellow-300">"Content-Type: application/json"</span> \<br/>
  -d <span className="text-yellow-300">'{`{"workflow_id":"wf_123", "input":{"doc_id":"555"}}`}'</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
}
