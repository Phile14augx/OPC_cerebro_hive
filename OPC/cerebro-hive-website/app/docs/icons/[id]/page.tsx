import { iconRegistry } from "@/components/ui/icons/IconRegistry";
import { notFound } from "next/navigation";
import React from "react";

// For static generation
export function generateStaticParams() {
  return Object.keys(iconRegistry).map((id) => ({
    id: id,
  }));
}

export default function IconDocumentationPage({ params }: { params: { id: string } }) {
  const iconId = params.id;
  const meta = iconRegistry[iconId];

  if (!meta) {
    notFound();
  }

  // We have the metadata, but we need the actual React Component dynamically.
  // In a real setup, we'd have a map of components exported. For this docs page,
  // we could just show the metadata and code snippets.
  
  const componentName = meta.displayName || meta.name || iconId;
  const importStatement = `import { ${componentName} } from "@/components/ui/icons/${meta.category}";`;
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-8 border-b border-border pb-6">
        <h1 className="text-4xl font-bold text-text-primary mb-2">{componentName}</h1>
        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1 bg-surface-elevated text-text-secondary text-sm rounded-full">v{meta.version}</span>
          <span className="px-3 py-1 bg-surface-elevated text-text-secondary text-sm rounded-full">{meta.stability}</span>
          <span className="px-3 py-1 bg-surface-elevated text-text-secondary text-sm rounded-full capitalize">{meta.category}</span>
        </div>
        <p className="text-text-muted text-lg">Category: {meta.category} {meta.subcategory && `/ ${meta.subcategory}`}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div 
          className="icon-preview-container bg-surface border border-border rounded-xl p-8 flex items-center justify-center min-h-[300px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-primary"
          tabIndex={0}
        >
          {/* We'd render the actual icon here if we statically imported it */}
          <div className="text-center text-text-muted">
            <div className="w-24 h-24 mx-auto mb-4 bg-surface-elevated rounded animate-pulse" />
            <p>Visual Preview</p>
          </div>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Usage</h2>
            <div className="bg-surface-elevated p-4 rounded-lg overflow-x-auto">
              <code className="text-sm text-accent-primary">{importStatement}</code>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Metadata</h2>
            <ul className="space-y-2 text-text-secondary">
              <li><strong className="text-text-primary">Introduced:</strong> {meta.introduced}</li>
              {meta.keywords && meta.keywords.length > 0 && (
                <li><strong className="text-text-primary">Keywords:</strong> {meta.keywords.join(", ")}</li>
              )}
              {meta.aliases && meta.aliases.length > 0 && (
                <li><strong className="text-text-primary">Aliases:</strong> {meta.aliases.join(", ")}</li>
              )}
              {meta.intent && meta.intent.length > 0 && (
                <li><strong className="text-text-primary">Intent:</strong> {meta.intent.join(", ")}</li>
              )}
            </ul>
          </section>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Accessibility</h2>
        <p className="text-text-secondary mb-4">
          By default, icons are treated as decorative (`role="presentation"`). 
          To make them semantically meaningful, provide a `label` and optional `description`.
        </p>
        <div className="bg-surface-elevated p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code className="text-accent-secondary">{`<${componentName}\n  decorative={false}\n  label="${componentName} action"\n  description="Detailed description for screen readers"\n/>`}</code>
          </pre>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Supported Animations</h2>
        <p className="text-text-secondary mb-4">
          This icon inherits all motion states from the global animation taxonomy.
          Use the `animation` prop to apply states like `pulse`, `orbit`, or `scan`.
        </p>
        <div className="bg-surface-elevated p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code className="text-accent-secondary">{`<${componentName} animation="pulse" />\n<${componentName} animation="scan" color="success" />`}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}
