interface AIAgentMetrics {
  requestId: string;
  model: string;
  durationMs: number;
  tokens: number;
  success: boolean;
  error?: string;
}

export function recordMetrics(metrics: AIAgentMetrics) {
  // In a production environment, this would push to Datadog, Sentry, or PostHog.
  // For V1, we log structured JSON to stdout for log aggregators to pick up.
  console.log(JSON.stringify({
    event: "CEREBRO_PM_AGENT_EXECUTION",
    timestamp: new Date().toISOString(),
    ...metrics,
  }));
}
