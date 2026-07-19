// Mocking BullMQ interfaces for the prototype
export interface Job<T = any> {
  id: string;
  data: T;
  updateProgress: (progress: number | object) => Promise<void>;
  moveToFailed: (error: Error, token: string) => Promise<void>;
}

export type QueueName = "execution" | "evaluation" | "ai_review" | "artifact_processing";

export class ExecutionQueueService {
  /**
   * BullMQ handles retries, delayed jobs, backoff, and concurrency out of the box.
   * This service is invoked by the Next.js API to enqueue jobs asynchronously.
   */
  async enqueueSubmission(submissionId: string, payload: any) {
    console.log(`[Queue: execution] Enqueuing Submission ${submissionId}`);
    // await executionQueue.add('process-submission', { submissionId, payload }, {
    //   attempts: 3,
    //   backoff: { type: 'exponential', delay: 1000 },
    //   priority: 1
    // });
  }

  async enqueueEvaluation(executionArtifactsId: string) {
    console.log(`[Queue: evaluation] Enqueuing Artifact ${executionArtifactsId} for grading`);
    // await evaluationQueue.add('grade-artifacts', { executionArtifactsId });
  }
}
