"use client";

import React, { useMemo, useState } from 'react';
import { MatrixItem, EngineConfig } from '@/lib/data/industries/types';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ArchitectureCanvas } from '@/components/architecture/ArchitectureCanvas';
import { Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const roiDotColor: Record<string, string> = {
  High: 'bg-accent-primary',
  Medium: 'bg-warning',
  Emerging: 'bg-accent-secondary',
};

function buildFlow(current: MatrixItem, config: EngineConfig) {
  const rawSteps = current.description.split('->').map(s => s.trim()).filter(Boolean);

  // Data already describes a multi-stage pipeline (e.g. "Transactions -> Risk Model -> Decision Engine")
  if (rawSteps.length > 1) {
    const nodes = rawSteps.map((step, i) => ({
      id: `step-${i}`,
      position: { x: 0, y: 0 },
      data: {
        label: step,
        type: i === 0 ? 'client' : i === rawSteps.length - 1 ? 'agent' : 'ai',
        status: i === rawSteps.length - 1 ? 'Active' : undefined,
      },
    }));
    const edges = rawSteps.slice(1).map((_, i) => ({
      id: `e-${i}`,
      source: `step-${i}`,
      target: `step-${i + 1}`,
      animated: true,
    }));
    return { nodes, edges };
  }

  // Single-sentence description: synthesize a conceptual request/response flow around the solution
  const nodes = [
    { id: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query', type: 'client' } },
    {
      id: 'solution',
      type: 'solutionFlowNode',
      position: { x: 0, y: 0 },
      data: {
        label: current.name,
        description: current.description,
        roi: current.roi,
        color: config.primaryColor,
        status: 'Active',
      },
    },
    { id: 'output', position: { x: 0, y: 0 }, data: { label: 'Response', type: 'agent', status: 'Active' } },
  ];
  const edges = [
    { id: 'e-in', source: 'input', target: 'solution', animated: true },
    { id: 'e-out', source: 'solution', target: 'output', animated: true },
  ];
  return { nodes, edges };
}

export function SolutionExplorer({ matrix, config }: { matrix: MatrixItem[], config: EngineConfig }) {
  const [activeSolution, setActiveSolution] = useState<number>(0);

  const current = matrix?.[activeSolution];
  const flow = useMemo(() => current ? buildFlow(current, config) : null, [current, config]);

  if (!matrix || matrix.length === 0) return null;

  return (
    <section className="section-pad border-t border-border bg-surface-elevated relative z-10">
      <div className="container-wide">
        <SectionHeading label="Solutions" title="AI Transformation Solutions" description="Modular intelligent systems mapped to domain workflows." />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16">

          {/* Left: Solution Selector */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {matrix.map((sol, i) => {
              const isActive = activeSolution === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveSolution(i)}
                  className={cn(
                    'text-left p-4 rounded-2xl border transition-all duration-300 group',
                    isActive
                      ? 'bg-surface border-transparent shadow-elevated'
                      : 'bg-transparent border-border hover:border-border-strong hover:bg-surface/50'
                  )}
                  style={isActive ? {
                    borderColor: `${config.primaryColor}66`,
                    boxShadow: `0 0 0 1px ${config.primaryColor}40`,
                  } : undefined}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-9 h-9 shrink-0 rounded-xl flex items-center justify-center border transition-colors',
                        !isActive && 'bg-surface border-border text-text-muted'
                      )}
                      style={isActive ? {
                        backgroundColor: `${config.primaryColor}24`,
                        borderColor: `${config.primaryColor}4D`,
                        color: config.primaryColor,
                      } : undefined}
                    >
                      <Sparkles size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn('font-bold text-sm truncate', isActive ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary')} style={isActive ? { color: config.primaryColor } : undefined}>
                        {sol.name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={cn('w-1.5 h-1.5 rounded-full', roiDotColor[sol.roi])} />
                        <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold flex items-center gap-1">
                          <TrendingUp size={10} /> {sol.roi} ROI
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Solution Flow Canvas */}
          <div className="lg:col-span-8">
            {flow && (
              <ArchitectureCanvas
                key={activeSolution}
                initialNodes={flow.nodes}
                initialEdges={flow.edges}
                direction="LR"
                className="h-[420px] md:h-[460px]"
              />
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
