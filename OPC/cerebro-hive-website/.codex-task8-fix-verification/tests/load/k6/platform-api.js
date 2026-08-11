/**
 * k6 load test — platform-api
 *
 * Scenarios:
 *   baseline   — 50 VUs sustained for 5 minutes (smoke → steady state)
 *   stress     — ramp to 500 VUs, hold, then ramp down
 *   spike      — sudden burst to 1000 VUs for 30 seconds
 *   soak       — 100 VUs for 2 hours (memory leak detection)
 *
 * Run: k6 run --env ENV=staging tests/load/k6/platform-api.js
 */

import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";
import { randomItem, randomIntBetween } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

// ── Custom metrics ─────────────────────────────────────────────────────────────
const errorRate      = new Rate("cerebro_error_rate");
const authLatency    = new Trend("cerebro_auth_latency_ms");
const workflowLatency = new Trend("cerebro_workflow_latency_ms");
const agentLatency   = new Trend("cerebro_agent_latency_ms");
const apiErrors      = new Counter("cerebro_api_errors_total");

// ── Config ────────────────────────────────────────────────────────────────────
const ENV         = __ENV.ENV       ?? "staging";
const BASE_URL    = __ENV.BASE_URL  ?? `https://api-${ENV}.cerebro-hive.io`;
const API_TOKEN   = __ENV.API_TOKEN ?? "";  // Set via CI secret

const SCENARIOS = __ENV.SCENARIO ?? "baseline";

// ── Scenarios ──────────────────────────────────────────────────────────────────
export const options = {
  scenarios: {
    baseline: {
      executor:           "constant-vus",
      vus:                50,
      duration:           "5m",
      startTime:          "0s",
      gracefulStop:       "30s",
      tags:               { scenario: "baseline" },
    },
    stress: {
      executor:           "ramping-vus",
      startVUs:           0,
      stages: [
        { duration: "2m",  target: 100  },
        { duration: "5m",  target: 300  },
        { duration: "5m",  target: 500  },
        { duration: "2m",  target: 300  },
        { duration: "2m",  target: 0    },
      ],
      gracefulRampDown:   "30s",
      tags:               { scenario: "stress" },
    },
    spike: {
      executor:           "ramping-arrival-rate",
      startRate:          10,
      timeUnit:           "1s",
      preAllocatedVUs:    200,
      maxVUs:             1000,
      stages: [
        { duration: "10s", target: 10   },
        { duration: "30s", target: 500  },  // Spike
        { duration: "30s", target: 10   },  // Recovery
      ],
      tags:               { scenario: "spike" },
    },
    soak: {
      executor:           "constant-vus",
      vus:                100,
      duration:           "2h",
      tags:               { scenario: "soak" },
    },
  },

  thresholds: {
    // SLO: 99.9% success
    cerebro_error_rate:              ["rate<0.001"],
    // P95 latency under 500ms
    http_req_duration:               ["p(95)<500", "p(99)<2000"],
    // Auth endpoint must be fast
    cerebro_auth_latency_ms:         ["p(95)<200"],
    // Workflow endpoints under 1s
    cerebro_workflow_latency_ms:     ["p(95)<1000"],
    // No more than 1% of checks fail
    checks:                          ["rate>0.99"],
  },

  // Graceful stop
  gracefulStop:   "60s",
  noConnectionReuse: false,
  userAgent:       "k6-cerebro-load-test/1.0",
};

// ── Test data ─────────────────────────────────────────────────────────────────
const TEST_ORG_IDS = [
  "org_load_test_01",
  "org_load_test_02",
  "org_load_test_03",
];

// ── Default headers ───────────────────────────────────────────────────────────
function headers(extra = {}) {
  return {
    "Content-Type":   "application/json",
    "Authorization":  `Bearer ${API_TOKEN}`,
    "X-Trace-ID":     `k6-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ...extra,
  };
}

// ── Scenarios ─────────────────────────────────────────────────────────────────

export default function () {
  const orgId = randomItem(TEST_ORG_IDS);

  // Distribute traffic across user journeys
  const roll = Math.random();
  if (roll < 0.30)      workflowJourney(orgId);
  else if (roll < 0.55) agentJourney(orgId);
  else if (roll < 0.75) knowledgeJourney(orgId);
  else if (roll < 0.90) authJourney();
  else                   billingJourney(orgId);

  sleep(randomIntBetween(1, 3));
}

// ── Auth journey ──────────────────────────────────────────────────────────────
function authJourney() {
  group("auth", () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/v1/auth/me`, { headers: headers() });
    authLatency.add(Date.now() - start);

    const ok = check(res, {
      "auth me 200":         (r) => r.status === 200,
      "auth has userId":     (r) => !!JSON.parse(r.body).id,
    });

    if (!ok) {
      errorRate.add(1);
      apiErrors.add(1, { endpoint: "/v1/auth/me" });
    } else {
      errorRate.add(0);
    }
  });
}

