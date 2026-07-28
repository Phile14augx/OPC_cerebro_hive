'use client';

import { useFindings } from './hooks/useReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { FindingDetailDTO } from '@cerebro/api-client';
import { AlertTriangle, Info, FileSearch } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FindingsPanel({ reviewId, onSelectFinding, selectedFindingId }: { 
  reviewId: string; 
  onSelectFinding: (findingId: string) => void;
  selectedFindingId?: string;
}) {
  const { data: findings, isLoading } = useFindings(reviewId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!findings || findings.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-gray-900/50 rounded-lg border border-gray-800">
        No findings were generated during this review.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {findings.map((finding) => (
        <FindingCard 
          key={finding.id} 
          finding={finding} 
          isSelected={finding.id === selectedFindingId}
          onClick={() => onSelectFinding(finding.id)}
        />
      ))}
    </div>
  );
}

function FindingCard({ finding, isSelected, onClick }: { finding: FindingDetailDTO; isSelected: boolean; onClick: () => void }) {
  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'text-red-500 border-red-500/20 bg-red-500/10';
      case 'high': return 'text-orange-500 border-orange-500/20 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10';
      default: return 'text-blue-500 border-blue-500/20 bg-blue-500/10';
    }
  };

  const getIcon = (severity: string) => {
    if (severity === 'critical' || severity === 'high') {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Info className="h-4 w-4" />;
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border cursor-pointer transition-all duration-200 group",
        isSelected 
          ? "border-blue-500 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.1)]" 
          : "border-gray-800 bg-black hover:border-gray-600 hover:bg-gray-900/50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 p-1.5 rounded-md", getSeverityColor(finding.severity).split(' ')[2])}>
          <span className={getSeverityColor(finding.severity).split(' ')[0]}>
            {getIcon(finding.severity)}
          </span>
        </div>
        <div className="flex-1 space-y-2">
          <p className={cn("text-sm font-medium", isSelected ? "text-white" : "text-gray-300 group-hover:text-white")}>
            {finding.message}
          </p>
          <div className="flex items-center gap-2">
            <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded uppercase border", getSeverityColor(finding.severity))}>
              {finding.severity}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase border border-gray-700 text-gray-400 bg-gray-800">
              Confidence: {finding.confidence}
            </span>
            {finding.evidenceRefs.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-blue-400 ml-auto">
                <FileSearch className="h-3 w-3" />
                {finding.evidenceRefs.length} Evidence
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
