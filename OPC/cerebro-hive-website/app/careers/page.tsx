import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Careers",
};

export default function CareersPage() {
  return (
    <div className="section-pad container-wide">
      <SectionHeading 
        label="Join Us"
        title="Build the Future of Intelligence"
        description="We are looking for elite engineers, researchers, and architects to join our mission."
      />
    </div>
  );
}
