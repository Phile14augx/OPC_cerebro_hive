# Codex M10.2 Provider Tool-Calling Test Plan

**Task:** X-P2-1  
**Status:** READY FOR IMPLEMENTATION  
**Scope:** `packages/ai-gateway/src/types.ts`, provider adapters, and `AgentRuntimeService`

## Contract under test

- `ToolDefinition`: `{ name, description, inputSchema }`
- `ToolCall`: `{ id, name, arguments }`, with `arguments` JSON-encoded
- `ChatRequest.tools` and `ChatRequest.toolChoice`
- `ChatResponse.toolCalls` plus `finishReason: 'tool_use'`

Use a deterministic `current_time` fixture:

```ts
const currentTimeTool = {
  name: 'current_time',
  description: 'Returns the current UTC time.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
};
```

## Provider matrix

| Case | Anthropic expectation | OpenAI expectation | Assertion |
|---|---|---|---|
| Plain prompt, no tools | no `tools` field | no `tools` field | text response; `toolCalls` absent; `finishReason: stop` |
| Tool available, model answers normally | translated `tools` with `input_schema` | translated function tool with `parameters` | no tool calls; plain answer preserved |
| Forced named tool | `tool_choice: { type: 'tool', name }` | `tool_choice: { type: 'function', function: { name } }` | normalized `ToolCall` has provider ID, name, JSON arguments; `finishReason: tool_use` |
| Tool required | `tool_choice: { type: 'any' }` | `tool_choice: 'required'` | at least one normalized tool call |
| Tool disabled | omit Anthropic tools | OpenAI `tool_choice: 'none'` only when tools are supplied, otherwise omit | no tool call produced |
| Assistant tool-call replay | assistant `tool_use` content blocks | assistant `tool_calls` entries | tool IDs/names/arguments survive translation |
| Tool result replay | `user` `tool_result` block with matching ID | `role: tool`, matching `tool_call_id` | provider receives matching correlation ID |
| Malformed tool arguments | translation fails predictably before request or returns classified gateway error | same | no silent invalid JSON or unsafe execution |
| Provider API error | classified `GatewayError` | classified `GatewayError` | provider/code/retryability retained |

## Required tests

1. Add adapter unit tests with mocked SDK clients for each matrix row; do not call live providers in CI.
2. Add a gateway normalization test proving Anthropic `tool_use` and OpenAI `tool_calls` yield identical `ToolCall` shapes.
3. Add `AgentRuntimeService` tests proving `response.toolCalls` drives the tool-runtime branch and that a no-tool response retains the existing plain-response behavior.
4. Add a loop-safety test: max tool iterations, unknown tool, and tool execution failure return controlled errors rather than looping indefinitely.
5. Keep integration tests with real provider credentials opt-in and excluded from default CI.

## Acceptance commands

Run the package-specific unit tests and typechecks declared in the workspace after implementation, then run the existing `AgentRuntimeService` test suite. Record the exact commands and results in the PR description.

## Current code observations

- Both adapters currently contain translation/extraction helpers for tools.
- The checked `AgentRuntimeService` does not currently contain `toolCalls`, `needsTool`, or `toolName` handling; M10.2 is incomplete until its consumer logic and tests exist.
