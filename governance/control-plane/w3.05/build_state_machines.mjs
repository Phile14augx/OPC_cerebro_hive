import fs from 'fs';
import path from 'path';

// Using JSON directly instead of YAML for the structures to easily stringify if needed, or we'll just write simple YAMLs.
// Actually, I can use yaml package to dump it since I am installing it.
import YAML from 'yaml';

const productLane = {
  name: 'PRODUCT',
  states: [
    'DISCOVERED', 'FORENSICS_COMPLETE', 'CONTRACT_PENDING', 'CONTRACT_BOUND',
    'READY_FOR_IMPLEMENTATION', 'RUNNING', 'VERIFYING', 'INTEGRATION_READY', 'RELEASED',
    'BLOCKED_CONTROL', 'BLOCKED_SCOPE', 'BLOCKED_EXTERNAL_MUTATION', 'BLOCKED_DEPENDENCY',
    'BLOCKED_SHARED_INFRA', 'BLOCKED_GIT_LOCK', 'BLOCKED_VERIFICATION', 'BLOCKED_INTEGRATION'
  ],
  transitions: [
    { from: 'DISCOVERED', to: 'FORENSICS_COMPLETE', trigger: 'Run Initial Forensics', reasonCode: ['PATH_IDENTITY_INVALID', 'GIT_LOCK_ACTIVE', 'CONTROL_CHANGED'] },
    { from: 'FORENSICS_COMPLETE', to: 'CONTRACT_PENDING', trigger: 'Register Product Intent', reasonCode: ['GIT_LOCK_ACTIVE', 'DIRTY_UNRECONCILED'] },
    { from: 'CONTRACT_PENDING', to: 'CONTRACT_BOUND', trigger: 'Bind Product Contract', reasonCode: ['SCOPE_MISSING', 'SCOPE_OVERLAP', 'BUILDER_VERIFIER_COLLISION', 'DEPENDENCY_UNBOUND', 'DIRTY_UNRECONCILED'] },
    { from: 'CONTRACT_BOUND', to: 'READY_FOR_IMPLEMENTATION', trigger: 'Acquire Builder Lease', reasonCode: ['LEASE_MISSING', 'LEASE_EXPIRED', 'FENCING_TOKEN_STALE', 'HEAD_CHANGED', 'HANDOFF_PENDING'] },
    { from: 'READY_FOR_IMPLEMENTATION', to: 'RUNNING', trigger: 'Begin Implementation', reasonCode: ['FENCING_TOKEN_STALE', 'CONTROL_CHANGED', 'PATH_SCOPE_ESCAPE'] },
    { from: 'RUNNING', to: 'VERIFYING', trigger: 'Signal Work Done & Hand to Verifier', reasonCode: ['BUILDER_VERIFIER_COLLISION', 'LEASE_MISSING', 'DIRTY_UNRECONCILED'] },
    { from: 'VERIFYING', to: 'INTEGRATION_READY', trigger: 'Issue Verifier Verdict', reasonCode: ['MACHINE_GREEN_FALSE', 'REQUIRED_CHECK_MISSING'] },
    { from: 'INTEGRATION_READY', to: 'RELEASED', trigger: 'Portfolio Integration', reasonCode: ['SCOPE_OVERLAP', 'CONTROL_CHANGED'] },
    { from: '*', to: 'BLOCKED_CONTROL', trigger: 'Live Epoch Drift / Invalidation', reasonCode: ['CONTROL_CHANGED', 'CONTROL_PARSE_INVALID', 'CONTROL_SCHEMA_INVALID'] },
    { from: '*', to: 'BLOCKED_SCOPE', trigger: 'Scope Escape / Overlap', reasonCode: ['PATH_SCOPE_ESCAPE', 'SCOPE_OVERLAP', 'SCOPE_MISSING'] },
    { from: '*', to: 'BLOCKED_EXTERNAL_MUTATION', trigger: 'Dirty State / Drift', reasonCode: ['DIRTY_UNRECONCILED', 'EXTERNAL_MUTATION_DETECTED'] },
    { from: 'CONTRACT_PENDING|CONTRACT_BOUND', to: 'BLOCKED_DEPENDENCY', trigger: 'Missing / Unbound Pin', reasonCode: ['DEPENDENCY_UNBOUND'] },
    { from: 'CONTRACT_BOUND|READY_FOR_IMPLEMENTATION|RUNNING', to: 'BLOCKED_SHARED_INFRA', trigger: 'Unowned Shared Resource', reasonCode: ['SHARED_INFRA_UNOWNED'] },
    { from: '*', to: 'BLOCKED_GIT_LOCK', trigger: 'Lock File Detected', reasonCode: ['GIT_LOCK_ACTIVE', 'GIT_LOCK_UNVERIFIABLE'] },
    { from: 'VERIFYING', to: 'BLOCKED_VERIFICATION', trigger: 'Test / Check Failure', reasonCode: ['MACHINE_GREEN_FALSE'] },
    { from: 'INTEGRATION_READY', to: 'BLOCKED_INTEGRATION', trigger: 'Integration Gate Rejection', reasonCode: ['EXTERNAL_MUTATION_DETECTED'] },
    { from: 'BLOCKED_*', to: 'DISCOVERED', trigger: 'Revalidation Run', reasonCode: ['DIRTY_UNRECONCILED', 'GIT_LOCK_ACTIVE'] },
    { from: 'BLOCKED_*', to: 'FORENSICS_COMPLETE', trigger: 'Revalidation Run', reasonCode: ['DIRTY_UNRECONCILED', 'GIT_LOCK_ACTIVE'] }
  ]
};

