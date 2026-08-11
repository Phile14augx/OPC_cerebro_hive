
export const LifecycleEvents = {
  STARTUP: 'startup',
  WORKSPACE_SWITCH: 'workspace_switch',
  SHUTDOWN: 'shutdown'
} as const;

export const triggerLifecycleEvent = (event: keyof typeof LifecycleEvents, payload?: any) => {
  // Dispatches a custom DOM event or triggers internal listeners
  const customEvent = new CustomEvent(`cerebro:${LifecycleEvents[event]}`, { detail: payload });
  window.dispatchEvent(customEvent);
};
