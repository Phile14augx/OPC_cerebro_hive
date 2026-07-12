import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Resources",
};

export default function ResourcesPage() {
  return (
    <div className="section-pad container-wide">
      <SectionHeading 
        label="Downloads"
        title="Knowledge Hub"
        description="Whitepapers, architecture diagrams, and templates for AI integration."
      />
    </div>
  );
}
