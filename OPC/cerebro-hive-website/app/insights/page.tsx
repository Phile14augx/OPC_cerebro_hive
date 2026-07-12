import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Insights",
};

export default function InsightsPage() {
  return (
    <div className="section-pad container-wide">
      <SectionHeading 
        label="Thought Leadership"
        title="Engineering Insights"
        description="Articles, engineering deep-dives, and perspectives from our experts."
      />
    </div>
  );
}
