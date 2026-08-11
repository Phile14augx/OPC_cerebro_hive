import React from 'react';
import { StudioShell } from '../../../studio/components/StudioShell';
import { WorkspaceCard } from '../../../studio/components/WorkspaceCard';
import { MetricCard } from '../../../studio/components/MetricCard';

export default function DocumentKnowledgePage({ params }: { params: { id: string } }) {
  return (
    <StudioShell activeWorkspace="Knowledge Asset">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <MetricCard label="Document ID" value={params.id} colorClass="text-blue-400" />
        <MetricCard label="Knowledge Confidence" value="98.5%" trend="+1.2%" colorClass="text-green-400" />
        <MetricCard label="Ontology Connections" value="14" colorClass="text-purple-400" />
        <MetricCard label="Last Processed" value="Just now" colorClass="text-neutral-300" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <WorkspaceCard title="Knowledge Content Viewer" className="xl:col-span-2 min-h-[600px]">
          <div className="prose prose-invert max-w-none p-4">
            <h3>Enterprise Strategy 2026</h3>
            <p>This is a governed knowledge asset injected directly from the temporal event bus. It features semantic embeddings and full ontology relationships.</p>
            <div className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg mt-8 text-neutral-400 font-mono text-sm">
              [Raw Markdown / Extracted Content renders here...]
            </div>
          </div>
        </WorkspaceCard>

        <div className="space-y-6">
          <WorkspaceCard title="Lineage & Graph" className="min-h-[300px]">
            <div className="flex items-center justify-center h-full text-neutral-500 border-2 border-dashed border-neutral-800 rounded-xl m-2">
              [Neo4j Node Visualizer]
            </div>
          </WorkspaceCard>
          
          <WorkspaceCard title="Governance Audit">
            <ul className="space-y-3 p-2">
              <li className="text-sm text-green-400 flex justify-between border-b border-neutral-800 pb-2"><span>HIPAA Compliant</span> <span>Pass</span></li>
              <li className="text-sm text-green-400 flex justify-between border-b border-neutral-800 pb-2"><span>No PII Detected</span> <span>Pass</span></li>
              <li className="text-sm text-blue-400 flex justify-between"><span>Approved By</span> <span>System</span></li>
            </ul>
          </WorkspaceCard>
        </div>
      </div>
    </StudioShell>
  );
}
