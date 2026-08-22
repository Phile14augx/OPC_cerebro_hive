'use client';

import { useState } from 'react';
import { useReview, useContributors } from './hooks/useReviews';
import { FindingsPanel } from './FindingsPanel';
import { EvidenceViewer } from './EvidenceViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Bot, ChevronRight, Activity } from 'lucide-react';
import { format } from 'date-fns';

export function ReviewDetailView({ reviewId }: { reviewId: string }) {
  const { data: review, isLoading: reviewLoading } = useReview(reviewId);
  const { data: contributors, isLoading: contributorsLoading } = useContributors(reviewId);
  const [selectedFindingId, setSelectedFindingId] = useState<string | undefined>();

  if (reviewLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-900/50 rounded-xl border border-gray-800">
        Review not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black border border-gray-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Activity className="h-32 w-32" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-space font-semibold text-white mb-2 flex items-center gap-3">
                Review v{review.reviewVersion}
                {review.verdict && (
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
                  <Badge variant={review.verdict.outcome === 'pass' ? 'success' : 'warning' as any}>
                    {review.verdict.outcome.toUpperCase()}
                  </Badge>
                )}
              </h1>
              <p className="text-gray-400 max-w-2xl">
                {review.verdict?.summary || 'Review execution completed.'}
              </p>
            </div>
            
            <div className="text-right text-sm">
              <div className="text-gray-500 font-mono mb-1">State: <span className="text-blue-400">{review.state}</span></div>
              <div className="text-gray-500 font-mono">
                {format(new Date(review.createdAt), 'MMM d, yyyy HH:mm')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contributors (Horizontal List) */}
      {!contributorsLoading && contributors && contributors.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {contributors.map(c => (
            <div key={c.agentId} className="flex-shrink-0 flex items-center gap-3 bg-gray-900/40 border border-gray-800 rounded-lg p-3 px-4">
              <Bot className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-sm font-medium text-gray-200">{c.agentId}</div>
                <div className="text-xs text-gray-500 font-mono">v{c.agentVersion} • {c.executionTimeMs}ms</div>
              </div>
              <Badge variant="outline" className="ml-2 border-gray-700 text-xs">
                {c.findingsProduced} findings
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Split Pane: Findings & Evidence */}
      <div className="grid grid-cols-12 gap-6 h-[600px]">
        
        {/* Left Pane: Findings List */}
        <div className="col-span-5 flex flex-col border border-gray-800 rounded-xl overflow-hidden bg-black">
          <div className="p-4 border-b border-gray-800 bg-gray-900/30 font-space font-medium text-gray-200 flex justify-between items-center">
            Identified Findings
            <Badge variant="secondary" className="bg-gray-800 text-gray-300">
              {review.findingCount}
            </Badge>
          </div>
          <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
            <FindingsPanel 
              reviewId={reviewId} 
              onSelectFinding={setSelectedFindingId}
              selectedFindingId={selectedFindingId}
            />
          </div>
        </div>

        {/* Right Pane: Evidence Detail */}
        <div className="col-span-7 flex flex-col border border-gray-800 rounded-xl overflow-hidden bg-black relative">
          <div className="p-4 border-b border-gray-800 bg-gray-900/30 font-space font-medium text-gray-200">
            Evidence Explorer
          </div>
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {selectedFindingId ? (
              <EvidenceViewer reviewId={reviewId} findingId={selectedFindingId} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <ChevronRight className="h-8 w-8 mb-4 text-gray-700 animate-pulse" />
                <p>Select a finding to explore its underlying evidence</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
