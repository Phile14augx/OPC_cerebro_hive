"use client";

import React, { Suspense } from "react";
import manifest from "./manifest.json";
import { BaseIconProps } from "./types";

export interface DynamicIconProps extends BaseIconProps {
  name: string;
  fallback?: React.ReactNode;
}

// Map the manifest into a quick lookup for category/component
const iconMap = new Map<string, { component: string; category: string }>(
  manifest.map((item) => [item.id, { component: item.component, category: item.category }]),
);

const iconComponents = new Map<string, React.LazyExoticComponent<React.ComponentType<BaseIconProps>>>(
  manifest.map((item) => [
    item.id,
    React.lazy(async () => {
      const iconModule = await import(`./${item.category}/index`);
      const component = iconModule[item.component];

      if (typeof component !== "function") {
        throw new Error(`Icon component "${item.component}" is not available in ${item.category}.`);
      }

      return { default: component };
    }),
  ]),
);

export const Icon = ({ name, fallback = null, ...props }: DynamicIconProps) => {
  const meta = iconMap.get(name);

  if (!meta) {
    console.warn(`Icon "${name}" not found in manifest.`);
    return <>{fallback}</>;
  }

  const DynamicComponent = iconComponents.get(name);

  if (!DynamicComponent) {
    console.warn(`Icon "${name}" has no registered component.`);
    return <>{fallback}</>;
  }

  return (
    <Suspense fallback={fallback}>
      {React.createElement(DynamicComponent, props)}
    </Suspense>
  );
};
