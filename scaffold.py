import os

base_dir = "apps/p41-ai-governance"

files = {
    "package.json": """{
  "name": "p41-ai-governance",
  "version": "1.0.0",
  "description": "P41 AI Governance",
  "private": true,
  "scripts": {
    "build": "tsc",
    "lint": "eslint \\"{src,apps,libs,test}/**/*.ts\\" --fix"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@prisma/client": "^5.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.42.0",
    "prisma": "^5.0.0",
    "typescript": "^5.1.3"
  }
}
""",
    "tsconfig.json": """{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
""",
    ".eslintrc.js": """module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
""",
    "prisma/schema.prisma": """generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Policy {
  id          String   @id @default(uuid())
  name        String
  regoContent String
  version     Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  status      String   // active, inactive
}

model ModelCard {
  id           String   @id @default(uuid())
  modelId      String   @unique
  name         String
  capabilities Json
  limitations  Json
  status       String   // draft, approved, deprecated
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model ApprovalWorkflow {
  id           String   @id @default(uuid())
  resourceId   String
  workflowType String   // human, automated, escalation
  status       String   // pending, approved, rejected
  justification String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model ProvenanceRecord {
  id            String   @id @default(cuid())
  sourceProduct String   // e.g. "P44"
  eventType     String
  subjectId     String
  payload       Json
  lawfulBasis   String?
  epsilon       Float?
  delta         Float?
  timestamp     DateTime @default(now())
  policyRef     String?
  verdict       String?
}
""",
    "src/main.ts": """import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
""",
    "src/app.module.ts": """import { Module } from '@nestjs/common';
import { GovernanceModule } from './governance/governance.module';

@Module({
  imports: [GovernanceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
""",
    "src/governance/governance.module.ts": """import { Module } from '@nestjs/common';
import { GovernanceController } from './governance.controller';
import { GovernanceService } from './governance.service';

@Module({
  controllers: [GovernanceController],
  providers: [GovernanceService],
  exports: [GovernanceService]
})
export class GovernanceModule {}
""",
    "src/governance/governance.controller.ts": """import { Controller, Post, Body } from '@nestjs/common';
import { GovernanceService } from './governance.service';

@Controller('api/v1/governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Post('policies/evaluate')
  evaluatePolicy(@Body() body: any) {
    return this.governanceService.evaluatePolicy(body);
  }

  @Post('approvals')
  requestApproval(@Body() body: any) {
    return this.governanceService.requestApproval(body);
  }

  @Post('models/cards')
  registerModelCard(@Body() body: any) {
    return this.governanceService.registerModelCard(body);
  }
}
""",
    "src/governance/governance.service.ts": """import { Injectable } from '@nestjs/common';

@Injectable()
export class GovernanceService {
  evaluatePolicy(data: any) {
    return {
      allowed: false,
      reason: 'Missing required approval',
      policyViolations: ['policy-001']
    };
  }

  requestApproval(data: any) {
    return {
      approvalId: 'app-789',
      status: 'pending'
    };
  }

  registerModelCard(data: any) {
    return {
      cardId: 'card-001',
      status: 'registered'
    };
  }
}
""",
    "src/governance/interfaces/opa-policy.interface.ts": """export interface IOpaPolicy {
  id: string;
  name: string;
  regoContent: string;
  version: number;
  status: 'active' | 'inactive';
}

export interface IOpaPolicyEvaluationRequest {
  action: string;
  resourceId: string;
  context: Record<string, any>;
}

export interface IOpaPolicyEvaluationResponse {
  allowed: boolean;
  reason?: string;
  policyViolations?: string[];
}
""",
    "src/governance/interfaces/event-contracts.interface.ts": """export interface IPolicyEvaluatedEvent {
  eventId: string;
  timestamp: string;
  action: string;
  resourceId: string;
  allowed: boolean;
  violations: string[];
}

export interface IApprovalStatusChangedEvent {
  eventId: string;
  timestamp: string;
  approvalId: string;
  resourceId: string;
  oldStatus: string;
  newStatus: string;
  approverId: string;
}

export interface IBudgetExceededEvent {
  subjectId: string;
  provenanceRecordId: string;
  verdict: 'deny' | 'escalate';
  policyRef: string;
  timestamp: string;
}

export interface IPrivacyBudgetConsumedEvent {
  eventType: 'privacy_budget_consumed';
  sourceProduct: string;
  subjectId: string;
  epsilon: number;
  delta: number;
  cumulativeEpsilon: number;
  threshold: number;
  exceeded: boolean;
  operation: string;
  timestamp: string;
}
"""
}

for filename, content in files.items():
    filepath = os.path.join(base_dir, filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w") as f:
        f.write(content)
