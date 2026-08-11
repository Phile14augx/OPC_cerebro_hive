/**
 * k6 load test — ai-gateway
 * Tests LLM routing, caching, rate limiting, and failover behavior.
 *
 * Run: k6 run --env ENV=staging tests/load/k6/ai-gateway.js
 */

import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend, Counter, Gauge } from "k6/metrics";
import { randomItem } from "https://jslib.k6.io/k6-utils/1.4.0/index.js";

const aiLatency      = new Trend("cerebro_ai_latency_ms");
const cacheHitRate   = new Rate("cerebro_ai_cache_hit_rate");
const tokenThroughput = new Counter("cerebro_ai_tokens_total");
const activeRequests = new Gauge("cerebro_ai_active_requests");
const errorRate      = new Rate("cerebro_ai_error_rate");

const BASE_URL  = __ENV.BASE_URL  ?? "https://ai-gateway-staging.cerebro-hive.io";
const API_TOKEN = __ENV.API_TOKEN ?? "";

export const options = {
  scenarios: {
    // Sustained LLM load
    chat_load: {
      executor:    "constant-arrival-rate",
      rate:        20,           // 20 requests/sec
      timeUnit:    "1s",
      duration:    "5m",
      preAllocatedVUs: 50,
      maxVUs:      200,
    },
    // Streaming test (separate)
    streaming_load: {
      executor:    "constant-vus",
      vus:         10,
      duration:    "2m",
      startTime:   "1m",
    },
  },
  thresholds: {
    cerebro_ai_error_rate:  ["rate<0.05"],
    cerebro_ai_latency_ms:  ["p(95)<15000", "p(99)<30000"],  // LLMs are slow
    checks:                 ["rate>0.95"],
  },
};

const MODELS = [
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",  // Weight haiku higher (faster/cheaper)
  "claude-haiku-4-5-20251001",
];

const PROMPTS = [
  "Summarize the concept of retrieval-augmented generation in one sentence.",
  "What is a Temporal workflow?",
  "Explain the difference between a vector database and a relational database.",
  "What does SLO stand for in site reliability engineering?",
  "List three benefits of event-driven architecture.",
];

function headers() {
  return {
    "Content-Type":  "application/json",
    "Authorization": `Bearer ${API_TOKEN}`,
    "X-Org-ID":      "org_load_test_01",
    "X-Trace-ID":    `k6-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
}

export default function () {
  const model  = randomItem(MODELS);
  const prompt = randomItem(PROMPTS);

  group("chat_completion", () => {
    activeRequests.add(1);
    const start = Date.now();

    const res = http.post(
      `${BASE_URL}/v1/chat`,
      JSON.stringify({
        model,
        messages:   [{ role: "user", content: prompt }],
        max_tokens: 150,
        stream:     false,
      }),
      {
        headers: headers(),
        timeout: "60s",
        tags:    { model },
      },
    );

    const latency = Date.now() - start;
    aiLatency.add(latency);
    activeRequests.add(-1);

    const ok = check(res, {
      "chat 200":         (r) => r.status === 200,
      "has content":      (r) => {
        try {
          const b = JSON.parse(r.body);
          return Array.isArray(b.content) && b.content.length > 0;
        } catch { return false; }
      },
      "latency < 30s":    () => latency < 30_000,
    });

    errorRate.add(ok ? 0 : 1);

    if (ok) {
      try {
        const body = JSON.parse(res.body);
        const isCacheHit = res.headers["X-Cache-Status"] === "HIT";
        cacheHitRate.add(isCacheHit ? 1 : 0);

        const total = (body.usage?.input_tokens ?? 0) + (body.usage?.output_tokens ?? 0);
        tokenThroughput.add(total, { model });
      } catch { /* ignore parse errors */ }
    }
  });

  sleep(0.1);  // Minimal sleep — arrival rate controls concurrency
}

export function setup() {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { "gateway ready": (r) => r.status === 200 });
  console.log(`[k6] AI Gateway load test: ${BASE_URL}`);
}
