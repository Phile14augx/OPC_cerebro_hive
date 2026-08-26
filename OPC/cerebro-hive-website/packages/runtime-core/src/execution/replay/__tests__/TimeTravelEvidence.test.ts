import { describe, it, expect, vi } from 'vitest';
import { ExecutionReplayService } from '../../ExecutionReplayService';
import { ExecutionStore } from '../../ExecutionStore';
import { ExecutionEventRegistry } from '../../../registry/ExecutionEventRegistry';
import { ReducerRegistry } from '../../../registry/ReducerRegistry';

describe('Time Travel Evidence', () => {
  it('should prove diff(seqA, seqB) aligns perfectly with replay(seqA) and replay(seqB)', async () => {
    // 1. Setup mock store and registries
    const mockEvents = [
      { sequence: 1n, type: 'LLMCompleted', payload: { content: 'Msg1', toolCalls: [{ id: 'tool-1', name: 'search' }] } },
      { sequence: 2n, type: 'ToolCompleted', payload: { toolCallId: 'tool-1', result: 'Data1' } },
      { sequence: 3n, type: 'LLMCompleted', payload: { content: 'Msg2', toolCalls: [{ id: 'tool-2', name: 'search' }] } },
      { sequence: 4n, type: 'ToolCompleted', payload: { toolCallId: 'tool-2', result: 'Data2' } }
    ] as unknown[];

    const store: unknown = {
      getLatestSnapshot: async () => null,
      getEvents: async () => mockEvents
    };

    const eventRegistry = new ExecutionEventRegistry();
    eventRegistry.upcastEvent = (evt) => evt; // Pass-through

    const reducerRegistry = new ReducerRegistry();
    reducerRegistry.getReducer = (type) => {
      if (type === 'LLMCompleted') {
        return (state, event) => ({
          ...state,
          messages: [...state.messages, { role: 'assistant', content: event.payload.content }],
          activeToolCalls: [...state.activeToolCalls, ...event.payload.toolCalls.map((t: unknown) => t.id)]
        });
      }
      if (type === 'ToolCompleted') {
        return (state, event) => ({
          ...state,
          messages: [...state.messages, { role: 'tool', content: event.payload.result }],
          activeToolCalls: state.activeToolCalls.filter((id: string) => id !== event.payload.toolCallId)
        });
      }
      return (state) => state;
    };

    const replayService = new ExecutionReplayService(store, reducerRegistry, eventRegistry);

    // 2. Perform Time Travel Replays
    const stateSeq1 = await replayService.replay('exec-1', { sequence: 1n });
    // After seq 1: 1 message, 1 active tool ('tool-1')
    expect(stateSeq1.messages.length).toBe(1);
    expect(stateSeq1.activeToolCalls).toEqual(['tool-1']);

    const stateSeq3 = await replayService.replay('exec-1', { sequence: 3n });
    // After seq 3: Msg1, ToolData1, Msg2, active tool is 'tool-2'
    expect(stateSeq3.messages.length).toBe(3);
    expect(stateSeq3.activeToolCalls).toEqual(['tool-2']);

    // 3. Perform Diff (from Seq 1 to Seq 3)
    const diff = await replayService.diff('exec-1', 1n, 3n);
    
    // 4. Verify Diff logic
    // We added 2 messages between seq 1 and seq 3 (ToolCompleted Data1, LLMCompleted Msg2)
    expect(diff.addedMessages.length).toBe(2);
    expect(diff.addedMessages[0].role).toBe('tool');
    expect(diff.addedMessages[1].content).toBe('Msg2');

    // We removed active tool 'tool-1' and added active tool 'tool-2'
    expect(diff.removedActiveTools).toEqual(['tool-1']);
    expect(diff.newActiveTools).toEqual(['tool-2']);
  });
});
