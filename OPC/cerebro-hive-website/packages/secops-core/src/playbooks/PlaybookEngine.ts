import { IncidentCase } from '../cases/CaseManager';
import { CommandBus, SecurityCommand, SecurityCommandType } from '../commands/CommandBus';

export interface PlaybookAction {
  commandType: string;
  targetExtractor: (c: IncidentCase) => string;
  contextExtractor: (c: IncidentCase) => Record<string, unknown>;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  autoExecute: boolean;
  
  // Declarative Trigger Conditions
  conditions: {
    severityMatches: string[];
    threatTypes: string[];
  };
  
  actions: PlaybookAction[];
}

export class PlaybookEngine {
  private playbooks: Playbook[] = [];

  constructor(private commandBus: CommandBus) {}

  registerPlaybook(playbook: Playbook) {
    this.playbooks.push(playbook);
  }

  /**
   * Evaluates a new case and automatically executes matching playbooks.
   */
  async evaluateCase(incidentCase: IncidentCase): Promise<void> {
    console.log(`[PlaybookEngine] 📘 Evaluating Playbooks for Case ${incidentCase.id}`);

    for (const playbook of this.playbooks) {
      if (this.matches(playbook, incidentCase)) {
        console.log(`[PlaybookEngine] ⚡ Matched Playbook: ${playbook.name}`);
        
        if (playbook.autoExecute) {
          await this.executePlaybook(playbook, incidentCase);
        } else {
          console.log(`[PlaybookEngine] ⏸️ Playbook ${playbook.name} requires manual approval (autoExecute = false).`);
        }
      }
    }
  }

  private matches(playbook: Playbook, incidentCase: IncidentCase): boolean {
    const severityMatch = playbook.conditions.severityMatches.includes(incidentCase.severity);
    const threatMatch = incidentCase.alerts.some(a => playbook.conditions.threatTypes.includes(a.threatType));
    
    return severityMatch && threatMatch;
  }

  private async executePlaybook(playbook: Playbook, incidentCase: IncidentCase): Promise<void> {
    console.log(`[PlaybookEngine] ⚙️ Executing Playbook: ${playbook.name}...`);
    
    for (const action of playbook.actions) {
      const command: SecurityCommand = {
        id: `cmd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: action.commandType as SecurityCommandType,
        targetId: action.targetExtractor(incidentCase),
        context: action.contextExtractor(incidentCase),
        issuedAt: new Date()
      };
      
      await this.commandBus.dispatch(command);
    }
  }
}
