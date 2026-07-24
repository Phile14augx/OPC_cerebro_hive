import { ScoringEngine } from './scoring/ScoringEngine';
import { RiskRegister, EnterpriseRisk } from './register/RiskRegister';
import { AssessmentManager, ControlAssessment } from './assessment/AssessmentManager';
import { PolicyManager, PolicyException } from './policy/PolicyManager';
import { VendorRiskRegistry, VendorProfile } from './vendor/VendorRisk';

async function runRiskTest() {
  console.log('--- Starting Enterprise Risk & GRC Test ---');

  // 1. Setup Architecture
  const scoringEngine = new ScoringEngine();
  const riskRegister = new RiskRegister(scoringEngine);
  const assessmentManager = new AssessmentManager(riskRegister, scoringEngine);
  const policyManager = new PolicyManager(riskRegister, scoringEngine);
  const vendorRegistry = new VendorRiskRegistry();

  // 2. Register Enterprise Risk
  const inherentScore = scoringEngine.calculateScore(4, 5); // Likelihood 4, Impact 5 = 20 (Critical)
  
  const breachRisk: EnterpriseRisk = {
    riskId: 'risk-vendor-breach',
    title: 'Data Breach via 3rd Party Vendor',
    description: 'A critical vendor is compromised, leaking PII datasets.',
    category: 'Third-Party',
    owner: 'CISO',
    affectedAssets: ['ds-customer-pii'],
    linkedControls: ['ctrl-vendor-soc2', 'ctrl-vendor-pentest'],
    linkedPolicies: ['pol-vendor-security'],
    linkedVendors: ['vendor-mailchimp'],
    linkedExceptions: [],
    dependsOn: [],
    causes: ['risk-regulatory-fines'],
    inherentRisk: inherentScore,
    residualRisk: inherentScore, // Initially matches inherent
    status: 'Open'
  };
  
  riskRegister.registerRisk(breachRisk);

  // 3. Register Vendor Profile
  const vendor: VendorProfile = {
    vendorId: 'vendor-mailchimp',
    name: 'MailChimp',
    externalOrgRef: 'org-123',
    criticality: 'High',
    sharedDatasets: ['ds-customer-pii'],
    certifications: ['SOC 2 Type II'],
    openFindings: 0,
    residualVendorRisk: 'Medium'
  };
  vendorRegistry.registerVendor(vendor);

  // 4. Control Assessments (Multiple Control Failure Simulation)
  console.log('\n[Control Assessment] Simulating successful controls mitigating risk...');
  // We simulate the risk being mitigated by baseline controls
  riskRegister.updateResidualRisk(breachRisk.riskId, scoringEngine.applyMitigation(breachRisk.inherentRisk, 0.5));
  
  console.log('\n[Control Assessment] SOC2 Control Fails Operating Effectiveness...');
  const soc2Assessment: ControlAssessment = {
    assessmentId: 'asm-soc2-2026',
    controlId: 'ctrl-vendor-soc2',
    riskId: breachRisk.riskId,
    designEffectiveness: 'Effective',
    operatingEffectiveness: 'Ineffective', // Failed!
    assessor: 'Internal Audit',
    assessedAt: new Date()
  };
  assessmentManager.recordAssessment(soc2Assessment);
  
  console.log('\n[Control Assessment] Pentest Control Fails Design Effectiveness...');
  const pentestAssessment: ControlAssessment = {
    assessmentId: 'asm-pentest-2026',
    controlId: 'ctrl-vendor-pentest',
    riskId: breachRisk.riskId,
    designEffectiveness: 'Ineffective', // Failed!
    operatingEffectiveness: 'Effective',
    assessor: 'External Red Team',
    assessedAt: new Date()
  };
  assessmentManager.recordAssessment(pentestAssessment); // Should elevate residual risk closer to inherent

  // 5. Policy Exception Workflow
  console.log('\n[Policy Exception] Granting a temporary waiver for Vendor Security Policy...');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() - 1); // Set expiration to YESTERDAY for testing
  
  const exception: PolicyException = {
    exceptionId: 'exc-vendor-sec-001',
    policyId: 'pol-vendor-security',
    riskId: breachRisk.riskId,
    reason: 'Vendor requires 30 days to remediate SOC2 findings. Business accepted risk.',
    approvedBy: 'CEO',
    grantedAt: new Date(),
    expiresAt: expiresAt,
    status: 'Active'
  };
  policyManager.grantException(exception); // Should penalize (increase) residual risk

  // 6. Exception Expiration
  console.log('\n[Policy Exception] Evaluating expirations (simulating daily cron)...');
  policyManager.evaluateExpirations(); // Should detect expired exception, remove penalty, and recalculate risk

}

runRiskTest().catch(console.error);
