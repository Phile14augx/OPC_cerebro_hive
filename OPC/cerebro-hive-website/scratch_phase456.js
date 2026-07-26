const fs = require('fs');
const path = require('path');

const packagesDir = path.join('d:', '{MY_PROJECTS}', '{OPC_cerebro_hive}', 'OPC', 'cerebro-hive-website', 'packages');

function scaffoldApiPackage(name, domainTypes, repositoryMock, serviceClass, hookName) {
  const dir = path.join(packagesDir, name + '-api');
  const src = path.join(dir, 'src');
  fs.mkdirSync(src, { recursive: true });

  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: "@cerebro/" + name + "-api",
    version: "0.1.0",
    private: true,
    main: "src/index.ts",
    dependencies: {
      "@tanstack/react-query": "^5.0.0",
      "@cerebro/events": "workspace:*"
    }
  }, null, 2));

  fs.writeFileSync(path.join(src, 'Types.ts'), domainTypes);
  fs.writeFileSync(path.join(src, 'Repository.ts'), repositoryMock);
  fs.writeFileSync(path.join(src, 'Service.ts'), serviceClass);
  fs.writeFileSync(path.join(src, 'Hooks.ts'), hookName);
  
  fs.writeFileSync(path.join(src, 'index.ts'), "export * from './Types';\nexport * from './Service';\nexport * from './Hooks';\n");
}

function scaffoldWidgetPackage(name, widgets) {
  const dir = path.join(packagesDir, 'widgets', name);
  const src = path.join(dir, 'src');
  fs.mkdirSync(src, { recursive: true });

  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: "@cerebro/widgets-" + name,
    version: "0.1.0",
    private: true,
    main: "src/index.ts",
    dependencies: {
      ["@cerebro/" + name + "-api"]: "workspace:*",
      "@cerebro/experience": "workspace:*",
      "@cerebro/ui": "workspace:*"
    }
  }, null, 2));

  let indexExports = "import { WidgetRegistry } from '@cerebro/experience/widgets/WidgetRegistry';\n";
  let registryInit = "export const register" + name.charAt(0).toUpperCase() + name.slice(1) + "Widgets = () => {\n";

  widgets.forEach(w => {
    fs.writeFileSync(path.join(src, w.component + '.tsx'), w.code);
    indexExports += "import { " + w.component + " } from './" + w.component + "';\n";
    registryInit += "  WidgetRegistry.register({\n" +
      "    id: '" + w.id + "',\n" +
      "    title: '" + w.title + "',\n" +
      "    category: '" + w.category + "',\n" +
      "    icon: 'layout',\n" +
      "    columnSpan: " + w.colSpan + ",\n" +
      "    rowSpan: " + w.rowSpan + ",\n" +
      "    defaultVisibility: true,\n" +
      "    permissions: ['*'],\n" +
      "    refreshPolicy: '30s',\n" +
      "    component: " + w.component + "\n" +
      "  });\n";
  });

  registryInit += "};\n";
  fs.writeFileSync(path.join(src, 'index.ts'), indexExports + "\n" + registryInit);
}

// EPIC 2: Governance
scaffoldApiPackage('governance', 
  "export interface PolicyEvaluation { id: string; policy: string; status: 'passed'|'failed'; timestamp: Date; }",
  "import { PolicyEvaluation } from './Types';\nexport class GovernanceRepository {\n  async getRecentEvaluations(): Promise<PolicyEvaluation[]> {\n    return [{ id: '1', policy: 'Data Privacy', status: 'passed', timestamp: new Date() }, { id: '2', policy: 'Model Toxicity', status: 'failed', timestamp: new Date() }];\n  }\n}",
  "import { GovernanceRepository } from './Repository';\nimport { PlatformEventBus } from '@cerebro/events';\nexport class GovernanceService {\n  constructor(private repo: GovernanceRepository) {}\n  async fetchRecentEvaluations() {\n    const data = await this.repo.getRecentEvaluations();\n    if (data.some(d => d.status === 'failed')) PlatformEventBus.publish('widget:event', { type: 'WIDGET_REFRESHED', source: 'governance', timestamp: new Date(), widgetId: 'policy-explorer' });\n    return data;\n  }\n}\nexport const governanceService = new GovernanceService(new GovernanceRepository());",
  "import { useQuery } from '@tanstack/react-query';\nimport { governanceService } from './Service';\nexport const useRecentEvaluations = () => useQuery({ queryKey: ['governance', 'evals'], queryFn: () => governanceService.fetchRecentEvaluations() });"
);

scaffoldWidgetPackage('governance', [
  {
    id: 'policy-explorer', title: 'Policy Explorer', category: 'Governance', colSpan: 2, rowSpan: 1, component: 'PolicyExplorerWidget',
    code: "import React, { useEffect } from 'react';\nimport { WidgetProps } from '@cerebro/experience/widgets/WidgetLifecycle';\nimport { useRecentEvaluations } from '@cerebro/governance-api';\nimport { CardContent, Badge } from '@cerebro/ui';\n\nexport const PolicyExplorerWidget: React.FC<WidgetProps> = ({ state, onStateChange }) => {\n  const { data, isLoading, isError } = useRecentEvaluations();\n  useEffect(() => {\n    if (isLoading) onStateChange('loading');\n    else if (isError) onStateChange('error');\n    else if (data) onStateChange('ready');\n  }, [isLoading, isError, data, onStateChange]);\n  if (state !== 'ready' || !data) return null;\n  return (\n    <CardContent className=\"flex flex-col gap-2 py-4\">\n      {data.map(e => (\n        <div key={e.id} className=\"flex justify-between items-center p-2 bg-[var(--color-surface-subtle)] rounded-md border border-[var(--color-border-subtle)]\">\n          <span className=\"text-sm font-medium\">{e.policy}</span>\n          <Badge variant={e.status === 'passed' ? 'outline' : 'destructive'}>{e.status}</Badge>\n        </div>\n      ))}\n    </CardContent>\n  );\n};"
  }
]);

