import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="section-pad container-wide">
      <SectionHeading 
        label="Get in Touch"
        title="Start Your Transformation"
        description="Schedule a strategy session with our enterprise AI architects."
      />
    </div>
  );
}
