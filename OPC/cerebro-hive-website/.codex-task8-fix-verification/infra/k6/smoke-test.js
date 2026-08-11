// ──────────────────────────────────────────────────────────────────────────────
// CerebroHive — k6 Smoke + Load Tests
// Validates basic service health under load before promoting to production.
// ──────────────────────────────────────────────────────────────────────────────

import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const BASE_URL = __ENV.K6_BASE_URL || "https://staging.cerebrohive.com";
const API_TOKEN = __ENV.K6_API_TOKEN || "";

// Custom metrics
const errorRate = new Rate("errors");
const aiResponseTime = new Trend("ai_response_time_ms");

export const options = {
  stages: [
    { duration: "30s", target: 5 },   // Ramp up
    { duration: "1m",  target: 10 },  // Sustained load
    { duration: "30s", target: 20 },  // Spike
    { duration: "30s", target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration:      ["p(95)<2000"],   // 95% of requests < 2s
    http_req_failed:        ["rate<0.01"],    // < 1% errors
    errors:                 ["rate<0.05"],
    ai_response_time_ms:    ["p(90)<10000"],  // AI responses < 10s P90
  },
};

const headers = {
  Authorization: `Bearer ${API_TOKEN}`,
  "Content-Type": "application/json",
};

export default function () {
  // ── Health checks ────────────────────────────────────────────────────────
  group("Health Endpoints", () => {
    const res = http.get(`${BASE_URL}/api/health`, { headers });
    check(res, {
      "studio health: status 200": (r) => r.status === 200,
      "studio health: has status field": (r) =>
        JSON.parse(r.body).status === "ok",
    });
    errorRate.add(res.status !== 200);

    const apiRes = http.get(`${BASE_URL.replace("app.", "api.")}/health`, {
      headers,
    });
    check(apiRes, {
      "platform-api health: status 200": (r) => r.status === 200,
    });
    errorRate.add(apiRes.status !== 200);
  });

  sleep(1);

  // ── Authentication ────────────────────────────────────────────────────────
  group("Auth Endpoints", () => {
    const res = http.get(`${BASE_URL}/api/auth/session`, { headers });
    check(res, {
      "session endpoint: not 500": (r) => r.status !== 500,
    });
  });

  sleep(1);

  // ── AI Gateway ────────────────────────────────────────────────────────────
  group("AI Gateway", () => {
    const start = Date.now();
    const res = http.post(
      `${BASE_URL.replace("app.", "api.")}/ai/chat`,
      JSON.stringify({
        messages: [{ role: "user", content: "Hello, what can you do?" }],
        model: "claude-haiku-4-5-20251001",   // Fast model for smoke tests
        stream: false,
        maxTokens: 100,
      }),
      { headers, timeout: "30s" }
    );
    const elapsed = Date.now() - start;

    check(res, {
      "AI gateway: status 200 or 201": (r) =>
        r.status === 200 || r.status === 201,
      "AI gateway: has response": (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.content !== undefined || body.message !== undefined;
        } catch {
          return false;
        }
      },
    });

    aiResponseTime.add(elapsed);
    errorRate.add(res.status >= 500);
  });

  sleep(2);
}

export function handleSummary(data) {
  return {
    "k6-summary.json": JSON.stringify(data),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}

function textSummary(data, opts) {
  const { metrics } = data;
  const lines = [
    "CerebroHive Load Test Summary",
    "================================",
    `HTTP Requests: ${metrics.http_reqs?.values.count || 0}`,
    `Error Rate:    ${((metrics.errors?.values.rate || 0) * 100).toFixed(2)}%`,
    `P95 Latency:   ${(metrics.http_req_duration?.values["p(95)"] || 0).toFixed(0)}ms`,
    `AI P90:        ${(metrics.ai_response_time_ms?.values["p(90)"] || 0).toFixed(0)}ms`,
  ];
  return lines.join("\n");
}
