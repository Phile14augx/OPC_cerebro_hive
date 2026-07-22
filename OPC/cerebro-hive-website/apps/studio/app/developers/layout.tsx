import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Book, Code, Cpu, Activity, ListOrdered, Calendar, GitCommit } from "lucide-react";
import { JsonLd } from "@/components/discovery";
import { buildBreadcrumbSchema } from "@/lib/discovery";

export const metadata: Metadata = {
  title: {
    default: "Developer Platform | CerebroHive",
    template: "%s | CerebroHive Developers",
  },
  description: "CerebroHive Developer Platform — REST API reference, Python/TypeScript SDKs, MCP servers, CLI tools, architecture guides, and OpenAPI specification for building enterprise AI on CerebroHive.",
  keywords: ["CerebroHive API", "enterprise AI SDK", "AI developer platform", "MCP server", "AI API reference", "LLM API documentation"],
  alternates: { canonical: "https://cerebropchive.org/developers" },
};

const navItems = [
  { label: "Getting Started", href: "/developers", icon: Book },
  { label: "API Reference", href: "/developers/api", icon: Code },
  { label: "Architecture", href: "/developers/architecture", icon: Cpu },
  { label: "Release Notes", href: "/developers/releases", icon: ListOrdered },
  { label: "Changelog", href: "/developers/changelog", icon: GitCommit },
  { label: "Roadmap", href: "/developers/roadmap", icon: Calendar },
  { label: "System Status", href: "/status", icon: Activity },
];

const breadcrumbSchema = buildBreadcrumbSchema([
  { label: "Home", href: "/" },
  { label: "Developers", href: "/developers" },
]);

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <div className="min-h-screen bg-background pt-4 pb-20">
        <div className="container-wide flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0 border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-6">
            <div className="sticky top-28">
              <h2 className="text-xs uppercase tracking-widest text-text-muted font-bold mb-6 px-3">
                Developer Portal
              </h2>
              <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors whitespace-nowrap"
                  >
                    <item.icon size={16} className="text-primary-accent" />
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="hidden md:block mt-12 px-3">
                <div className="p-4 rounded-xl bg-surface border border-border">
                  <h4 className="text-xs font-bold text-text-primary mb-2">Need Help?</h4>
                  <p className="text-[11px] text-text-muted mb-4">Join our developer community or contact enterprise support.</p>
                  <Link href="/community" className="text-xs text-primary-accent font-medium hover:underline">
                    Join Community &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
