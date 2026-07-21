import { CreateClusterCommand } from "../commands/CreateClusterCommand";
import { CreateClusterHandler } from "../handlers/CreateClusterHandler";
import { IEventBus } from "../../domain/events/IEventBus";
import { InMemoryEventBus } from "../../infrastructure/messaging/InMemoryEventBus";

export class ClusterService {
  private createClusterHandler: CreateClusterHandler;

  constructor(eventBus: IEventBus = new InMemoryEventBus()) {
    this.createClusterHandler = new CreateClusterHandler(eventBus);
  }

  async createCluster(command: CreateClusterCommand) {
    return this.createClusterHandler.handle(command);
  }
}
