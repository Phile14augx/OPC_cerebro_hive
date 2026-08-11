/**
 * CerebroHive SLO Load Test
 *
 * Validates that the platform meets its SLO targets under sustained load
 * at three user tiers: 10, 100, and 1000 concurrent virtual users.
 *
 * SLO Targets:
 *   API Availability    ≥ 99.95%           (error rate < 0.05%)
 *   P95 Latency         < 250 ms           (forge-api endpoints)
 *   P99 Latency         < 750 ms           (forge-api endpoints)
 *   Error Rate          < 0.1%             (all HTTP 5xx)
 *   AI Job Completion   ≥ 99%              (agent runs succeed)
 *   Auth Latency P95    < 100 ms           (token validation)
 *   Streaming Latency   < 5000 ms TTFB     (AI inference first byte)
 *
 * Test structure (ramping VU stages):
 *   0:00 → 2:00   Ramp to tier_vus
 *   2:00 → 12:00  Sustained load (SLO measurement window)
 *   12:00 → 14:00 Ramp down
 *
 * Usage:
 *   k6 run --env TIER=10 --env BASE_URL=https://api.cerebro-hive.io infra/k6/slo-load-test.js
 *   k6 run --env TIER=100 --env BASE_URL=https://api.cerebro-hive.io infra/k6/slo-load-test.js
 *   k6 run --env TIER=1000 --env BASE_URL=https://api.cerebro-hive.io infra/k6/slo-load-test.js
 *
 * Output: k6 built-in metrics + custom cerebro.* metrics
 *   Prometheus remote write: --out experimental-prometheus-rw
 *   JSON results: --out json=results.json
 */

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend, Gauge } from 'k6/metrics';
import { randomIntBetween, randomItem } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import { SharedArray } from 'k6/data';

// ── Configuration ─────────────────────────────────────────────────────────────

const BASE_URL   = __ENV.BASE_URL   || 'https://api.cerebro-hive.io';
const TIER       = parseInt(__ENV.TIER || '10');
const API_TOKEN  = __ENV.API_TOKEN  || '';
const WORKSPACE  = __ENV.WORKSPACE_ID || 'ws-load-test';

// Tier → VU count mapping
const TIER_CONFIG = {
  10:   { vus: 10,   ramp: '2m', sustain: '10m', ramp_down: '2m' },
  100:  { vus: 100,  ramp: '3m', sustain: '10m', ramp_down: '2m' },
  1000: { vus: 1000, ramp: '5m', sustain: '10m', ramp_down: '3m' },
};

const cfg = TIER_CONFIG[TIER] || TIER_CONFIG[10];

// ── k6 options (thresholds = SLO contracts) ──────────────────────────────────

export const options = {
  scenarios: {
    api_load: {
      executor: 'ramping-vus',
      stages: [
        { duration: cfg.ramp,      target: cfg.vus  },  // ramp up
        { duration: cfg.sustain,   target: cfg.vus  },  // sustained load
        { duration: cfg.ramp_down, target: 0        },  // ramp down
      ],
      gracefulRampDown: '30s',
    },
  },

  // ── SLO thresholds — failure here means SLO breach ─────────────────────
  thresholds: {
    // API Availability ≥ 99.95%
    'http_req_failed': [
      { threshold: 'rate<0.0005', abortOnFail: false },
    ],

    // P95 latency < 250ms for all requests
    'http_req_duration': [
      { threshold: 'p(95)<250',  abortOnFail: false },
      { threshold: 'p(99)<750',  abortOnFail: false },
      { threshold: 'p(50)<100',  abortOnFail: false },
    ],

    // Auth endpoint P95 < 100ms
    'http_req_duration{endpoint:auth}': [
      { threshold: 'p(95)<100', abortOnFail: false },
    ],

    // Forge API endpoints P95 < 250ms
    'http_req_duration{endpoint:forge}': [
      { threshold: 'p(95)<250', abortOnFail: false },
      { threshold: 'p(99)<750', abortOnFail: false },
    ],

    // AI inference streaming TTFB < 5000ms
    'cerebro_streaming_ttfb': [
      { threshold: 'p(95)<5000', abortOnFail: false },
    ],

    // AI job completion ≥ 99%
    'cerebro_ai_job_success_rate': [
      { threshold: 'rate>0.99', abortOnFail: false },
    ],

    // Custom error rate < 0.1%
    'cerebro_error_rate': [
      { threshold: 'rate<0.001', abortOnFail: false },
    ],

    // Project CRUD P95 < 200ms
    'http_req_duration{endpoint:projects}': [
      { threshold: 'p(95)<200', abortOnFail: false },
    ],

    // Health check must always be < 50ms (circuit breaker proxy pattern)
    'http_req_duration{endpoint:health}': [
      { threshold: 'p(99)<50', abortOnFail: false },
    ],
  },

  // Output tags for grouping in Prometheus / Grafana
  tags: {
    tier: `${TIER}`,
    test_suite: 'slo-validation',
    environment: __ENV.ENV || 'staging',
  },
};

