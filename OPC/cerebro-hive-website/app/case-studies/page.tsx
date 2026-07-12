import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Case Studies",
};

export default function CaseStudiesPage() {
  return (
    <div className="section-pad container-wide">
      <SectionHeading 
        label="Impact"
        title="Enterprise Outcomes"
        description="Explore how we have transformed Fortune 500 companies with AI-native engineering."
      />
    </div>
  );
}