const recoveryLane = {
  name: 'RECOVERY',
  states: [
    'DISCOVERED', 'FORENSICS_COMPLETE', 'CONTRACT_PENDING', 'READY_FOR_RECOVERY',
    'RUNNING', 'MACHINE_VERIFIED_LOCAL', 'REMOTE_ATTESTATION_PENDING', 'MACHINE_VERIFIED_REMOTE',
    'HUMAN_GATE', 'RELEASE_READY', 'FROZEN', 'BLOCKED_SCOPE', 'BLOCKED_CONTROL',
    'BLOCKED_EXTERNAL_MUTATION', 'BLOCKED_REMOTE_ATTESTATION', 'BLOCKED_VERIFICATION'
  ],
  transitions: [
    { from: 'DISCOVERED', to: 'FORENSICS_COMPLETE', trigger: 'Run Forensics', reasonCode: ['PATH_IDENTITY_INVALID', 'GIT_LOCK_ACTIVE', 'CONTROL_CHANGED'] },
    { from: 'FORENSICS_COMPLETE', to: 'CONTRACT_PENDING', trigger: 'Register Tranche', reasonCode: ['GIT_LOCK_ACTIVE', 'DIRTY_UNRECONCILED'] },
    { from: 'CONTRACT_PENDING', to: 'READY_FOR_RECOVERY', trigger: 'Bind Recovery Contract', reasonCode: ['SCOPE_OVERLAP', 'BUILDER_VERIFIER_COLLISION', 'LEASE_MISSING', 'LEASE_EXPIRED'] },
    { from: 'READY_FOR_RECOVERY', to: 'RUNNING', trigger: 'Begin Recovery', reasonCode: ['FENCING_TOKEN_STALE', 'HEAD_CHANGED', 'CONTROL_CHANGED'] },
    { from: 'RUNNING', to: 'MACHINE_VERIFIED_LOCAL', trigger: 'Complete Local Tests', reasonCode: ['MACHINE_GREEN_FALSE'] },
    { from: 'MACHINE_VERIFIED_LOCAL', to: 'REMOTE_ATTESTATION_PENDING', trigger: 'Dispatch Remote Attestation', reasonCode: ['REMOTE_COMMIT_ABSENT', 'REMOTE_REF_UNAPPROVED'] },
    { from: 'REMOTE_ATTESTATION_PENDING', to: 'MACHINE_VERIFIED_REMOTE', trigger: 'Read Remote CI Attestation', reasonCode: ['REMOTE_ATTESTATION_STALE', 'REQUIRED_CHECK_POLICY_MISSING', 'REQUIRED_CHECK_MISSING', 'MACHINE_GREEN_FALSE', 'REMOTE_REPOSITORY_MISMATCH'] },
    { from: 'MACHINE_VERIFIED_REMOTE', to: 'HUMAN_GATE', trigger: 'Stage for Human Review', reasonCode: ['BUILDER_VERIFIER_COLLISION', 'MACHINE_GREEN_FALSE'] },
    { from: 'HUMAN_GATE', to: 'RELEASE_READY', trigger: 'Human Sign-off', reasonCode: ['CONTROL_CHANGED', 'EXTERNAL_MUTATION_DETECTED'] },
    { from: '*', to: 'FROZEN', trigger: 'Freeze Order / Baseline', reasonCode: ['HISTORICAL_EPOCH_MUTATION'] },
    { from: '*', to: 'BLOCKED_SCOPE', trigger: 'Scope Overlap', reasonCode: ['SCOPE_OVERLAP', 'PATH_SCOPE_ESCAPE'] },
    { from: '*', to: 'BLOCKED_CONTROL', trigger: 'Authority Mismatch', reasonCode: ['CONTROL_CHANGED', 'EPOCH_SUPERSESSION_MISMATCH'] },
    { from: '*', to: 'BLOCKED_EXTERNAL_MUTATION', trigger: 'Unexpected Mutation', reasonCode: ['DIRTY_UNRECONCILED', 'EXTERNAL_MUTATION_DETECTED'] },
    { from: 'MACHINE_VERIFIED_LOCAL|REMOTE_ATTESTATION_PENDING', to: 'BLOCKED_REMOTE_ATTESTATION', trigger: 'Remote CI Failure / Policy Gap', reasonCode: ['REMOTE_ATTESTATION_STALE', 'REQUIRED_CHECK_POLICY_MISSING', 'REQUIRED_CHECK_MISSING', 'MACHINE_GREEN_FALSE', 'REMOTE_REPOSITORY_MISMATCH'] },
    { from: 'RUNNING|MACHINE_VERIFIED_LOCAL', to: 'BLOCKED_VERIFICATION', trigger: 'Local Test Failure', reasonCode: ['MACHINE_GREEN_FALSE'] },
    { from: 'BLOCKED_*', to: 'DISCOVERED', trigger: 'Revalidation Run', reasonCode: ['CONTROL_CHANGED', 'DIRTY_UNRECONCILED'] },
    { from: 'BLOCKED_*', to: 'FORENSICS_COMPLETE', trigger: 'Revalidation Run', reasonCode: ['CONTROL_CHANGED', 'DIRTY_UNRECONCILED'] }
  ]
};

