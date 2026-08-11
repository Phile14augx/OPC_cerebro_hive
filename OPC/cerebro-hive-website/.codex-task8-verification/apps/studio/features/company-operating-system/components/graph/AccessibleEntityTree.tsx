"use client";

import type { OperatingNode } from "@cerebro/shared-types";

export function AccessibleEntityTree({ nodes, selectedIds, onSelect, onInspect, onPreview }: { nodes: readonly OperatingNode[]; selectedIds: readonly string[]; onSelect: (id: string, multi: boolean) => void; onInspect: (id: string) => void; onPreview: (id: string | null) => void }) {
  return <section aria-label="Company brain entities" className="absolute bottom-3 left-3 z-10 max-h-40 overflow-auto border border-[var(--company-os-border)] bg-[var(--company-os-panel)] p-2">
    <h2>Company brain entities</h2>
    <ul>
      {nodes.map((node) => <li key={node.id}>
        <button aria-pressed={selectedIds.includes(node.id)} onBlur={() => onPreview(null)} onClick={(event) => onSelect(node.id, event.shiftKey)} onDoubleClick={() => onInspect(node.id)} onMouseEnter={() => onPreview(node.id)} onMouseLeave={() => onPreview(null)} onFocus={() => onPreview(node.id)} type="button">{node.type[0].toUpperCase() + node.type.slice(1)}: {node.label}</button>
      </li>)}
    </ul>
  </section>;
}
