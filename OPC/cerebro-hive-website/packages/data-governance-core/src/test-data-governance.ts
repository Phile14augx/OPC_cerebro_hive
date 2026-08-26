import { Dataset } from './catalog/Dataset';
import { LineageGraph } from './lineage/LineageGraph';
import { ClassificationPropagator } from './classification/Classification';
import { StewardshipManager } from './stewardship/Stewardship';
import { SchemaRegistry } from './schema/SchemaRegistry';
import { QualityManager } from './quality/DataQuality';
import { BusinessGlossary } from './glossary/Glossary';

async function runDataGovernanceTest() {
  console.log('--- Starting Data Governance & Catalog Test ---');

  // 1. Setup Architecture
  const catalog = new Map<string, Dataset>();
  const lineageGraph = new LineageGraph();
  const propagator = new ClassificationPropagator(lineageGraph, catalog);
  const _stewardship = new StewardshipManager();
  const schemaRegistry = new SchemaRegistry();
  const qualityManager = new QualityManager();
  const glossary = new BusinessGlossary();

  // 2. Define Terminology
  glossary.addTerm({
    id: 'term-active-user',
    term: 'Active User',
    definition: 'A user who has executed a transaction within 30 days.',
    synonyms: ['MAU'],
    relatedDatasetIds: ['ds-customer-metrics'],
    relatedKpis: ['KPI_RETENTION'],
    relatedPolicies: ['POL_DATA_LIFECYCLE']
  });

  // 3. Create Datasets
  const dsOrders: Dataset = {
    id: 'ds-orders',
    name: 'Raw Orders',
    description: 'Raw webhooks from the ordering system',
    domain: 'Sales',
    certification: 'Certified',
    classification: { sensitivity: 'Public', containsPII: false, containsPHI: false, residency: ['US'] },
    tags: ['raw', 'sales'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const dsMetrics: Dataset = {
    id: 'ds-customer-metrics',
    name: 'Customer Metrics',
    description: 'Aggregated active user metrics',
    domain: 'Analytics',
    certification: 'Reviewed',
    classification: { sensitivity: 'Public', containsPII: false, containsPHI: false, residency: ['US'] },
    tags: ['analytics', 'metrics'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const dsDashboard: Dataset = {
    id: 'ds-exec-dashboard',
    name: 'Executive Dashboard',
    description: 'BI extract for executives',
    domain: 'Leadership',
    certification: 'Draft',
    classification: { sensitivity: 'Public', containsPII: false, containsPHI: false, residency: ['US'] },
    tags: ['bi', 'leadership'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  catalog.set(dsOrders.id, dsOrders);
  catalog.set(dsMetrics.id, dsMetrics);
  catalog.set(dsDashboard.id, dsDashboard);

  // 4. Build Lineage Graph (Orders -> Metrics -> Dashboard)
  console.log('\n[Lineage] Building DAG...');
  lineageGraph.addEdge({ id: 'edge-1', sourceDatasetId: dsOrders.id, targetDatasetId: dsMetrics.id, edgeType: 'Consumes' });
  lineageGraph.addEdge({ id: 'edge-2', sourceDatasetId: dsMetrics.id, targetDatasetId: dsDashboard.id, edgeType: 'ExportsTo' });

  // 5. Test Classification Propagation
  console.log('\n[Classification] Updating upstream source to PII & Confidential...');
  // Oh no, someone added an email field to the raw orders!
  dsOrders.classification.sensitivity = 'Confidential';
  dsOrders.classification.containsPII = true;
  dsOrders.classification.residency.push('EU'); // Added European orders

  // Push classification down the graph
  propagator.propagate(dsOrders.id);

  console.log('--- Post-Propagation State ---');
  console.log(`ds-customer-metrics Sensitivity: ${catalog.get('ds-customer-metrics')?.classification.sensitivity}`);
  console.log(`ds-customer-metrics containsPII: ${catalog.get('ds-customer-metrics')?.classification.containsPII}`);
  console.log(`ds-exec-dashboard Residency Constraints: ${catalog.get('ds-exec-dashboard')?.classification.residency.join(', ')}`);

  // 6. Test Lineage Impact Analysis
  console.log('\n[Impact Analysis] Deprecating Raw Orders...');
  dsOrders.certification = 'Deprecated';
  const impacted = lineageGraph.getDownstreamImpact(dsOrders.id);
  console.log(`The following downstream datasets must be reviewed due to deprecation: ${impacted.join(' -> ')}`);

  // 7. Schema Registry & Quality
  console.log('\n[Schema & Quality] Passive Metadata Checks...');
  schemaRegistry.registerSchema({
    id: 'schema-1',
    datasetId: dsOrders.id,
    version: 1,
    format: 'JSONSchema',
    definition: '{ "type": "object", "properties": { "email": { "type": "string" } } }',
    backwardCompatible: true,
    publishedAt: new Date()
  });

  qualityManager.updateProfile({
    datasetId: dsOrders.id,
    dimensions: [
      { dimension: 'Completeness', score: 99.5, lastMeasuredAt: new Date() },
      { dimension: 'Freshness', score: 95.0, lastMeasuredAt: new Date() }
    ],
    overallScore: 0 // Will be computed
  });

  console.log(`Registered Schema Version: ${schemaRegistry.getLatestSchema(dsOrders.id)?.version}`);
  console.log(`Dataset Overall Quality Score: ${qualityManager.getProfile(dsOrders.id)?.overallScore}`);
}

runDataGovernanceTest().catch(console.error);
