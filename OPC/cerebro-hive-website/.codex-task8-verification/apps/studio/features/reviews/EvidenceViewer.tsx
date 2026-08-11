'use client';

import { useEvidence } from './hooks/useReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Database, Clock, Server } from 'lucide-react';
import { format } from 'date-fns';

export function EvidenceViewer({ reviewId, findingId }: { reviewId: string; findingId: string }) {
  const { data: evidenceList, isLoading } = useEvidence(reviewId, findingId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  if (!evidenceList || evidenceList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-black border border-gray-800 rounded-xl">
        <Database className="h-8 w-8 mb-3 opacity-20" />
        <p>No evidence found for this finding.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {evidenceList.map((evidence, idx) => (
        <Card key={evidence.id || idx} className="bg-black border-gray-800 overflow-hidden">
          <CardHeader className="bg-gray-900/50 border-b border-gray-800 pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base font-space text-gray-200">
                  {evidence.description || 'Evidence Artifact'}
                </CardTitle>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Server className="h-3 w-3" />
                    Source: {evidence.provenance.sourceSystem}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {format(new Date(evidence.provenance.retrievedAt), 'yyyy-MM-dd HH:mm:ss')}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] text-gray-500 border-gray-700">
                {evidence.id}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {evidence.payload ? (
              <div className="bg-[#0d1117] p-4 overflow-auto max-h-[400px]">
                <pre className="text-xs font-jetbrains text-gray-300">
                  <code>{JSON.stringify(evidence.payload, null, 2)}</code>
                </pre>
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-500 italic">
                Payload data is not available.
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