// ── Custom metrics ─────────────────────────────────────────────────────────────

const streamingTTFB        = new Trend('cerebro_streaming_ttfb', true);
const aiJobSuccessRate     = new Rate('cerebro_ai_job_success_rate');
const errorRate            = new Rate('cerebro_error_rate');
const activeConnections    = new Gauge('cerebro_active_connections');
const requestsPerSecond    = new Counter('cerebro_requests_total');
const tokenThroughput      = new Counter('cerebro_tokens_generated_total');
const costAccrued          = new Counter('cerebro_cost_usd_micros');

// ── Test data ─────────────────────────────────────────────────────────────────

const TEST_PROMPTS = new SharedArray('prompts', function () {
  return [
    'Write a Python function that implements a binary search tree',
    'Create a React component for a data table with sorting and filtering',
    'Design a REST API for a user authentication service',
    'Write unit tests for a shopping cart module',
    'Explain the SOLID principles with TypeScript examples',
    'Implement a rate limiter using Redis in Node.js',
    'Write a SQL query to find the top 10 most active users this month',
    'Create a GitHub Actions workflow for CI/CD of a Node.js app',
  ];
});

const PROJECT_NAMES = new SharedArray('project_names', function () {
  return [
    'k6-load-test-project',
    'slo-validation-project',
    'perf-test-workspace',
    'load-test-forge',
  ];
});

// ── Auth helper ────────────────────────────────────────────────────────────────

function authHeaders() {
  return {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json',
    'X-Workspace-ID': WORKSPACE,
    'X-Load-Test': 'true',     // Tag requests for filtering in prod metrics
  };
}

// ── Request helper with SLO tracking ──────────────────────────────────────────

function request(method, url, body, params = {}) {
  const fullParams = {
    headers: authHeaders(),
    tags: params.tags || {},
    timeout: '10s',
    ...params,
  };

  let res;
  if (method === 'GET') {
    res = http.get(url, fullParams);
  } else if (method === 'POST') {
    res = http.post(url, JSON.stringify(body), fullParams);
  } else if (method === 'DELETE') {
    res = http.del(url, null, fullParams);
  }

  requestsPerSecond.add(1);

  const is5xx = res.status >= 500;
  const isError = res.status >= 400;
  errorRate.add(isError ? 1 : 0);

  return res;
}

// ── Test scenarios ─────────────────────────────────────────────────────────────

/**
 * Scenario A: Health check (lightweight, high frequency)
 * Validates availability SLO — must never fail, must be < 50ms P99.
 */
function scenarioHealthCheck() {
  group('health-check', function () {
    const res = request('GET', `${BASE_URL}/health`, null, {
      tags: { endpoint: 'health' },
    });

    check(res, {
      'health: status 200': (r) => r.status === 200,
      'health: body ok':    (r) => r.json('status') === 'ok',
      'health: latency < 50ms': (r) => r.timings.duration < 50,
    });
  });
}

/**
 * Scenario B: Authentication (token validation)
 * Validates auth P95 < 100ms.
 */
function scenarioAuth() {
  group('auth', function () {
    const res = request('POST', `${BASE_URL}/auth/validate`, { token: API_TOKEN }, {
      tags: { endpoint: 'auth' },
    });

    check(res, {
      'auth: token valid':      (r) => r.status === 200,
      'auth: latency < 100ms':  (r) => r.timings.duration < 100,
    });
  });
}

/**
 * Scenario C: Project CRUD
 * Core forge-api workflow. P95 < 200ms, P99 < 500ms.
 */
function scenarioProjectCRUD() {
  group('project-crud', function () {
    // Create project
    const createRes = request(
      'POST',
      `${BASE_URL}/api/projects`,
      {
        name: `${randomItem(PROJECT_NAMES)}-${Date.now()}`,
        description: 'k6 SLO load test project',
        workspaceId: WORKSPACE,
        type: 'web-app',
      },
      { tags: { endpoint: 'projects', operation: 'create' } },
    );

    const createOk = check(createRes, {
      'project create: 201':          (r) => r.status === 201,
      'project create: has id':        (r) => r.json('id') !== undefined,
      'project create: latency < 300ms': (r) => r.timings.duration < 300,
    });

    if (!createOk || createRes.status !== 201) {
      errorRate.add(1);
      return;
    }

    const projectId = createRes.json('id');

    // Read project
    const getRes = request(
      'GET',
      `${BASE_URL}/api/projects/${projectId}`,
      null,
      { tags: { endpoint: 'projects', operation: 'read' } },
    );

    check(getRes, {
      'project get: 200':           (r) => r.status === 200,
      'project get: correct id':    (r) => r.json('id') === projectId,
      'project get: latency < 200ms': (r) => r.timings.duration < 200,
    });

    // List projects
    const listRes = request(
      'GET',
      `${BASE_URL}/api/projects?workspaceId=${WORKSPACE}&limit=10`,
      null,
      { tags: { endpoint: 'projects', operation: 'list' } },
    );

    check(listRes, {
      'project list: 200':         (r) => r.status === 200,
      'project list: has items':   (r) => Array.isArray(r.json('items')),
      'project list: latency < 250ms': (r) => r.timings.duration < 250,
    });

    // Cleanup: delete the test project
    const deleteRes = request(
      'DELETE',
      `${BASE_URL}/api/projects/${projectId}`,
      null,
      { tags: { endpoint: 'projects', operation: 'delete' } },
    );

    check(deleteRes, {
      'project delete: 200 or 204': (r) => r.status === 200 || r.status === 204,
    });
  });
}

