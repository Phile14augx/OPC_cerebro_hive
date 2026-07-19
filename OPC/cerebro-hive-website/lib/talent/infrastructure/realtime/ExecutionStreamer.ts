/**
 * Interface representing the Real-Time Streaming capabilities for Talent OS execution.
 * We use native WebSockets (ws) over Socket.io to keep things lightweight and bidirectional.
 */
export interface StreamPayload {
  envId: string;
  type: "status" | "stdout" | "stderr" | "result";
  data: string | object;
  timestamp: string;
}

export class ExecutionStreamer {
  /**
   * Called by the Execution Worker to push logs out to candidates/recruiters.
   * In a real distributed system, this publishes to a Redis PubSub channel.
   * A separate WebSocket server listens to Redis and pushes to the client.
   */
  publishStreamChunk(envId: string, type: "stdout" | "stderr", chunk: string) {
    const payload: StreamPayload = {
      envId,
      type,
      data: chunk,
      timestamp: new Date().toISOString()
    };
    
    // e.g. redis.publish(`stream:${envId}`, JSON.stringify(payload));
    console.log(`[Streamer] Broadcast -> [${envId}] ${type}: ${chunk.substring(0, 50)}`);
  }

  publishStatusChange(envId: string, status: string) {
    const payload: StreamPayload = {
      envId,
      type: "status",
      data: { status },
      timestamp: new Date().toISOString()
    };
    
    // e.g. redis.publish(`stream:${envId}`, JSON.stringify(payload));
    console.log(`[Streamer] Broadcast -> [${envId}] Status: ${status}`);
  }
}
