import React, { Suspense } from "react";
import { BaseIconProps } from "./types";
import manifest from "./manifest.json";

export interface DynamicIconProps extends BaseIconProps {
  name: string;
  fallback?: React.ReactNode;
}

// Map the manifest into a quick lookup for category/component
const iconMap = new Map<string, { component: string; category: string }>(
  manifest.map((item) => [item.id, { component: item.component, category: item.category }])
);

export const Icon = ({ name, fallback = null, ...props }: DynamicIconProps) => {
  const meta = iconMap.get(name);
  
  if (!meta) {
    console.warn(`Icon "${name}" not found in manifest.`);
    return <>{fallback}</>;
  }

  // Dynamically import the icon from its category bundle
  const DynamicComponent = React.lazy(() =>
    import(`./${meta.category}/index`).then(module => ({
      default: (module as Record<string, React.ComponentType<BaseIconProps>>)[meta.component]
    }))
  );

  return (
    <Suspense fallback={fallback}>
      <DynamicComponent {...props} />
    </Suspense>
  );
};
