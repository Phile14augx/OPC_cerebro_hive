"use client";

import React from "react";
import { PackagedProduct } from "@/lib/data/types";
import { ProductSectionRegistry } from "./ProductSectionRegistry";

interface ProductRendererProps {
  product: PackagedProduct;
}

export const ProductRenderer = ({ product }: ProductRendererProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-background font-inter">
      {product.config.sections.map((sectionId, index) => {
        const SectionComponent = ProductSectionRegistry[sectionId];

        if (!SectionComponent) {
          console.warn(`[ProductRenderer] No component registered for section: ${sectionId}`);
          return null;
        }

        return (
          <SectionComponent key={`${sectionId}-${index}`} product={product} />
        );
      })}
    </div>
  );
};
