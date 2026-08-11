
export type WidgetState = 'loading' | 'ready' | 'refreshing' | 'empty' | 'error';

export interface WidgetProps {
  instanceId: string;
  state: WidgetState;
  onStateChange: (state: WidgetState) => void;
  config: Record<string, any>;
}
