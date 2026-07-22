"use client";

import React from "react";
import { EnterpriseService } from "@/lib/data/types";
import { SectionRegistry } from "./SectionRegistry";

interface ServiceRendererProps {
  service: EnterpriseService;
}

export const ServiceRenderer = ({ service }: ServiceRendererProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background font-inter">
      {service.config.sections.map((sectionId, index) => {
        const SectionComponent = SectionRegistry[sectionId];
        
        if (!SectionComponent) {
          console.warn(`Section component not found for ID: ${sectionId}`);
          return null;
        }

        // We wrap each section in a fragment to ensure it receives the service prop correctly
        // Null-returning components (like ones merged into others) will simply render nothing.
        return <SectionComponent key={`${sectionId}-${index}`} service={service} />;
      })}
    </div>
  );
};
