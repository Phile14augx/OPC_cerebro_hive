const fs = require('fs');

const files = [
  'tests/integration/platform-api/workflows.test.ts',
  'tests/integration/platform-api/agents.test.ts',
  'tests/integration/forge-api/executions.test.ts',
  'tests/integration/auth/api-key.test.ts',
  'services/forge-api/src/deploy/deploy.service.ts',
  'services/forge-api/src/projects/projects.service.ts',
  'services/forge-api/src/testing/testing.service.ts',
  'services/forge-api/src/review/review.service.ts',
  'services/forge-api/src/requirements/requirements.service.ts',
  'services/forge-api/src/planner/planner.service.ts',
  'services/forge-api/src/docs/docs.service.ts',
  'services/forge-api/src/database/database.module.ts',
  'services/forge-api/src/codegen/codegen.service.ts',
  'services/forge-api/src/architect/architect.service.ts',
  'services/forge-api/src/agent/agent-orchestrator.service.ts',
  'services/forge-api/package.json',
  'services/forge-api/scripts/generate-openapi.ts',
  'scripts/test-platform.ts',
  'packages/query/src/AgentQueryRepository.ts',
  'packages/execution-runtime-adapters/src/NatsExecutionEventPublisher.ts',
  'packages/execution-runtime-adapters/src/PostgresExecutionLeaseStore.ts',
  'packages/execution-runtime-adapters/index.ts',
  'packages/domain/package.json',
  'packages/domain/src/consumers/DashboardTelemetryConsumer.ts',
  'packages/domain/src/consumers/WebhookNotifier.ts',
  'packages/domain/src/execution/ExecutionOutboxEventPublisher.ts',
  'packages/domain/src/execution/__tests__/ExecutionEventDelivery.test.ts',
  'packages/domain/src/execution/__tests__/OutboxRelayExecutionEventSink.test.ts',
  'packages/db/package.json',
  'packages/db/prisma/seed.ts',
  'apps/studio/package.json',
  'apps/platform-api/src/server.ts',
  'apps/platform-api/src/modules/agents/agents.routes.ts',
  'apps/platform-api/src/modules/telemetry/telemetry.routes.ts',
  'apps/platform-api/src/modules/workflows/workflows.routes.ts',
  'apps/platform-api/src/modules/runtime/runtime.routes.ts'
];

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    
    if (file.endsWith('package.json')) {
      if (file.includes('packages/db')) {
        continue;
      }
      content = content.replace(/"@prisma\/client":\s*".*?"/g, '"@cerebro/db": "workspace:*"');
      modified = true;
    } else {
      if (content.includes('@prisma/client')) {
        content = content.replace(/'@prisma\/client'/g, "'@cerebro/db'");
        content = content.replace(/"@prisma\/client"/g, '"@cerebro/db"');
        modified = true;
      }
    }
    
    if (modified) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed ' + file);
    }
  } catch (e) {
    console.error('Error in ' + file + ': ' + e.message);
  }
}
