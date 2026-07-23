import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HealthModule } from './health/health.module';
import { ProjectsModule } from './projects/projects.module';
import { PlannerModule } from './planner/planner.module';
import { RequirementsModule } from './requirements/requirements.module';
import { ArchitectModule } from './architect/architect.module';
import { CodegenModule } from './codegen/codegen.module';
import { TestingModule } from './testing/testing.module';
import { DeployModule } from './deploy/deploy.module';
import { ReviewModule } from './review/review.module';
import { DocsModule } from './docs/docs.module';
import { AgentModule } from './agent/agent.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    HealthModule,
    DatabaseModule,
    ProjectsModule,
    PlannerModule,
    RequirementsModule,
    ArchitectModule,
    CodegenModule,
    TestingModule,
    DeployModule,
    ReviewModule,
    DocsModule,
    AgentModule,
  ],
})
export class AppModule {}
