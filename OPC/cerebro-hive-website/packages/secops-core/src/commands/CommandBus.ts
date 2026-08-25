export type SecurityCommandType = 
  | 'IncreaseRisk' 
  | 'SuspendSession' 
  | 'RevokeLease' 
  | 'DisablePrincipal' 
  | 'CollectEvidence' 
  | 'NotifySOC';

export interface SecurityCommand {
  id: string;
  type: SecurityCommandType;
  targetId: string; // The Principal, Lease, or Session ID
  context: Record<string, unknown>;
  issuedAt: Date;
}

export type CommandHandler = (command: SecurityCommand) => Promise<void>;

export class CommandBus {
  private handlers = new Map<SecurityCommandType, CommandHandler[]>();

  registerHandler(type: SecurityCommandType, handler: CommandHandler) {
    const current = this.handlers.get(type) || [];
    current.push(handler);
    this.handlers.set(type, current);
  }

  async dispatch(command: SecurityCommand): Promise<void> {
    console.log(`[CommandBus] 🚀 Dispatching Command: ${command.type} for target ${command.targetId}`);
    const registeredHandlers = this.handlers.get(command.type) || [];
    
    if (registeredHandlers.length === 0) {
      console.warn(`[CommandBus] No handlers registered for command type: ${command.type}`);
    }

    for (const handler of registeredHandlers) {
      await handler(command);
    }
  }
}
