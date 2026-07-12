import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Solutions",
};

export default function SolutionsPage() {
  return (
    <div className="section-pad container-wide">
      <SectionHeading 
        label="Offerings"
        title="Enterprise Solutions"
        description="Scalable AI, agentic workflows, and digital transformation architectures."
      />
    </div>
  );
}
