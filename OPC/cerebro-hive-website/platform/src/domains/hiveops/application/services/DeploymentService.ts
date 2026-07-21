import { DeployModelCommand } from "../commands/DeployModelCommand.js";
import { DeployModelHandler } from "../handlers/DeployModelHandler.js";
import { IEventBus } from "../../domain/events/IEventBus.js";
import { InMemoryEventBus } from "../../infrastructure/messaging/InMemoryEventBus.js";

export class DeploymentService {
  private deployModelHandler: DeployModelHandler;

  constructor(eventBus: IEventBus = new InMemoryEventBus()) {
    this.deployModelHandler = new DeployModelHandler(eventBus);
  }

  async deployModel(command: DeployModelCommand) {
    return this.deployModelHandler.handle(command);
  }
}
