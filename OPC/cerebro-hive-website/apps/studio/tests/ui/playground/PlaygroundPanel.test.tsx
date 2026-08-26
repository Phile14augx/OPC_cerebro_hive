// @vitest-environment jsdom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

type PlaygroundSnapshot = {
  setSystemPrompt: (prompt: string) => void;
  setModelConfig: (config: { selectedModel?: string }) => void;
  setMemoryToggle: (key: string, enabled: boolean) => void;
};

const storeHarness = vi.hoisted(() => {
  let version = 0;
  let notified = false;
  const listeners = new Set<() => void>();
  const calls = {
    setSystemPrompt: 0,
    setModelConfig: 0,
    setMemoryToggle: 0,
  };

  const notifyOnce = () => {
    if (notified) return;
    notified = true;
    version += 1;
    listeners.forEach((listener) => listener());
  };

  const snapshot = {
    setSystemPrompt: () => {
      calls.setSystemPrompt += 1;
      notifyOnce();
    },
    setModelConfig: () => {
      calls.setModelConfig += 1;
      notifyOnce();
    },
    setMemoryToggle: () => {
      calls.setMemoryToggle += 1;
      notifyOnce();
    },
  };

  return {
    calls,
    getVersion: () => version,
    reset: () => {
      version = 0;
      notified = false;
      calls.setSystemPrompt = 0;
      calls.setModelConfig = 0;
      calls.setMemoryToggle = 0;
    },
    snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
});

vi.mock('@/src/store/useLayoutStore', () => ({
  useLayoutStore: () => ({ isInspectorOpen: false }),
}));

vi.mock('../../../src/store/usePlaygroundStore', async () => {
  const React = await import('react');

  function usePlaygroundStore<T>(selector?: (state: PlaygroundSnapshot) => T) {
    React.useSyncExternalStore(storeHarness.subscribe, storeHarness.getVersion, () => 0);
    return selector ? selector(storeHarness.snapshot) : { ...storeHarness.snapshot };
  }

  return { usePlaygroundStore };
});

vi.mock('../../../components/playground/ChatWindow', () => ({ ChatWindow: () => null }));
vi.mock('../../../components/playground/ConfigurationPanel', () => ({ ConfigurationPanel: () => null }));

import { PlaygroundPanel } from '../../../components/playground/PlaygroundPanel';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  storeHarness.reset();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => {
    root.unmount();
  });
  container.remove();
});

describe('PlaygroundPanel execution context synchronization', () => {
  it('synchronizes once when a same-value store publication rerenders the panel', async () => {
    await act(async () => {
      root.render(<PlaygroundPanel executionContext={{ selectedModel: 'gpt-4.1' }} />);
    });

    expect(storeHarness.calls.setModelConfig).toBe(1);
    expect(storeHarness.getVersion()).toBe(1);
  });
});
