import { CreateClusterCommand } from "../commands/CreateClusterCommand.js";
import { IEventBus } from "../../domain/events/IEventBus.js";

export class CreateClusterHandler {
  constructor(private eventBus: IEventBus) {}

  async handle(command: CreateClusterCommand): Promise<any> {
    // Scaffold implementation
    const clusterId = "cluster-" + Date.now();
    
    // Publish domain event
    await this.eventBus.publish({
      eventId: "evt-" + Date.now(),
      aggregateId: clusterId,
      aggregateType: "Cluster",
      eventName: "ClusterCreated",
      version: 1,
      payload: { ...command },
      createdAt: new Date(),
    });

    return { id: clusterId, ...command, status: "provisioning" };
  }
}
