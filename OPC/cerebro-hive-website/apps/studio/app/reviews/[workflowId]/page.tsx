'use client';

import { useState } from 'react';
import { ReviewDashboard } from '@/features/reviews/ReviewDashboard';
import { ReviewDetailView } from '@/features/reviews/ReviewDetailView';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ReviewsPage() {
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const params = useParams();
  const workflowId = params.workflowId as string;

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-6">
        {selectedReviewId ? (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedReviewId(null)}
                className="text-gray-400 hover:text-white mb-4 -ml-4"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <ReviewDetailView reviewId={selectedReviewId} />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300 max-w-4xl">
            <ReviewDashboard workflowId={workflowId} onSelectReview={setSelectedReviewId} />
          </div>
        )}
      </div>
    </div>
  );
}
