import type { EventBus } from "./events.js";
import { InMemoryEventBus } from "./memory-bus.js";
import { RedisEventBus } from "./redis-bus.js";
import { NatsEventBus } from "./nats-bus.js";
import type { PlatformConfig } from "../config/config.js";
import type { Logger } from "../logging/logger.js";

export async function createEventBus(config: PlatformConfig, logger: Logger): Promise<EventBus> {
  switch (config.EVENT_BUS) {
    case "nats":
      try { return await NatsEventBus.connect(config.NATS_URL, logger); }
      catch (err) {
        logger.warn({ err: String(err) }, "nats unavailable; falling back to redis streams");
        try { return new RedisEventBus(config.REDIS_URL, logger); }
        catch { return new InMemoryEventBus(); }
      }
    case "redis":
      return new RedisEventBus(config.REDIS_URL, logger);
    default:
      return new InMemoryEventBus();
  }
}
