import { CreateClusterCommand } from "../commands/CreateClusterCommand";
import { IEventBus } from "../../domain/events/IEventBus";

export interface CreatedCluster extends CreateClusterCommand {
  id: string;
  status: "provisioning";
}

export class CreateClusterHandler {
  constructor(private eventBus: IEventBus) {}

  async handle(command: CreateClusterCommand): Promise<CreatedCluster> {
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
