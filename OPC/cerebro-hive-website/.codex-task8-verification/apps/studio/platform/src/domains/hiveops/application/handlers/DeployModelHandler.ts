import { DeployModelCommand } from "../commands/DeployModelCommand";
import { IEventBus } from "../../domain/events/IEventBus";

export class DeployModelHandler {
  constructor(private eventBus: IEventBus) {}

  async handle(command: DeployModelCommand): Promise<any> {
    const deploymentId = "dep-" + Date.now();
    
    // Publish domain event
    await this.eventBus.publish({
      eventId: "evt-" + Date.now(),
      aggregateId: deploymentId,
      aggregateType: "Deployment",
      eventName: "DeploymentStarted",
      version: 1,
      payload: { ...command },
      createdAt: new Date(),
    });

    return { id: deploymentId, ...command, status: "deploying" };
  }
}
