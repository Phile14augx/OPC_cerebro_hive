/**
 * HiveSwarm — Streaming Output Types
 *
 * Defines the Server-Sent Events (SSE) wire format emitted by swarm-api's
 * WebSocket / SSE endpoint as agents produce tokens and lifecycle events.
 */

export type StreamEventType =
  | "token"           // LLM token chunk
  | "tool_call"       // agent invoking a tool
  | "tool_result"     // tool response returned to agent
  | "step_start"      // plan step beginning
  | "step_end"        // plan step completed
  | "observation"     // observe() phase output
  | "reflection"      // reflect() phase output
  | "done"            // task fully complete
  | "error";          // terminal error

export interface StreamToken {
  type:    "token";
  content: string;
  index:   number;    // monotonically increasing token index
}

export interface StreamToolCall {
  type:       "tool_call";
  toolName:   string;
  toolInput:  unknown;
  callId:     string;
}

export interface StreamToolResult {
  type:     "tool_result";
  callId:   string;
  output:   unknown;
  isError:  boolean;
}

export interface StreamStepStart {
  type:        "step_start";
  stepIndex:   number;
  description: string;
}

export interface StreamStepEnd {
  type:        "step_end";
  stepIndex:   number;
  durationMs:  number;
}

export interface StreamObservation {
  type:         "observation";
  qualityScore: number;
  criteriaMet:  boolean;
  issues:       string[];
}

export interface StreamReflection {
  type:        "reflection";
  learnings:   string[];
  antiPatterns: string[];
}

export interface StreamDone {
  type:         "done";
  taskId:       string;
  runId:        string;
  confidence:   number;
  durationMs:   number;
  totalTokens:  number;
}

export interface StreamError {
  type:    "error";
  code:    string;
  message: string;
}

export type StreamEvent =
  | StreamToken
  | StreamToolCall
  | StreamToolResult
  | StreamStepStart
  | StreamStepEnd
  | StreamObservation
  | StreamReflection
  | StreamDone
  | StreamError;

/**
 * StreamingOutput is the full accumulated result of a streamed task execution,
 * built by consuming all StreamEvents until a "done" or "error" event.
 */
export interface StreamingOutput {
  taskId:       string;
  runId:        string;
  content:      string;     // concatenated token stream
  toolCalls:    StreamToolCall[];
  observations: StreamObservation[];
  reflections:  StreamReflection[];
  confidence:   number;
  durationMs:   number;
  totalTokens:  number;
  error?:       StreamError;
}

/**
 * Accumulate a stream of StreamEvents into a StreamingOutput.
 * Useful for testing agents that produce a stream but you want the full result.
 */
export function accumulateStream(events: StreamEvent[]): StreamingOutput {
  let content = "";
  let confidence = 0;
  let durationMs = 0;
  let totalTokens = 0;
  let taskId = "";
  let runId = "";
  const toolCalls: StreamToolCall[] = [];
  const observations: StreamObservation[] = [];
  const reflections: StreamReflection[] = [];
  let error: StreamError | undefined;

  for (const ev of events) {
    switch (ev.type) {
      case "token":
        content += ev.content;
        totalTokens++;
        break;
      case "tool_call":
        toolCalls.push(ev);
        break;
      case "observation":
        observations.push(ev);
        break;
      case "reflection":
        reflections.push(ev);
        break;
      case "done":
        taskId      = ev.taskId;
        runId       = ev.runId;
        confidence  = ev.confidence;
        durationMs  = ev.durationMs;
        totalTokens = ev.totalTokens;
        break;
      case "error":
        error = ev;
        break;
    }
  }

  return { taskId, runId, content, toolCalls, observations, reflections, confidence, durationMs, totalTokens, error };
}
