const fs = require('fs');
const path = require('path');

const srcDir = 'apps/p01-data-fabric/src';
fs.mkdirSync(srcDir, { recursive: true });

const files = {
  'main.ts': `
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
  `,
  'app.module.ts': `
import { Module } from '@nestjs/common';
import { IngestionModule } from './ingestion/ingestion.module';
import { TransformationModule } from './transformation/transformation.module';
import { FederationModule } from './federation/federation.module';

@Module({
  imports: [IngestionModule, TransformationModule, FederationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
  `,
  'ingestion/ingestion.module.ts': `
import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';

@Module({
  controllers: [IngestionController],
  providers: [IngestionService],
  exports: [IngestionService]
})
export class IngestionModule {}
  `,
  'ingestion/ingestion.controller.ts': `
import { Controller, Post, Body } from '@nestjs/common';
import { IngestionService } from './ingestion.service';

@Controller('v1/ingest')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('connectors')
  createConnector(@Body() body: any) {
    return this.ingestionService.createConnector(body);
  }
}
  `,
  'ingestion/ingestion.service.ts': `
import { Injectable } from '@nestjs/common';

@Injectable()
export class IngestionService {
  createConnector(data: any) {
    return { status: 'Connector created', data };
  }
}
  `,
  'ingestion/connectors/connector.interface.ts': `
export interface IConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  ingest(data: any): Promise<void>;
}
  `,
  'transformation/transformation.module.ts': `
import { Module } from '@nestjs/common';
import { TransformationController } from './transformation.controller';
import { TransformationService } from './transformation.service';

@Module({
  controllers: [TransformationController],
  providers: [TransformationService],
  exports: [TransformationService]
})
export class TransformationModule {}
  `,
  'transformation/transformation.controller.ts': `
import { Controller, Post, Body } from '@nestjs/common';
import { TransformationService } from './transformation.service';

@Controller('v1/transform')
export class TransformationController {
  constructor(private readonly transformationService: TransformationService) {}

  @Post('jobs')
  triggerJob(@Body() body: any) {
    return this.transformationService.triggerJob(body);
  }
}
  `,
  'transformation/transformation.service.ts': `
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransformationService {
  triggerJob(data: any) {
    return { status: 'Job accepted', data };
  }
}
  `,
  'transformation/engines/engine.interface.ts': `
export interface ITransformationEngine {
  executeJob(jobName: string, parameters: any): Promise<void>;
  getStatus(jobId: string): Promise<string>;
}
  `,
  'federation/federation.module.ts': `
import { Module } from '@nestjs/common';
import { FederationController } from './federation.controller';
import { FederationService } from './federation.service';

@Module({
  controllers: [FederationController],
  providers: [FederationService],
  exports: [FederationService]
})
export class FederationModule {}
  `,
  'federation/federation.controller.ts': `
import { Controller, Post, Body } from '@nestjs/common';
import { FederationService } from './federation.service';

@Controller('v1/query')
export class FederationController {
  constructor(private readonly federationService: FederationService) {}

  @Post()
  executeQuery(@Body() body: any) {
    return this.federationService.executeQuery(body);
  }
}
  `,
  'federation/federation.service.ts': `
import { Injectable } from '@nestjs/common';

@Injectable()
export class FederationService {
  executeQuery(data: any) {
    return { status: 'Query executed', result: [] };
  }
}
  `,
  'federation/engines/federation.interface.ts': `
export interface IFederationEngine {
  query(sql: string): Promise<any[]>;
}
  `
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(srcDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim());
}
console.log('Scaffold generated');
