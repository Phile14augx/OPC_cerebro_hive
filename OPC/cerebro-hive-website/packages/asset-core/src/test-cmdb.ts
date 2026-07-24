import { CMDBRegistry } from './registry/CMDBRegistry';
import { InMemoryCMDBRepository } from './registry/InMemoryCMDBRepository';
import { ConfigurationItem } from './domain/ConfigurationItem';
import { LifecycleStatus } from './domain/Lifecycle';
import { RelationshipType } from './domain/AssetRelationship';
import { DependencyResolver } from './graph/DependencyResolver';
import { ImpactAnalyzer } from './graph/ImpactAnalyzer';

async function runTest() {
  console.log('--- Starting CMDB Graph & Impact Analysis Test ---');
  
  const repo = new InMemoryCMDBRepository();
  const registry = new CMDBRegistry(repo);
  const resolver = new DependencyResolver(repo);
  const analyzer = new ImpactAnalyzer(repo);

  // 1. Create CIs (Configuration Items)
  const checkoutApp: ConfigurationItem = {
    ciId: 'ci-checkout-app',
    name: 'Checkout UI',
    type: 'Application',
    businessCriticality: 'MissionCritical',
    lifecycleStatus: LifecycleStatus.Active,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const paymentApi: ConfigurationItem = {
    ciId: 'ci-payment-api',
    name: 'Payment API',
    type: 'Microservice',
    businessCriticality: 'MissionCritical',
    lifecycleStatus: LifecycleStatus.Active,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const ordersDb: ConfigurationItem = {
    ciId: 'ci-orders-db',
    name: 'Orders Database',
    type: 'Database',
    businessCriticality: 'MissionCritical',
    lifecycleStatus: LifecycleStatus.Active,
    createdAt: new Date(),
    updatedAt: new Date(),
    cloudMetadata: {
      provider: 'AWS',
      resourceId: 'arn:aws:rds:us-east-1:123456:db:orders-prod',
      region: 'us-east-1',
      resourceType: 'AWS::RDS::DBInstance'
    }
  };

  const stripeVendor: ConfigurationItem = {
    ciId: 'ci-stripe',
    name: 'Stripe Gateway',
    type: 'Vendor',
    businessCriticality: 'BusinessCritical',
    lifecycleStatus: LifecycleStatus.Active,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await registry.registerCI(checkoutApp);
  await registry.registerCI(paymentApi);
  await registry.registerCI(ordersDb);
  await registry.registerCI(stripeVendor);

  // 2. Establish Relationships
  await registry.mapRelationship({
    sourceCiId: 'ci-checkout-app',
    targetCiId: 'ci-payment-api',
    relationshipType: RelationshipType.DependsOn
  });

  await registry.mapRelationship({
    sourceCiId: 'ci-payment-api',
    targetCiId: 'ci-orders-db',
    relationshipType: RelationshipType.DependsOn
  });

  await registry.mapRelationship({
    sourceCiId: 'ci-payment-api',
    targetCiId: 'ci-stripe',
    relationshipType: RelationshipType.Consumes
  });

  // 3. Test Graph Traversal
  console.log('\n[Dependency Graph] Resolving Downstream Dependencies for Checkout UI...');
  const downstreamPaths = await resolver.resolveDownstream('ci-checkout-app');
  downstreamPaths.forEach((p, idx) => {
    const pathStr = p.path.map(ci => ci.name).join(' -> ');
    console.log(`  Path ${idx + 1}: ${pathStr}`);
  });

  // 4. Test Impact Analysis
  console.log('\n[Impact Analysis] Simulating failure of Orders Database...');
  const impactedCIs = await analyzer.analyzeImpact('ci-orders-db');
  console.log('  Impacted Upstream Systems:');
  impactedCIs.forEach(ci => {
    console.log(`   - ${ci.name} (${ci.type})`);
  });
  
  console.log('\n--- Test Completed Successfully ---');
}

runTest().catch(console.error);
