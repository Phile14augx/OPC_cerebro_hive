
export * from './navigation/RouterAdapter';
export * from './navigation/WorkspaceStore';
export * from './commands/CommandRegistry';
export * from './commands/ContextBuilder';
export * from './overlays/OverlayService';
export * from './registry/CapabilityRegistry';
export * from './lifecycle/LifecycleHooks';
export * from './shell/WorkspaceShell';
export * from './widgets/WidgetRegistry';
export * from './widgets/WidgetHost';
import './widgets/registry-init'; // Auto-register core widgets

export * from './copilot/ConversationStore';
export * from './copilot/CopilotPanel';
export * from './copilot/AIProvider';
export * from './preferences/PreferenceService';