// EPIC 3: Observability
scaffoldApiPackage('observability', 
  "export interface Trace { traceId: string; rootSpan: string; durationMs: number; error: boolean; }",
  "import { Trace } from './Types';\nexport class ObservabilityRepository {\n  async getRecentTraces(): Promise<Trace[]> {\n    return [{ traceId: 'trace-abc', rootSpan: 'LLM.Generate', durationMs: 1450, error: false }, { traceId: 'trace-xyz', rootSpan: 'RAG.Retrieve', durationMs: 420, error: true }];\n  }\n}",
  "import { ObservabilityRepository } from './Repository';\nexport class ObservabilityService {\n  constructor(private repo: ObservabilityRepository) {}\n  async fetchRecentTraces() { return this.repo.getRecentTraces(); }\n}\nexport const observabilityService = new ObservabilityService(new ObservabilityRepository());",
  "import { useQuery } from '@tanstack/react-query';\nimport { observabilityService } from './Service';\nexport const useRecentTraces = () => useQuery({ queryKey: ['observability', 'traces'], queryFn: () => observabilityService.fetchRecentTraces() });"
);

scaffoldWidgetPackage('observability', [
  {
    id: 'trace-viewer', title: 'Distributed Trace Viewer', category: 'Observability', colSpan: 2, rowSpan: 1, component: 'TraceViewerWidget',
    code: "import React, { useEffect } from 'react';\nimport { WidgetProps } from '@cerebro/experience/widgets/WidgetLifecycle';\nimport { useRecentTraces } from '@cerebro/observability-api';\nimport { CardContent, Badge } from '@cerebro/ui';\n\nexport const TraceViewerWidget: React.FC<WidgetProps> = ({ state, onStateChange }) => {\n  const { data, isLoading, isError } = useRecentTraces();\n  useEffect(() => {\n    if (isLoading) onStateChange('loading');\n    else if (isError) onStateChange('error');\n    else if (data) onStateChange('ready');\n  }, [isLoading, isError, data, onStateChange]);\n  if (state !== 'ready' || !data) return null;\n  return (\n    <CardContent className=\"flex flex-col gap-2 py-4\">\n      {data.map(t => (\n        <div key={t.traceId} className=\"flex justify-between items-center p-2 bg-[var(--color-surface-subtle)] rounded-md border border-[var(--color-border-subtle)]\">\n          <span className=\"text-sm font-medium\">{t.rootSpan}</span>\n          <span className=\"text-xs text-[var(--color-text-muted)]\">{t.durationMs}ms</span>\n          <Badge variant={t.error ? 'destructive' : 'outline'}>{t.error ? 'Error' : 'OK'}</Badge>\n        </div>\n      ))}\n    </CardContent>\n  );\n};"
  }
]);

// EPIC 4: Intelligence
scaffoldApiPackage('recommendation', 
  "export interface Recommendation { id: string; title: string; impact: string; }",
  "import { Recommendation } from './Types';\nexport class RecommendationRepository {\n  async getRecommendations(): Promise<Recommendation[]> {\n    return [{ id: '1', title: 'Scale down GPT-4 Router', impact: 'High Cost Savings' }];\n  }\n}",
  "import { RecommendationRepository } from './Repository';\nexport class RecommendationService {\n  constructor(private repo: RecommendationRepository) {}\n  async fetchRecommendations() { return this.repo.getRecommendations(); }\n}\nexport const recommendationService = new RecommendationService(new RecommendationRepository());",
  "import { useQuery } from '@tanstack/react-query';\nimport { recommendationService } from './Service';\nexport const useRecommendations = () => useQuery({ queryKey: ['intelligence', 'recommendations'], queryFn: () => recommendationService.fetchRecommendations() });"
);

scaffoldWidgetPackage('intelligence', [
  {
    id: 'ai-recommendations', title: 'AI Recommendations', category: 'Intelligence', colSpan: 2, rowSpan: 1, component: 'RecommendationsWidget',
    code: "import React, { useEffect } from 'react';\nimport { WidgetProps } from '@cerebro/experience/widgets/WidgetLifecycle';\nimport { useRecommendations } from '@cerebro/recommendation-api';\nimport { CardContent, Button } from '@cerebro/ui';\n\nexport const RecommendationsWidget: React.FC<WidgetProps> = ({ state, onStateChange }) => {\n  const { data, isLoading, isError } = useRecommendations();\n  useEffect(() => {\n    if (isLoading) onStateChange('loading');\n    else if (isError) onStateChange('error');\n    else if (data) onStateChange('ready');\n  }, [isLoading, isError, data, onStateChange]);\n  if (state !== 'ready' || !data) return null;\n  return (\n    <CardContent className=\"flex flex-col gap-3 py-4\">\n      {data.map(r => (\n        <div key={r.id} className=\"flex justify-between items-center p-3 bg-[var(--color-surface-subtle)] rounded-lg border border-[var(--color-border-subtle)]\">\n          <div>\n            <p className=\"text-sm font-medium\">{r.title}</p>\n            <p className=\"text-xs text-[var(--color-text-muted)] mt-1\">{r.impact}</p>\n          </div>\n          <Button size=\"sm\" variant=\"outline\">Apply</Button>\n        </div>\n      ))}\n    </CardContent>\n  );\n};"
  }
]);

console.log('Phases 4, 5, 6 generated successfully!');
