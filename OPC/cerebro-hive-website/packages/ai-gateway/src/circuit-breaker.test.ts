import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CircuitBreaker } from "./circuit-breaker";

describe("CircuitBreaker", () => {
  it("starts CLOSED and available", () => {
    const breaker = new CircuitBreaker("openai");
    assert.equal(breaker.currentState, "CLOSED");
    assert.equal(breaker.isAvailable(), true);
  });

  it("opens after the error threshold is reached", () => {
    const breaker = new CircuitBreaker("openai", {
      minRequests: 4,
      errorThreshold: 0.5,
    });
    breaker.recordFailure();
    breaker.recordFailure();
    breaker.recordSuccess();
    breaker.recordFailure();
    assert.equal(breaker.currentState, "OPEN");
    assert.equal(breaker.isAvailable(), false);
  });

  it("closes again after a successful half-open probe", () => {
    const breaker = new CircuitBreaker("openai", {
      minRequests: 1,
      errorThreshold: 0.5,
      resetTimeoutMs: 0,
    });
    breaker.recordFailure();
    assert.equal(breaker.currentState, "OPEN");
    assert.equal(breaker.isAvailable(), true);
    assert.equal(breaker.currentState, "HALF_OPEN");
    breaker.recordSuccess();
    assert.equal(breaker.currentState, "CLOSED");
  });
});
