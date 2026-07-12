import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata = {
  title: "Products",
};

export default function ProductsPage() {
  return (
    <div className="section-pad container-wide">
      <SectionHeading 
        label="Platforms"
        title="Intelligent Products"
        description="Discover Quantiva ERP and our suite of AI-native platforms."
      />
    </div>
  );
}