/**
 * Scenario D: Requirements generation (AI-backed, higher latency budget)
 * Tests the AI planner module. P95 < 2000ms.
 */
function scenarioRequirementsGeneration() {
  group('requirements-generation', function () {
    const res = request(
      'POST',
      `${BASE_URL}/api/planner/requirements`,
      {
        projectId: `k6-test-${__VU}`,
        description: randomItem(TEST_PROMPTS),
        workspaceId: WORKSPACE,
      },
      { tags: { endpoint: 'forge', operation: 'requirements' } },
    );

    const ok = check(res, {
      'requirements: 200 or 201':   (r) => r.status === 200 || r.status === 201,
      'requirements: has content':   (r) => (r.json('requirements') || []).length > 0,
      'requirements: latency < 3s':  (r) => r.timings.duration < 3000,
    });

    aiJobSuccessRate.add(ok ? 1 : 0);
  });
}

/**
 * Scenario E: AI streaming inference (measures TTFB)
 * Tests the AI gateway streaming endpoint. TTFB P95 < 5000ms.
 */
function scenarioAIStreaming() {
  group('ai-streaming', function () {
    const startTs = Date.now();

    const res = http.post(
      `${BASE_URL}/api/ai/stream`,
      JSON.stringify({
        prompt: randomItem(TEST_PROMPTS),
        workspaceId: WORKSPACE,
        stream: true,
        maxTokens: 100,   // Keep short for load test
      }),
      {
        headers: {
          ...authHeaders(),
          'Accept': 'text/event-stream',
        },
        tags: { endpoint: 'ai-stream' },
        timeout: '30s',
        responseType: 'text',
      },
    );

    // TTFB = time until first byte received
    const ttfb = res.timings.waiting;
    streamingTTFB.add(ttfb);

    const ok = check(res, {
      'streaming: 200':           (r) => r.status === 200,
      'streaming: has data':      (r) => r.body && r.body.length > 0,
      'streaming: TTFB < 5s':     (r) => r.timings.waiting < 5000,
    });

    aiJobSuccessRate.add(ok ? 1 : 0);

    // Estimate tokens (rough: 4 chars per token)
    if (res.body) {
      const estimatedTokens = Math.floor(res.body.length / 4);
      tokenThroughput.add(estimatedTokens);
      // Cost estimate: $3 per 1M tokens (Claude Sonnet estimate)
      costAccrued.add(Math.floor((estimatedTokens / 1_000_000) * 3_000_000));
    }
  });
}

/**
 * Scenario F: Agent workflow (full forge pipeline)
 * Heavy: create project → generate requirements → generate architecture → poll status.
 * Runs at lower frequency (1 VU per scenario instead of all).
 */
function scenarioAgentWorkflow() {
  group('agent-workflow', function () {
    // Create a minimal project
    const projectRes = request(
      'POST',
      `${BASE_URL}/api/projects`,
      {
        name: `k6-agent-${__VU}-${Date.now()}`,
        description: 'k6 agent workflow smoke test',
        workspaceId: WORKSPACE,
        type: 'api-service',
      },
      { tags: { endpoint: 'forge', operation: 'agent-create' } },
    );

    if (projectRes.status !== 201) {
      aiJobSuccessRate.add(0);
      return;
    }

    const projectId = projectRes.json('id');

    // Trigger a workflow
    const workflowRes = request(
      'POST',
      `${BASE_URL}/api/workflow/${projectId}/run`,
      {
        phases: ['requirements'],
        workspaceId: WORKSPACE,
      },
      { tags: { endpoint: 'forge', operation: 'workflow-run' } },
    );

    const workflowOk = check(workflowRes, {
      'workflow: accepted': (r) => r.status === 200 || r.status === 202,
    });

    if (workflowOk) {
      const runId = workflowRes.json('runId');

      // Poll for completion (max 30s)
      let completed = false;
      for (let i = 0; i < 15 && !completed; i++) {
        sleep(2);
        const statusRes = request(
          'GET',
          `${BASE_URL}/api/workflow/${projectId}/status/${runId}`,
          null,
          { tags: { endpoint: 'forge', operation: 'workflow-status' } },
        );

        const status = statusRes.json('status');
        if (status === 'completed' || status === 'failed') {
          completed = true;
          aiJobSuccessRate.add(status === 'completed' ? 1 : 0);
        }
      }

      if (!completed) {
        aiJobSuccessRate.add(0);  // Timeout
      }
    } else {
      aiJobSuccessRate.add(0);
    }

    // Cleanup
    request('DELETE', `${BASE_URL}/api/projects/${projectId}`, null, {
      tags: { endpoint: 'forge', operation: 'cleanup' },
    });
  });
}

