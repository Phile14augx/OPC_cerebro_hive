/**
 * generate-openapi.ts
 *
 * Generates the CerebroForge API OpenAPI 3.0 spec without a live database.
 * All database-dependent services are replaced with stubs so this script
 * can run in CI with zero infrastructure dependencies.
 *
 * Usage:
 *   pnpm --filter @cerebro/forge-api generate-openapi
 *   # writes openapi.json to the current directory
 *
 * Or pipe to stdout:
 *   ts-node scripts/generate-openapi.ts --stdout
 */

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Module, Injectable, OnModuleInit } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { join } from 'path';
import * as fs from 'fs';

// ── Stub DatabaseModule ────────────────────────────────────────────────────────
// Provides a fake PrismaClient so no DB connection is attempted.
// Every method returns sensible empty results.

const fakePrisma = new Proxy(
  {},
  {
    get(_target, prop) {
      // Model accessor (e.g. prisma.project) → returns query stub object
      if (typeof prop === 'string' && !prop.startsWith('$')) {
        return new Proxy(
          {},
          {
            get(_t, method) {
              // Returns a no-op async function for any query method
              return async () => null;
            },
          },
        );
      }
      // $connect, $disconnect, $transaction etc.
      if (prop === '$connect' || prop === '$disconnect') return async () => {};
      if (prop === '$transaction') return async (fn: any) => fn(fakePrisma);
      return undefined;
    },
  },
);

import { Global } from '@nestjs/common';
import { PrismaClient } from '@cerebro/db';

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useValue: fakePrisma,
    },
  ],
  exports: [PrismaClient],
})
class StubDatabaseModule {}

// ── Import all real modules except DatabaseModule ──────────────────────────────
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HealthModule } from '../src/health/health.module';
import { ProjectsModule } from '../src/projects/projects.module';
import { PlannerModule } from '../src/planner/planner.module';
import { RequirementsModule } from '../src/requirements/requirements.module';
import { ArchitectModule } from '../src/architect/architect.module';
import { CodegenModule } from '../src/codegen/codegen.module';
import { TestingModule } from '../src/testing/testing.module';
import { DeployModule } from '../src/deploy/deploy.module';
import { ReviewModule } from '../src/review/review.module';
import { DocsModule } from '../src/docs/docs.module';
import { AgentModule } from '../src/agent/agent.module';
import { WorkflowModule } from '../src/workflow/workflow.module';
import { StreamingModule } from '../src/streaming/streaming.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    StubDatabaseModule,
    HealthModule,
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
    WorkflowModule,
    StreamingModule,
  ],
})
class OpenApiAppModule {}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const toStdout = process.argv.includes('--stdout');

  const app = await NestFactory.create(OpenApiAppModule, {
    logger: false,           // suppress NestJS boot logs
    abortOnError: false,     // continue even if a module fails
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('CerebroForge™ API')
    .setDescription('AI Software Factory — agent orchestration and code generation API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Strip server-specific fields that change per environment
  delete (document as any).servers;

  const json = JSON.stringify(document, null, 2);

  if (toStdout) {
    process.stdout.write(json + '\n');
  } else {
    const outPath = join(__dirname, '..', 'openapi.json');
    writeFileSync(outPath, json + '\n', 'utf-8');
    console.log(`✅ OpenAPI spec written to ${outPath}`);

    // Print summary
    const paths = Object.keys(document.paths ?? {}).length;
    const schemas = Object.keys(document.components?.schemas ?? {}).length;
    console.log(`   Paths: ${paths} | Schemas: ${schemas}`);
  }

  await app.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Failed to generate OpenAPI spec:', err.message);
  process.exit(1);
});
