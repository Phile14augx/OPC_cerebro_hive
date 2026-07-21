import { CreateClusterCommand } from "../commands/CreateClusterCommand.js";
import { CreateClusterHandler } from "../handlers/CreateClusterHandler.js";
import { IEventBus } from "../../domain/events/IEventBus.js";
import { InMemoryEventBus } from "../../infrastructure/messaging/InMemoryEventBus.js";

export class ClusterService {
  private createClusterHandler: CreateClusterHandler;

  constructor(eventBus: IEventBus = new InMemoryEventBus()) {
    this.createClusterHandler = new CreateClusterHandler(eventBus);
  }

  async createCluster(command: CreateClusterCommand) {
    return this.createClusterHandler.handle(command);
  }
}
