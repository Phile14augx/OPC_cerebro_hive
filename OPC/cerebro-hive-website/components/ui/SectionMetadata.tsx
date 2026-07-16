import React from "react";
import { cn } from "@/lib/utils";

interface SectionMetadataProps {
  sectionNumber: string;
  title: string;
  version?: string;
  className?: string;
}

export const SectionMetadata = ({ sectionNumber, title, version, className }: SectionMetadataProps) => {
  return (
    <div className={cn("flex flex-wrap items-center gap-4 mb-12", className)}>
      <div className="h-[1px] w-12 bg-surface-elevated" />
      <span className="text-[10px] font-space font-bold tracking-widest uppercase text-text-muted">
        SECTION {sectionNumber}
      </span>
      <div className="w-1 h-1 rounded-full bg-surface-elevated" />
      <h2 className="text-[10px] font-space font-bold tracking-[0.2em] uppercase text-primary-accent">
        {title}
      </h2>
      {version && (
        <>
          <div className="w-1 h-1 rounded-full bg-surface-elevated" />
          <span className="text-[10px] font-mono text-text-muted">
            v{version}
          </span>
        </>
      )}
    </div>
  );
};
