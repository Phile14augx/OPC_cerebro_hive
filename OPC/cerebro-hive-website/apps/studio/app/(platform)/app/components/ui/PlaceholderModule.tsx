import { Construction } from "lucide-react";
import { Card } from "./Card";
import { Badge } from "./Badge";

export interface PlaceholderModuleProps {
  group: string;
  title: string;
  status: "planned" | "disabled";
}

/**
 * The single canonical "not yet available" component (D-06/D-07).
 * Locked composition per 01-UI-SPEC.md Component Contracts §1 — informational
 * only, no onClick/CTA prop.
 */
export function PlaceholderModule({ group, title, status }: PlaceholderModuleProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md p-8 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-surface-elevated border border-border flex items-center justify-center">
          <Construction size={22} className="text-text-muted" />
        </div>
        <div>
          <p className="text-xs font-[var(--font-weight-heading)] uppercase tracking-widest text-text-muted">
            {group} / {title}
          </p>
          <h1 className="text-lg font-space font-[var(--font-weight-heading)] text-text-primary mt-1">
            Not yet available
          </h1>
        </div>
        <p className="text-sm text-text-secondary">
          This module is part of the CerebroHive platform but is not enabled in this release.
        </p>
        <Badge variant="secondary" className="text-xs">
          Status: {status === "planned" ? "Planned" : "Disabled"}
        </Badge>
      </Card>
    </div>
  );
}
