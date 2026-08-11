"use client";

import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrackedLink } from "@/components/cerebro/TrackedLink";
import { TrackedButton } from "@/components/cerebro/TrackedButton";

interface CapabilityCTAProps {
  liveDemoUrl?: string;
  liveDemoLabel?: string;
  capabilityTitle: string;
}

/**
 * Client-side interactive CTA row for the platform capability page.
 * Extracted into its own "use client" component because the parent
 * page is an async Server Component (uses generateStaticParams /
 * generateMetadata) and cannot itself cross the client boundary.
 */
export function CapabilityCTA({ liveDemoUrl, liveDemoLabel, capabilityTitle }: CapabilityCTAProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
      {liveDemoUrl && (
        <TrackedLink
          href={liveDemoUrl}
          analyticsEvent="platform_capability_live_demo_click"
          analyticsCategory="platform"
          analyticsLabel={liveDemoLabel || `Try It Live — ${capabilityTitle}`}
          className="w-full sm:w-auto px-8 py-4 bg-primary-accent text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg transition-transform hover:-translate-y-1 shadow-elevated flex items-center justify-center gap-2"
        >
          <Cpu size={16} /> {liveDemoLabel || "Try It Live"}
        </TrackedLink>
      )}
      <TrackedButton
        eventCategory="platform"
        eventLabel={`Request Architecture Brief — ${capabilityTitle}`}
        className={cn(
          "w-full sm:w-auto px-8 py-4 font-space font-bold text-sm uppercase tracking-widest rounded-lg transition-all",
          liveDemoUrl
            ? "bg-transparent border border-border text-text-primary hover:border-border-default hover:bg-surface"
            : "bg-primary-accent text-text-primary hover:-translate-y-1 shadow-elevated"
        )}
      >
        Request Architecture Brief
      </TrackedButton>
    </div>
  );
}
