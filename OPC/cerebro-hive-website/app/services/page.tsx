import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Services",
};

export default function ServicesPage() {
  return (
    <div className="section-pad container-wide">
      <SectionHeading 
        label="Capabilities"
        title="World-Class Consulting & Delivery"
        description="From architecture to deployment, we build intelligent systems for the modern enterprise."
      />
    </div>
  );
}
