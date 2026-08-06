import type { DashboardSnapshot } from "./types";

const healthClasses = {
  Healthy: "border-primary-accent/30 bg-primary-accent/10 text-primary-accent",
  Degraded: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  "At risk": "border-red-400/30 bg-red-400/10 text-red-300",
} as const;

const alertClasses = {
  Critical: "border-red-400/30 bg-red-400/10 text-red-300",
  Warning: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  Info: "border-sky-400/30 bg-sky-400/10 text-sky-300",
} as const;

const alertPriority = {
  Critical: 3,
  Warning: 2,
  Info: 1,
} as const;

export function CerebroSphereDashboard({ snapshot }: { snapshot: DashboardSnapshot }) {
  const prioritizedAlerts = [...snapshot.alerts].sort(
    (left, right) =>
      Number(right.requiresAttention) - Number(left.requiresAttention) ||
      alertPriority[right.severity] - alertPriority[left.severity],
  );

  return (
    <main
      aria-labelledby="cerebrosphere-title"
      className="min-h-screen bg-background text-text-primary"
    >
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
        <header className="border-b border-border pb-7 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-accent">
              Executive command center
            </p>
            <h1
              id="cerebrosphere-title"
              className="mt-3 font-space text-4xl font-bold tracking-tight sm:text-5xl"
            >
              CerebroSphere
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
              A concise operating view for the {snapshot.role}.
            </p>
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary sm:mt-0">
            Executive role: {snapshot.role}
          </p>
        </header>

        <section aria-labelledby="business-kpis-heading" className="mt-8">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="business-kpis-heading" className="font-space text-xl font-bold">
              Business KPIs
            </h2>
            <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
              Current outlook
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {snapshot.kpis.map((kpi) => (
              <article
                key={kpi.label}
                className="rounded-xl border border-border bg-surface p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                  {kpi.label}
                </p>
                <p className="mt-3 font-space text-3xl font-bold tracking-tight">{kpi.value}</p>
                <p className="mt-3 text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">Trend: {kpi.trend}</span> ·{" "}
                  {kpi.comparison}
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section aria-labelledby="product-health-heading">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 id="product-health-heading" className="font-space text-xl font-bold">
                Product Health
              </h2>
              <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
                Service status
              </p>
            </div>
            <div className="space-y-3">
              {snapshot.products.map((product) => (
                <article
                  key={product.name}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-space text-lg font-semibold">{product.name}</h3>
                      <p className="mt-1 text-sm text-text-secondary">{product.note}</p>
                    </div>
                    <span
                      className={[
                        "inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold",
                        healthClasses[product.health],
                      ].join(" ")}
                    >
                      Health: {product.health}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-text-secondary">
                    Availability:{" "}
                    <span className="font-medium text-text-primary">{product.availability}</span>
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="agent-activity-heading">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 id="agent-activity-heading" className="font-space text-xl font-bold">
                Agent Activity
              </h2>
              <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
                Latest events
              </p>
            </div>
            <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
              {snapshot.activities.map((activity) => (
                <li key={[activity.agent, activity.timestamp].join("-")} className="p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-space text-lg font-semibold">{activity.agent}</h3>
                      <p className="mt-1 text-sm text-text-secondary">{activity.summary}</p>
                    </div>
                    <time className="text-xs font-medium uppercase tracking-[0.14em] text-text-secondary">
                      {activity.timestamp}
                    </time>
                  </div>
                  <p className="mt-4 text-sm text-text-secondary">
                    Status: <span className="font-medium text-text-primary">{activity.state}</span>
                  </p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section aria-labelledby="system-alerts-heading" className="mt-8">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 id="system-alerts-heading" className="font-space text-xl font-bold">
              System Alerts
            </h2>
            <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
              Prioritized for review
            </p>
          </div>
          <div className="space-y-3">
            {prioritizedAlerts.map((alert) => (
              <article key={alert.title} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-space text-lg font-semibold">{alert.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">{alert.detail}</p>
                  </div>
                  <span
                    className={[
                      "inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold",
                      alertClasses[alert.severity],
                    ].join(" ")}
                  >
                    Severity: {alert.severity}
                  </span>
                </div>
                <p className="mt-4 text-sm text-text-secondary">
                  {alert.requiresAttention ? "Action required" : "No action required"}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
