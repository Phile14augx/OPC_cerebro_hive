/**
 * Execute M26.2 / M26.3 Refinements
 */
'use strict';

const fs = require('fs');
const path = require('path');

const rootApi = path.join(
  'd:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website',
  'apps', 'platform-api', 'src', 'features', 'studio', 'copilot', 'review'
);

const rootUi = path.join(
  'd:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website',
  'apps', 'platform', 'src', 'features', 'studio', 'copilot', 'review', 'ui'
);

// ─── 1. NEW API DTOs ──────────────────────────────────────────────────────────

fs.writeFileSync(path.join(rootApi, 'dtos/FindingDetailDTO.ts'), `
export interface FindingDetailDTO {
  readonly id: string;
  readonly title: string;
  readonly severity: string;
  readonly category: string;
  readonly status: string;
  readonly summary: string;
  readonly supportingEvidenceCount: number;
  readonly affectedNodes: string[];
  readonly recommendationIds: string[];
  readonly provenance: any;
  readonly createdAt: string;
}
`);

fs.writeFileSync(path.join(rootApi, 'dtos/ReviewMetadataDTO.ts'), `
export interface ReviewMetadataDTO {
  readonly reviewId: string;
  readonly workflowId: string;
  readonly manifestHash: string;
  readonly reviewVersion: string;
  readonly policyVersion: string;
  readonly engineVersion: string;
  readonly generatedAt: string;
  readonly generatedBy: string;
  readonly freshnessState: string;
}
`);

// ─── 2. NEW UI PROVIDER ───────────────────────────────────────────────────────
fs.mkdirSync(path.join(rootUi, 'providers'), { recursive: true });

fs.writeFileSync(path.join(rootUi, 'providers/ReviewProvider.tsx'), `
import React, { createContext, useContext, useState } from 'react';

interface ReviewState {
  selectedReviewId: string | null;
  comparisonReviewId: string | null;
  expandedFindingId: string | null;
  filters: Record<string, string>;
  setExpandedFinding: (id: string | null) => void;
}

const ReviewContext = createContext<ReviewState | null>(null);

export const ReviewProvider: React.FC<{ children: React.ReactNode, reviewId: string }> = ({ children, reviewId }) => {
  const [expandedFindingId, setExpandedFinding] = useState<string | null>(null);

  return (
    <ReviewContext.Provider value={{ selectedReviewId: reviewId, comparisonReviewId: null, expandedFindingId, filters: {}, setExpandedFinding }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviewContext = () => {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error('useReviewContext must be used within ReviewProvider');
  return ctx;
};
`);

// ─── 3. PROGRESSIVE EVIDENCE EXPLORER ─────────────────────────────────────────

fs.writeFileSync(path.join(rootUi, 'evidence/ProgressiveEvidenceExplorer.tsx'), `
import React, { useState } from 'react';

type LoadLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const ProgressiveEvidenceExplorer: React.FC<{ findingId: string }> = ({ findingId }) => {
  const [level, setLevel] = useState<LoadLevel>(0);
  
  return (
    <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
      <div className="flex space-x-2 text-sm text-slate-400 mb-4 border-b border-slate-800 pb-2">
        <button className={\`\${level >= 0 ? 'text-white' : ''}\`} onClick={() => setLevel(0)}>Level 0: Finding</button>
        <span>→</span>
        <button className={\`\${level >= 1 ? 'text-white' : ''}\`} onClick={() => setLevel(1)}>Level 1: Summary</button>
        <span>→</span>
        <button className={\`\${level >= 2 ? 'text-white' : ''}\`} onClick={() => setLevel(2)}>Level 2: Nodes</button>
        <span>→</span>
        <button className={\`\${level >= 3 ? 'text-white' : ''}\`} onClick={() => setLevel(3)}>Level 3: Graph</button>
        <span>→</span>
        <button className={\`\${level >= 4 ? 'text-white' : ''}\`} onClick={() => setLevel(4)}>Level 4: Trace</button>
        <span>→</span>
        <button className={\`\${level >= 5 ? 'text-white' : ''}\`} onClick={() => setLevel(5)}>Level 5: Contributor</button>
      </div>

      <div className="font-mono text-sm text-slate-300">
        {level === 0 && <div>Finding Detail loaded.</div>}
        {level === 1 && <div>Evidence Summary: Unencrypted traffic detected.</div>}
        {level === 2 && <div>Evidence Nodes: [Node A, Node B] fetched.</div>}
        {level === 3 && <div>Evidence Graph: 34 Edges fetched and rendered.</div>}
        {level === 4 && <div>Raw Trace: 2.4MB payload loaded.</div>}
        {level === 5 && <div>Contributor Output: Raw container logs.</div>}
      </div>
    </div>
  );
};
`);

console.log('M26.2 / M26.3 Refinements applied successfully.');
