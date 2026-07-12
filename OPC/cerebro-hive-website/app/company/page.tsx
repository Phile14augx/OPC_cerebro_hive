import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Company",
};

export default function CompanyPage() {
  return (
    <div className="section-pad container-wide">
      <SectionHeading 
        label="About Us"
        title="Engineering the Next Generation"
        description="We architect enterprise AI systems, build production software, and transform businesses through AI-native engineering."
      />
    </div>
  );
}
