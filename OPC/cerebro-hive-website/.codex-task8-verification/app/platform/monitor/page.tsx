import type { Metadata } from "next";

import { ProductPage, type ProductPanel } from "@/components/platform/ProductPage";

export const metadata: Metadata = {
  title: "HiveMonitor — CerebroHive Platform",
  description: "HiveMonitor is CerebroHive's real-time telemetry plane: traces, metrics, logs, and events with SLO burn-rate alerting across every service, agent, and workflow.",
};

const PANELS: ProductPanel[] = [
    {
      title: "Signals collected",
      description: "The four telemetry classes on every capability.",
      items: [
        "Traces — OpenTelemetry spans across agent and service hops",
        "Metrics — RED and USE series per service and per tenant",
        "Logs — structured, correlation-ID joined to traces",
        "Events — lifecycle transitions published to the Event Bus",
      ],
    },
    {
      title: "Health model",
      description: "How readiness is decided rather than guessed.",
      items: [
        "Liveness and readiness probes per workload",
        "Dependency health rollup with circuit-breaker state",
        "SLO definitions with burn-rate alerting",
        "Synthetic canaries for critical user journeys",
      ],
    },
    {
      title: "Agent-specific observability",
      description: "Signals conventional APM does not capture.",
      items: [
        "Token consumption and cost per agent run",
        "Tool-invocation success rate and latency",
        "Reasoning-step depth and re-planning frequency",
        "Human-in-the-loop escalation rate",
        "Output validation and reflection failures",
      ],
    },
    {
      title: "Routing and response",
      description: "What happens when a signal breaches.",
      items: [
        "Severity-scored alerts with de-duplication",
        "On-call routing with escalation policies",
        "Auto-attached trace context on every incident",
        "Post-incident timeline reconstruction",
      ],
    },
];

export default function Page() {
  return (
    <ProductPage
      name={"HiveMonitor™"}
      tier={2}
      headline={"Real-time telemetry, tracing, and health checks across the mesh"}
      summary={"HiveMonitor is the observability standard every CerebroHive capability inherits. Where HiveObservatory is the analytical surface over long-horizon telemetry, HiveMonitor is the always-on signal plane: liveness, saturation, latency, and error budgets for every service, agent, and workflow in the estate."}
      panels={PANELS}
    />
  );
}
