import { Metadata } from "next";
import Link from "next/link";
import {
  Layers,
  Package,
  Briefcase,
  Factory,
  FlaskConical,
  GraduationCap,
  Newspaper,
  Code2,
  Wrench,
  Building2,
  Scale,
  ArrowUpRight,
  Map,
  type LucideIcon,
} from "lucide-react";
import { sitemapSections, sitemapPageCount } from "@/lib/data/sitemap";

export const metadata: Metadata = {
  title: "Site Map | CerebroHive",
  description:
    "A complete map of the CerebroHive website — platform, products, services, industries, research, academy, resources, and more.",
};

const iconMap: Record<string, LucideIcon> = {
  Layers,
  Package,
  Briefcase,
  Factory,
  FlaskConical,
  GraduationCap,
  Newspaper,
  Code2,
  Wrench,
  Building2,
  Scale,
};

export default function SitemapPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative py-24 border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,122,0.05),transparent_70%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-strong) 1px, transparent 1px), linear-gradient(90deg, var(--border-strong) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="container-wide relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-4 h-4 text-primary-accent" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent">
              Navigation
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">
            Site Map
          </h1>
          <p className="text-text-secondary font-inter leading-relaxed mb-8">
            Every corner of CerebroHive in one place — from platform
            capabilities and packaged products to research programs, learning
            paths, and legal policies.
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full bg-surface border border-border text-xs font-inter text-text-secondary">
              <span className="font-bold text-text-primary">
                {sitemapSections.length}
              </span>{" "}
              sections
            </span>
            <span className="px-4 py-2 rounded-full bg-surface border border-border text-xs font-inter text-text-secondary">
              <span className="font-bold text-text-primary">
                {sitemapPageCount}
              </span>{" "}
              pages
            </span>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-16">
        <div className="container-wide">
          <div className="columns-1 md:columns-2 xl:columns-3 gap-6 [column-fill:_balance]">
            {sitemapSections.map((section) => {
              const Icon = iconMap[section.iconName] ?? Layers;
              return (
                <div
                  key={section.title}
                  className="mb-6 break-inside-avoid rounded-2xl bg-surface border border-border p-6 hover:border-border-strong transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-elevated border border-border flex items-center justify-center">
                        <Icon
                          className="w-4 h-4 text-primary-accent"
                          aria-hidden="true"
                        />
                      </div>
                      <h2 className="text-lg font-space font-bold text-text-primary">
                        {section.title}
                      </h2>
                    </div>
                    <span className="text-[10px] font-bold text-text-muted bg-surface-elevated border border-border rounded-full px-2 py-0.5">
                      {section.links.length}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted font-inter mb-4 leading-relaxed">
                    {section.description}
                  </p>
                  <ul className="flex flex-col">
                    {section.links.map((link) => (
                      <li key={link.href + link.label}>
                        <Link
                          href={link.href}
                          className="group flex items-center justify-between py-2 px-2 -mx-2 rounded-lg text-sm font-inter text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                        >
                          <span>{link.label}</span>
                          <ArrowUpRight
                            className="w-3.5 h-3.5 text-text-disabled opacity-0 group-hover:opacity-100 group-hover:text-primary-accent transition-opacity"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* XML sitemap note */}
          <div className="mt-10 rounded-2xl border border-dashed border-border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-space font-bold text-text-primary mb-1">
                Looking for the machine-readable version?
              </h3>
              <p className="text-xs text-text-muted font-inter">
                Search engines and crawlers can use our XML sitemap.
              </p>
            </div>
            <a
              href="/sitemap.xml"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-accent hover:underline shrink-0"
            >
              sitemap.xml <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
