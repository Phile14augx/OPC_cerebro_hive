import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Industries",
};

export default function IndustriesPage() {
  return (
    <div className="section-pad container-wide">
      <SectionHeading 
        label="Sectors"
        title="AI for Every Industry"
        description="Tailored intelligence solutions for finance, healthcare, manufacturing, and beyond."
      />
    </div>
  );
}
