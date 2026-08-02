import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export type ProductPanel = {
  /** Panel heading, e.g. "Forecast horizons". */
  title: string;
  /** One-line explanation of what the panel covers. */
  description: string;
  /** Bullet items rendered as a checklist. */
  items: string[];
};

export type ProductPageProps = {
  /** Trademarked product name, e.g. "HiveMonitor™". */
  name: string;
  /** Platform tier the product belongs to (see CEREBROHIVE_CONSTITUTION.md §5). */
  tier: number;
  /** Page <h1> — the product's value proposition. */
  headline: string;
  /** Supporting paragraph beneath the headline. */
  summary: string;
  /** Capability panels. */
  panels: ProductPanel[];
  /**
   * Which of the constitution's Required Standards (§15) this product
   * inherits. Rendered as a compliance strip so the standard is visible,
   * not just asserted in a document.
   */
  standards?: string[];
};

const DEFAULT_STANDARDS = [
  "HiveIdentity authentication",
  "RBAC",
  "Immutable audit log",
  "Event Bus publishing",
  "HiveMonitor observability",
  "OpenAPI contract",
  "Usage telemetry",
];

/**
 * Shared shell for CerebroHive product pages.
 *
 * Rendered as a server component so every product page ships real metadata
 * and server-rendered copy — the older `"use client"` product pages cannot
 * export `metadata`, which is why their SEO surface is empty.
 */
export function ProductPage({
  name,
  tier,
  headline,
  summary,
  panels,
  standards = DEFAULT_STANDARDS,
}: ProductPageProps) {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-8">
      <Link
        href="/platform"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary transition-colors hover:text-primary-accent"
      >
        <ArrowLeft size={14} aria-hidden="true" /> Platform
      </Link>

      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-primary-accent">
        {name} · Tier {tier}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-text-primary md:text-4xl">{headline}</h1>
      <p className="mt-3 max-w-3xl text-text-secondary">{summary}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {panels.map((panel) => (
          <section key={panel.title} className="rounded-2xl border border-border bg-surface/40 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
              {panel.title}
            </h2>
            <p className="mt-2 text-sm text-text-primary">{panel.description}</p>
            <ul className="mt-3 space-y-1.5">
              {panel.items.map((item) => (
                <li key={item} className="flex gap-2 text-xs text-text-secondary">
                  <span aria-hidden="true" className="text-primary-accent">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-primary-accent/30 bg-primary-accent/5 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-text-secondary">
          Inherited platform standards
        </h2>
        <p className="mt-2 text-xs text-text-secondary">
          Every CerebroHive capability inherits the same non-negotiable standards.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {standards.map((standard) => (
            <li
              key={standard}
              className="rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-text-secondary"
            >
              {standard}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default ProductPage;