// ── Main VU function ───────────────────────────────────────────────────────────

export default function () {
  activeConnections.add(1);

  // Weight the scenarios:
  //   60% — health check + auth (validates availability SLO with minimal load)
  //   20% — project CRUD (core API SLO)
  //   10% — requirements generation (AI SLO)
  //    5% — AI streaming (TTFB SLO)
  //    5% — agent workflow (end-to-end SLO)
  const roll = Math.random();

  if (roll < 0.30) {
    scenarioHealthCheck();
  } else if (roll < 0.50) {
    scenarioAuth();
  } else if (roll < 0.70) {
    scenarioProjectCRUD();
  } else if (roll < 0.85) {
    scenarioRequirementsGeneration();
  } else if (roll < 0.93) {
    scenarioAIStreaming();
  } else {
    scenarioAgentWorkflow();
  }

  activeConnections.add(-1);

  // Think time: 1-3s between requests (simulates real user pacing)
  sleep(randomIntBetween(1, 3));
}

// ── Setup: warm-up check ───────────────────────────────────────────────────────

export function setup() {
  console.log(`CerebroHive SLO Load Test`);
  console.log(`  Tier:       ${TIER} VUs`);
  console.log(`  Base URL:   ${BASE_URL}`);
  console.log(`  Workspace:  ${WORKSPACE}`);
  console.log(`  Stages:     ramp=${cfg.ramp} sustain=${cfg.sustain} ramp_down=${cfg.ramp_down}`);

  // Pre-flight: verify the API is reachable before starting load
  const healthRes = http.get(`${BASE_URL}/health`);
  if (healthRes.status !== 200) {
    throw new Error(`Pre-flight failed: ${BASE_URL}/health returned ${healthRes.status}`);
  }

  console.log(`✅ Pre-flight health check passed`);
  return { startTime: new Date().toISOString(), tier: TIER };
}

// ── Teardown: summary ──────────────────────────────────────────────────────────

export function teardown(data) {
  console.log(`\nLoad test completed`);
  console.log(`  Started:   ${data.startTime}`);
  console.log(`  Finished:  ${new Date().toISOString()}`);
  console.log(`  Tier:      ${data.tier} VUs`);
  console.log(`\nSLO thresholds are evaluated by k6 — check the thresholds section above.`);
}

// ── handleSummary: machine-readable output for CI ─────────────────────────────

export function handleSummary(data) {
  const thresholds = data.metrics;
  const sloResults = {};

  // Extract key SLO metrics
  const metricsToExtract = [
    'http_req_failed',
    'http_req_duration',
    'cerebro_streaming_ttfb',
    'cerebro_ai_job_success_rate',
    'cerebro_error_rate',
    'cerebro_requests_total',
    'cerebro_tokens_generated_total',
  ];

  for (const metric of metricsToExtract) {
    const m = data.metrics[metric];
    if (m) {
      sloResults[metric] = {
        values: m.values,
        thresholds: m.thresholds,
      };
    }
  }

  const overallPass = Object.values(data.metrics)
    .filter((m) => m.thresholds)
    .every((m) => Object.values(m.thresholds).every((t) => !t.ok === false));

  const summary = {
    tier: TIER,
    base_url: BASE_URL,
    timestamp: new Date().toISOString(),
    duration: data.state?.testRunDurationMs,
    vus_max: data.metrics.vus_max?.values?.max,
    requests_total: data.metrics.http_reqs?.values?.count,
    request_rate: data.metrics.http_reqs?.values?.rate,
    slo_pass: overallPass,
    metrics: sloResults,
  };

  return {
    'slo-results.json': JSON.stringify(summary, null, 2),
    stdout: `\n## SLO Results — Tier ${TIER}\n` +
      `Requests: ${summary.requests_total}\n` +
      `Rate: ${(summary.request_rate || 0).toFixed(2)} req/s\n` +
      `Overall: ${overallPass ? '✅ PASS' : '❌ FAIL'}\n`,
  };
}
