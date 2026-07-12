import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Research",
};

export default function ResearchPage() {
  return (
    <div className="section-pad container-wide">
      <SectionHeading 
        label="Innovation"
        title="CerebroHive Research"
        description="Advancing the frontier of agentic AI and enterprise intelligence."
      />
    </div>
  );
}