const publicationLane = {
  name: 'PUBLICATION',
  states: [
    'DISCOVERED', 'SNAPSHOTTED', 'VALIDATED', 'INDEPENDENTLY_VERIFIED',
    'CAS_READY', 'PUBLISHING', 'REVALIDATED', 'PUBLISHED',
    'CAS_CONFLICT', 'BLOCKED', 'FAILED'
  ],
  transitions: [
    { from: 'DISCOVERED', to: 'SNAPSHOTTED', trigger: 'Capture Live Authority', reasonCode: ['PATH_IDENTITY_INVALID', 'CONTROL_PARSE_INVALID'] },
    { from: 'SNAPSHOTTED', to: 'VALIDATED', trigger: 'Run Validator & Proposer', reasonCode: ['CONTROL_SCHEMA_INVALID', 'EPOCH_NOT_MONOTONIC', 'EPOCH_SUPERSESSION_MISMATCH', 'EPOCH_ROLLBACK_ATTEMPT'] },
    { from: 'VALIDATED', to: 'INDEPENDENTLY_VERIFIED', trigger: 'Independent Verification', reasonCode: ['BUILDER_VERIFIER_COLLISION', 'CONTROL_CHANGED', 'DIRTY_UNRECONCILED'] },
    { from: 'INDEPENDENTLY_VERIFIED', to: 'CAS_READY', trigger: 'Acquire Publication Lease', reasonCode: ['LEASE_MISSING', 'CAS_CONFLICT', 'FENCING_TOKEN_STALE'] },
    { from: 'CAS_READY', to: 'PUBLISHING', trigger: 'Stage Proposal & Prime CAS', reasonCode: ['CONTROL_SCHEMA_INVALID', 'NONDETERMINISTIC_OUTPUT'] },
    { from: 'PUBLISHING', to: 'REVALIDATED', trigger: 'Execute Atomic Replace', reasonCode: ['CAS_CONFLICT', 'CONTROL_CHANGED'] },
    { from: 'REVALIDATED', to: 'PUBLISHED', trigger: 'Commit Chained Receipt', reasonCode: ['CAS_CONFLICT'] },
    { from: '*', to: 'CAS_CONFLICT', trigger: 'Pre-replace Authority Drift', reasonCode: ['CAS_CONFLICT', 'CONTROL_CHANGED', 'EPOCH_SUPERSESSION_MISMATCH'] },
    { from: '*', to: 'BLOCKED', trigger: 'Policy / Gate Invalidation', reasonCode: ['DIRTY_UNRECONCILED', 'GIT_LOCK_ACTIVE', 'REMOTE_ATTESTATION_STALE'] },
    { from: 'PUBLISHING|REVALIDATED', to: 'FAILED', trigger: 'Atomic Replace / Verification Error', reasonCode: ['CAS_CONFLICT', 'CONTROL_CHANGED'] }
  ]
};

fs.writeFileSync('D:/CEREBRO_PRODUCT_WORKTREES/GOVERNANCE/w3.05-control-plane/governance/control-plane/w3.05/state-machines/product.yaml', YAML.stringify(productLane));
fs.writeFileSync('D:/CEREBRO_PRODUCT_WORKTREES/GOVERNANCE/w3.05-control-plane/governance/control-plane/w3.05/state-machines/recovery.yaml', YAML.stringify(recoveryLane));
fs.writeFileSync('D:/CEREBRO_PRODUCT_WORKTREES/GOVERNANCE/w3.05-control-plane/governance/control-plane/w3.05/state-machines/publication.yaml', YAML.stringify(publicationLane));

console.log("YAMLs created");
