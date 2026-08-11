import { InMemoryTelemetryStore, TelemetryRecord } from './store/TelemetryStore';
import { EventAggregator } from './timeline/EventAggregator';
import { BehaviorBaselineEngine } from './analytics/BehaviorBaselineEngine';
import { ThreatDetector } from './analytics/ThreatDetector';
import { RecommendationEngine } from './recommendations/RecommendationEngine';

async function runIntelligenceTest() {
  console.log('--- Starting Security Intelligence & SecOps Test ---');

  // 1. Setup Store & Aggregator
  const store = new InMemoryTelemetryStore();
  const aggregator = new EventAggregator(store);
  const baselineEngine = new BehaviorBaselineEngine();
  const threatDetector = new ThreatDetector();
  const recommendationEngine = new RecommendationEngine();

  const principalId = 'user-secops-999';

  // 2. Synthesize 30 days of "Normal" Telemetry
  console.log('\n[Telemetry] Ingesting historical baseline telemetry...');
  const baseTime = Date.now() - 30 * 24 * 60 * 60 * 1000;
  
  for (let i = 0; i < 20; i++) {
    await aggregator.consumeEvent({
      id: `evt-hist-${i}`,
      timestamp: new Date(baseTime + i * 24 * 60 * 60 * 1000), // 1 per day
      principalId,
      eventType: 'CapabilityAccessed',
      severity: 'Info',
      metadata: { location: 'US-East', capability: 'reports:read' }
    });
  }

  // 3. Build Timeline & Baseline
  const historicalTimeline = await aggregator.buildTimeline(principalId);
  const baseline = baselineEngine.calculateBaseline(historicalTimeline);
  console.log(`[UEBA] Baseline established.`);
  console.log(`   Typical Locations:`, Array.from(baseline.commonLocations));
  console.log(`   Frequent Capabilities:`, Array.from(baseline.frequentCapabilities));

  // 4. Synthesize Anomalous & Threat Activity (Today)
  console.log('\n[Telemetry] Ingesting real-time anomalous telemetry...');
  
  // Anomaly: Logging in from EU-West
  const anomalyEvent: TelemetryRecord = {
    id: `evt-anom-1`,
    timestamp: new Date(),
    principalId,
    eventType: 'Login',
    severity: 'Info',
    metadata: { location: 'EU-West' } // Not in baseline
  };
  await aggregator.consumeEvent(anomalyEvent);

  const anomalies = baselineEngine.evaluateAnomaly(baseline, anomalyEvent);
  if (anomalies.length > 0) {
    console.log(`[UEBA] Anomaly Detected: ${anomalies.join(', ')}`);
  }

  // Threat: 5 Denies + MFA failure
  for (let i = 0; i < 5; i++) {
    await aggregator.consumeEvent({
      id: `evt-threat-deny-${i}`,
      timestamp: new Date(Date.now() - (5 - i) * 1000),
      principalId,
      eventType: 'PolicyDeny',
      severity: 'Warning',
      metadata: { resource: 'system:root' }
    });
  }
  await aggregator.consumeEvent({
    id: `evt-threat-mfa`,
    timestamp: new Date(),
    principalId,
    eventType: 'MfaFailed',
    severity: 'Critical',
    metadata: {}
  });

  // 5. Detect Threats
  const currentTimeline = await aggregator.buildTimeline(principalId);
  console.log(`\n[Timeline] Forensic Summary: ${currentTimeline.summarize()}`);

  const threats = threatDetector.evaluate(currentTimeline);
  if (threats.length > 0) {
    console.log(`[Threat Intel] 🚨 ALERT TRIGGERED: ${threats[0].threatType}`);
    console.log(`   Severity: ${threats[0].severity}`);
    console.log(`   Description: ${threats[0].description}`);
  }

  // 6. Generate Policy Recommendations
  console.log('\n[SecOps] Generating Policy Recommendations...');
  // Assume user holds 'ent-sysadmin' but our historical baseline shows they only ever use 'reports:read'
  const currentEntitlements = ['ent-sysadmin', 'ent-reporter'];
  
  const recommendations = recommendationEngine.generateRecommendations(currentTimeline, currentEntitlements);
  for (const rec of recommendations) {
    console.log(`[Recommendation] Type: ${rec.type} (Confidence: ${rec.confidenceScore}%)`);
    console.log(`   Reason: ${rec.description}`);
    console.log(`   Action: ${rec.suggestedAction}`);
  }
}

runIntelligenceTest().catch(console.error);
