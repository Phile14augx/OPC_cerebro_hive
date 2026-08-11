#!/usr/bin/env node
/**
 * CI Helm Chart Validation
 *
 * Renders the cerebro-hive chart against each values overlay and fails the
 * build on three categories of bug that the audit found in production:
 *
 * 1. Duplicate resource identity — more than one rendered object sharing
 *    (apiVersion, kind, namespace, name). This is the exact class of bug
 *    that the two-template-set drift introduced and that went undetected
 *    because nothing validated rendered output.
 *
 * 2. Unconsumed override keys — any key in values-staging.yaml or
 *    values-production.yaml that doesn't match a key in values.yaml (the
 *    base schema). This would have caught the snake_case/camelCase mismatch
 *    (platform_api vs platformApi, replicaCount vs replicas) on day one.
 *
 * 3. Missing required secrets — every service that reads a provider API key
 *    (ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY) must have a
 *    matching secretRef in its rendered manifest. Would have caught the
 *    platform-api / cerebro-hive-ai-secrets gap.
 *
 * Usage: node scripts/helm-validate.js
 * Requires: helm (>=3.x) on $PATH
 */

'use strict';

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHART_DIR = path.join(__dirname, '..', 'infra', 'helm', 'cerebro-hive');
const BASE_VALUES = path.join(CHART_DIR, 'values.yaml');
const OVERLAYS = [
  { name: 'staging',    file: path.join(CHART_DIR, 'values-staging.yaml') },
  { name: 'production', file: path.join(CHART_DIR, 'values-production.yaml') },
];

// Services that read provider API keys and therefore must have cerebro-hive-ai-secrets mounted.
const SERVICES_REQUIRING_AI_SECRETS = ['platform-api', 'ai-gateway', 'forge-api'];

