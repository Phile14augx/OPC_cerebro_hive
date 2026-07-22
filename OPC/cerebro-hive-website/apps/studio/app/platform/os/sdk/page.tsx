"use client";

import { useEffect, useState } from "react";
import { checkOnline } from "../lib";
import { PillarShell } from "../PillarShell";

export default function SdkPage() {
  const [online, setOnline] = useState<boolean | null>(null);
  useEffect(() => { void checkOnline().then(setOnline); }, []);

  return (
    <PillarShell slug="sdk" online={online}>
      <section className="rounded-xl border border-border bg-surface/40 p-6">
        <h2 className="text-xl font-semibold text-text-primary">@cerebrohive/sdk</h2>
        <p className="mt-1 text-sm text-text-secondary">A typed TypeScript client over the entire platform API surface — one method group per domain, ships with the platform package.</p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-background p-4 text-xs text-text-secondary">{`import { createClient } from "@cerebrohive/sdk";

const cerebro = createClient({ baseUrl, apiKey });

await cerebro.swarm.run("Research X, then build it.");
await cerebro.router.route("Draft a Kubernetes manifest.");
await cerebro.compiler.compile("Compile this goal into a workflow.");
await cerebro.digitalTwin.supplyChain({ suppliers: 25, disruptionProbability: 0.25, avgLeadTimeDays: 21 });
await cerebro.research.registerPrompt({ name: "grounded-qa", template: "Answer from: {{sources}}" });
await cerebro.zeroTrust.grantTool({ agentId: "agent-1", tool: "deploy_kubernetes", allow: true });
await cerebro.dataPlatform.registerAsset({ name: "raw_events", kind: "stream", owner: "data-eng", freshnessSlaMinutes: 15 });`}</pre>
        <p className="mt-4 text-sm text-text-secondary">Method groups: <span className="text-primary-accent">ai, runtime, flow, router, compiler, swarm, actions, devops, mlops, secops, aiops, digitalTwin, research, zeroTrust, dataPlatform</span>.</p>
      </section>
    </PillarShell>
  );
}
