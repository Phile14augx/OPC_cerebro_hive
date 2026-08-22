'use client';

import { useReviewsByWorkflow } from './hooks/useReviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- ARCH-LINT: Deferred
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EngineeringReviewSummaryDTO } from '@cerebro/api-client';
import { AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ReviewDashboard({
  workflowId,
  onSelectReview,
}: {
  workflowId: string;
  onSelectReview: (id: string) => void;
}) {
  const { data: reviews, isLoading, isError } = useReviewsByWorkflow(workflowId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !reviews) {
    return (
      <div className="p-6 text-center text-red-500 bg-red-500/10 rounded-xl">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        Failed to load engineering reviews. Check API connection.
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-gray-800 rounded-xl text-gray-500">
        No engineering reviews found for this workflow.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold font-space tracking-tight text-white">Engineering Reviews</h2>
        <Badge variant="outline" className="border-gray-800 text-gray-400">
          Workflow: {workflowId}
        </Badge>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onClick={() => onSelectReview(review.id)} />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review, onClick }: { review: EngineeringReviewSummaryDTO; onClick: () => void }) {
  const getVerdictIcon = (outcome?: string) => {
    switch (outcome) {
      case 'pass': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'needs-attention': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getVerdictBadgeVariant = (outcome?: string) => {
    switch (outcome) {
      case 'pass': return 'success';
      case 'fail': return 'destructive';
      case 'needs-attention': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <Card 
      className="bg-black border border-gray-800 hover:border-blue-500/50 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-space font-medium flex items-center gap-3 text-gray-200 group-hover:text-white transition-colors">
          {getVerdictIcon(review.verdict?.outcome)}
          Review v{review.reviewVersion}
        </CardTitle>
        {review.verdict && (
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- ARCH-LINT: Deferred
          <Badge variant={getVerdictBadgeVariant(review.verdict.outcome) as any}>
            {review.verdict.outcome.toUpperCase()}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {review.verdict?.summary || 'Review in progress...'}
        </p>
        <div className="flex items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {review.findingCount} findings
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            {review.evidenceCount} evidence artifacts
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Clock className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
