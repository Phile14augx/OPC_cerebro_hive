
export interface CommandDefinition {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  shortcut?: string[];
  permissions?: string[];
  handler: () => void;
}

class CommandRegistryImpl {
  private commands = new Map<string, CommandDefinition>();
  private listeners = new Set<() => void>();

  register(command: CommandDefinition) {
    this.commands.set(command.id, command);
    this.notify();
  }

  unregister(id: string) {
    this.commands.delete(id);
    this.notify();
  }

  getCommands() {
    return Array.from(this.commands.values());
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const CommandRegistry = new CommandRegistryImpl();