// ── Workflow journey ──────────────────────────────────────────────────────────
function workflowJourney(orgId) {
  group("workflows", () => {
    // List workflows
    let start = Date.now();
    let res = http.get(
      `${BASE_URL}/v1/workflows?page=1&limit=10`,
      { headers: headers(), tags: { endpoint: "list_workflows" } },
    );
    workflowLatency.add(Date.now() - start);

    const listOk = check(res, {
      "list workflows 200":  (r) => r.status === 200,
      "has items array":     (r) => Array.isArray(JSON.parse(r.body).items),
    });
    if (!listOk) { errorRate.add(1); apiErrors.add(1, { endpoint: "list_workflows" }); return; }
    errorRate.add(0);

    // Create a workflow
    const body = JSON.stringify({
      name:       `Load Test Workflow ${Date.now()}`,
      description: "k6 load test workflow",
      definition: {
        steps: [
          { id: "s1", type: "ai_prompt", name: "Generate", config: { model: "claude-haiku-4-5-20251001", prompt: "Say hello" } },
        ],
      },
      tags: ["load-test"],
    });

    start = Date.now();
    res = http.post(`${BASE_URL}/v1/workflows`, body, {
      headers: headers(),
      tags:    { endpoint: "create_workflow" },
    });
    workflowLatency.add(Date.now() - start);

    const createOk = check(res, {
      "create workflow 201": (r) => r.status === 201,
      "has workflow id":     (r) => !!JSON.parse(r.body).id,
    });
    if (!createOk) { errorRate.add(1); apiErrors.add(1, { endpoint: "create_workflow" }); return; }
    errorRate.add(0);

    const wfId = JSON.parse(res.body).id;

    // Get single workflow
    start = Date.now();
    res = http.get(`${BASE_URL}/v1/workflows/${wfId}`, {
      headers: headers(),
      tags:    { endpoint: "get_workflow" },
    });
    workflowLatency.add(Date.now() - start);
    check(res, { "get workflow 200": (r) => r.status === 200 });

    sleep(0.5);
  });
}

// ── Agent journey ─────────────────────────────────────────────────────────────
function agentJourney(orgId) {
  group("agents", () => {
    let start = Date.now();
    let res = http.get(`${BASE_URL}/v1/agents?page=1&limit=10`, {
      headers: headers(),
      tags:    { endpoint: "list_agents" },
    });
    agentLatency.add(Date.now() - start);

    const ok = check(res, {
      "list agents 200": (r) => r.status === 200,
    });
    if (!ok) { errorRate.add(1); return; }
    errorRate.add(0);

    const agents = JSON.parse(res.body).items;
    if (!agents?.length) return;

    const agent = randomItem(agents);
    start = Date.now();
    res = http.get(`${BASE_URL}/v1/agents/${agent.id}/runs?limit=5`, {
      headers: headers(),
      tags:    { endpoint: "list_agent_runs" },
    });
    agentLatency.add(Date.now() - start);
    check(res, { "list runs 200": (r) => r.status === 200 });
  });
}

// ── Knowledge journey ─────────────────────────────────────────────────────────
function knowledgeJourney(orgId) {
  group("knowledge", () => {
    const res = http.get(`${BASE_URL}/v1/knowledge/collections`, {
      headers: headers(),
      tags:    { endpoint: "list_collections" },
    });
    const ok = check(res, {
      "list collections 200": (r) => r.status === 200,
    });
    errorRate.add(ok ? 0 : 1);
  });
}

// ── Billing journey ───────────────────────────────────────────────────────────
function billingJourney(orgId) {
  group("billing", () => {
    const res = http.get(`${BASE_URL}/v1/ai/usage?from=2026-07-01T00:00:00Z`, {
      headers: headers(),
      tags:    { endpoint: "ai_usage" },
    });
    const ok = check(res, {
      "ai usage 200": (r) => r.status === 200,
    });
    errorRate.add(ok ? 0 : 1);
  });
}

// ── Health check (setup) ──────────────────────────────────────────────────────
export function setup() {
  const res = http.get(`${BASE_URL}/health/ready`);
  const ok  = check(res, { "service ready": (r) => r.status === 200 });
  if (!ok) {
    throw new Error(`Service not ready: ${res.status} ${res.body}`);
  }
  console.log(`[k6] Load testing ${BASE_URL} (ENV=${ENV})`);
  return { baseUrl: BASE_URL };
}

export function teardown(data) {
  console.log(`[k6] Load test complete against ${data.baseUrl}`);
}
