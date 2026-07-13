import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  label?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
}

export function SectionHeading({
  label,
  title,
  description,
  align = "center",
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center mx-auto" : "items-start text-left",
        className
      )}
      {...props}
    >
      {label && (
        <span className="inline-flex items-center gap-2 font-space text-xs font-semibold uppercase tracking-widest text-primary-accent py-1 px-3 rounded-full bg-primary-accent/10 border border-primary-accent/20">
          {label}
        </span>
      )}
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary max-w-3xl">
        {title}
      </h2>
      {description && (
        <p className="text-lg md:text-xl text-text-muted max-w-2xl font-inter">
          {description}
        </p>
      )}
    </div>
  );
}
