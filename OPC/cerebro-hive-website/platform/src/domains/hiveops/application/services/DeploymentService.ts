import { DeployModelCommand } from "../commands/DeployModelCommand";
import { DeployModelHandler } from "../handlers/DeployModelHandler";
import { IEventBus } from "../../domain/events/IEventBus";
import { InMemoryEventBus } from "../../infrastructure/messaging/InMemoryEventBus";

export class DeploymentService {
  private deployModelHandler: DeployModelHandler;

  constructor(eventBus: IEventBus = new InMemoryEventBus()) {
    this.deployModelHandler = new DeployModelHandler(eventBus);
  }

  async deployModel(command: DeployModelCommand) {
    return this.deployModelHandler.handle(command);
  }
}
