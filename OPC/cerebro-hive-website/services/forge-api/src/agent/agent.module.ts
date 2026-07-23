import { Global, Module } from '@nestjs/common';
import { AiServiceProvider } from './ai.provider';
import { AgentOrchestratorService } from './agent-orchestrator.service';

@Global()
@Module({
  providers: [AiServiceProvider, AgentOrchestratorService],
  exports: [AiServiceProvider, AgentOrchestratorService],
})
export class AgentModule {}
