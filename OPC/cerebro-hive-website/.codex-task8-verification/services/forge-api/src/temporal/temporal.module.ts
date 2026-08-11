/**
 * forge-api — TemporalModule (global singleton)
 */

import { Module, Global } from "@nestjs/common";
import { TemporalService } from "./temporal.service.js";

@Global()
@Module({
  providers: [TemporalService],
  exports:   [TemporalService],
})
export class TemporalModule {}
