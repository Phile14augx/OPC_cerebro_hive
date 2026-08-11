import { NextRequest, NextResponse } from 'next/server';
import { ExecutionService } from '../../../../../../../lib/talent/infrastructure/execution/ExecutionService';

// Ensure this route is evaluated dynamically for streaming
export const dynamic = 'force-dynamic';

// Shared instance (in production, use a proper singleton across the worker pool)
const executionService = new ExecutionService();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const streamingProvider = executionService.getStreamingProvider();

  // Create a TransformStream to push Server-Sent Events to the client
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // Helper to send SSE format
  const sendEvent = async (event: any) => {
    const data = `data: ${JSON.stringify(event)}\n\n`;
    await writer.write(new TextEncoder().encode(data));
  };

  // Subscribe to the stream via our Pub/Sub abstraction
  const unsubscribe = streamingProvider.subscribe(jobId, async (event) => {
    await sendEvent(event);
    
    // Auto-close stream on terminal states
    if (event.type === 'result' || (event.type === 'status' && ['COMPLETED', 'FAILED', 'TIMED_OUT', 'CANCELLED'].includes(event.status))) {
      unsubscribe();
      writer.close();
    }
  });

  // Handle client disconnects
  req.signal.addEventListener('abort', () => {
    unsubscribe();
    writer.close().catch(() => {});
  });

  return new NextResponse(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