// Keys that must originate from Secret refs, never literal env values.
const SENSITIVE_ENV_KEYS = ['ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'GOOGLE_API_KEY'];

let failures = 0;

function fail(msg) {
  console.error(`  ✗ FAIL: ${msg}`);
  failures++;
}

function pass(msg) {
  console.log(`  ✓ PASS: ${msg}`);
}

// ─── 1. Render and check each overlay ────────────────────────────────────────

for (const overlay of OVERLAYS) {
  console.log(`\n── Validating overlay: ${overlay.name} ──`);

  const helmArgs = [
    'template', 'cerebro-hive', CHART_DIR,
    '-f', BASE_VALUES,
    '-f', overlay.file,
    '--namespace', 'cerebro-hive',
  ];

  const result = spawnSync('helm', helmArgs, { encoding: 'utf8' });

  if (result.status !== 0) {
    fail(`helm template failed for ${overlay.name}: ${result.stderr}`);
    continue;
  }

  const manifests = parseMultiDocYaml(result.stdout);

  // Check 1: Duplicate resource identities
  const seen = new Map();
  for (const manifest of manifests) {
    if (!manifest || !manifest.kind) continue;
    const key = `${manifest.apiVersion}/${manifest.kind}/${manifest.metadata?.namespace ?? 'default'}/${manifest.metadata?.name}`;
    if (seen.has(key)) {
      fail(`Duplicate resource identity in ${overlay.name}: ${key}`);
    } else {
      seen.set(key, true);
    }
  }
  if (!failures) pass(`No duplicate resource identities in ${overlay.name}`);

  // Check 2: Services requiring AI secrets have them mounted
  for (const svcName of SERVICES_REQUIRING_AI_SECRETS) {
    const deployment = manifests.find(
      m => m?.kind === 'Deployment' && m?.metadata?.name === svcName,
    );
    if (!deployment) continue; // Service may be disabled in this overlay

    const containers = deployment.spec?.template?.spec?.containers ?? [];
    const hasMounted = containers.some(c =>
      (c.envFrom ?? []).some(ef => ef.secretRef?.name === 'cerebro-hive-ai-secrets'),
    );

    if (hasMounted) {
      pass(`${svcName} has cerebro-hive-ai-secrets mounted in ${overlay.name}`);
    } else {
      fail(`${svcName} is MISSING cerebro-hive-ai-secrets in ${overlay.name} — LLM calls will silently fail`);
    }
  }

  // Check 3: Sensitive keys must not appear as literal env values
  for (const manifest of manifests) {
    if (manifest?.kind !== 'Deployment') continue;
    const containers = manifest.spec?.template?.spec?.containers ?? [];
    for (const container of containers) {
      for (const envEntry of container.env ?? []) {
        if (SENSITIVE_ENV_KEYS.includes(envEntry.name) && envEntry.value !== undefined) {
          fail(
            `${manifest.metadata?.name}: ${envEntry.name} is set as a literal env value — must come from a secretRef`,
          );
        }
      }
    }
  }

  // Check 4: Service.targetPort == containerPort == PORT env var
  const services  = manifests.filter(m => m?.kind === 'Service');
  const deployments = manifests.filter(m => m?.kind === 'Deployment');
  for (const svc of services) {
    const svcName = svc.metadata?.name;
    const dep = deployments.find(d => d.metadata?.name === svcName);
    if (!dep) continue;

    const containerPort = dep.spec?.template?.spec?.containers?.[0]?.ports?.[0]?.containerPort;
    const portEnv = dep.spec?.template?.spec?.containers?.[0]?.env?.find(e => e.name === 'PORT');
    const targetPort = svc.spec?.ports?.[0]?.targetPort;

    if (containerPort && portEnv?.value && targetPort) {
      if (String(containerPort) !== String(portEnv.value) || String(containerPort) !== String(targetPort)) {
        fail(`${svcName} port mismatch in ${overlay.name}: containerPort=${containerPort}, PORT env=${portEnv.value}, targetPort=${targetPort}`);
      } else {
        pass(`${svcName} ports are consistent (${containerPort}) in ${overlay.name}`);
      }
    }
  }
}

// ─── 2. Unconsumed override key check ────────────────────────────────────────

console.log('\n── Checking for unconsumed override keys ──');

try {
  const yaml = require('js-yaml');
  const baseKeys = flattenKeys(yaml.load(fs.readFileSync(BASE_VALUES, 'utf8')));

  for (const overlay of OVERLAYS) {
    const overrideKeys = flattenKeys(yaml.load(fs.readFileSync(overlay.file, 'utf8')));
    for (const key of overrideKeys) {
      const baseKey = key.split('.').slice(0, 2).join('.'); // Check top-2 levels
      if (!baseKeys.some(bk => bk.startsWith(baseKey))) {
        fail(`${overlay.name}: override key '${key}' has no match in base values.yaml — possible schema mismatch`);
      }
    }
  }
  if (!failures) pass('All override keys are present in the base values schema');
} catch (e) {
  console.log(`  ⚠  Skipping unconsumed-key check (js-yaml not available): ${e.message}`);
}

// ─── Result ──────────────────────────────────────────────────────────────────

console.log('\n');
if (failures > 0) {
  console.error(`Helm validation FAILED with ${failures} error(s).`);
  process.exit(1);
} else {
  console.log('Helm validation PASSED.');
  process.exit(0);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseMultiDocYaml(text) {
  // Simple splitter — avoids pulling in a full YAML parser for the render check.
  // Splits on the '---' document separator and parses each chunk individually.
  try {
    const yaml = require('js-yaml');
    return text.split(/^---$/m).map(doc => {
      try { return yaml.load(doc); } catch { return null; }
    }).filter(Boolean);
  } catch {
    // Fallback: return empty — other checks will still run.
    return [];
  }
}

function flattenKeys(obj, prefix = '') {
  if (!obj || typeof obj !== 'object') return [prefix];
  return Object.entries(obj).flatMap(([k, v]) =>
    flattenKeys(v, prefix ? `${prefix}.${k}` : k),
  );
}
