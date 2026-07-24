/**
 * forge-api — StreamingModule (SSE for real-time execution updates)
 */

import { Module } from "@nestjs/common";
import { StreamingController } from "./streaming.controller.js";
import { StreamingService }    from "./streaming.service.js";
import { EventsController }    from "./events.controller.js";
import { EventsService }       from "./events.service.js";

@Module({
  controllers: [StreamingController, EventsController],
  providers:   [StreamingService, EventsService],
  exports:     [StreamingService, EventsService],
})
export class StreamingModule {}
