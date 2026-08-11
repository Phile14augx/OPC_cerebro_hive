// Must run before any other import: @cerebro/db (pulled in transitively via
// AppModule -> DatabaseModule) constructs its Prisma driver adapter from
// process.env.DATABASE_URL at module-evaluation time, not lazily. Unlike
// archive-api/platform-api (run via `tsx watch`, which auto-loads .env),
// `nest start --watch` has no built-in .env loading, and @nestjs/config's
// ConfigModule only populates process.env during Nest's async bootstrap —
// well after AppModule's imports (and @cerebro/db's adapter construction)
// have already evaluated with an undefined connection string. That earlier,
// permanently-undefined adapter is what @cerebro/db's singleton keeps using
// for the rest of the process's life, which surfaced as `SASL:
// SCRAM-SERVER-FIRST-MESSAGE: client password must be a string` the moment
// any request actually queried the database. Loading dotenv here, first,
// fixes it at the source instead of masking it downstream.
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('CerebroForge™ API')
    .setDescription('AI Software Factory — agent orchestration and code generation API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.FORGE_API_PORT ?? 4005;
  await app.listen(port);
  console.log(`🔨 CerebroForge™ API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/docs`);
}

bootstrap();
