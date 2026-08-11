"""Simulator: a real discrete-event Monte Carlo digital twin of a
multi-server queue (e.g. a support/agent desk) — used for "what if we
staffed N agents instead of M?" analysis. Poisson arrivals + exponential
service times, run across many independent trials with a seeded RNG so
results are reproducible but still genuinely stochastic (re-running with a
different seed gives a different — but statistically consistent —
outcome, exactly like a real simulation should).

Production swap-in: SimPy or a proper discrete-event framework for richer
topologies (routing, priorities, abandonment); the shape here (arrival
process, service process, servers, trial loop) maps directly onto it.
"""

from __future__ import annotations

import random
from dataclasses import dataclass


@dataclass
class SimulationResult:
    trials: int
    arrival_rate_per_hour: float
    num_agents: int
    mean_service_minutes: float
    duration_hours: float
    mean_wait_minutes: float
    p50_wait_minutes: float
    p95_wait_minutes: float
    mean_backlog_at_end: float
    utilization: float
    mean_arrivals_per_trial: float


def _simulate_one_trial(rng: random.Random, arrival_rate_per_hour: float, num_agents: int, mean_service_minutes: float, duration_minutes: float) -> tuple[float, int, float, int]:
    """One independent run: returns (mean_wait_minutes, backlog_at_end, busy_minutes, arrival_count)."""
    mean_interarrival = 60.0 / arrival_rate_per_hour if arrival_rate_per_hour > 0 else float("inf")

    arrivals: list[float] = []
    clock = 0.0
    while mean_interarrival < float("inf"):
        clock += rng.expovariate(1.0 / mean_interarrival)
        if clock > duration_minutes:
            break
        arrivals.append(clock)

    agent_free_at = [0.0] * num_agents
    waits: list[float] = []
    busy_minutes = 0.0

    for arrival in arrivals:
        idx = min(range(num_agents), key=lambda i: agent_free_at[i])
        start = max(arrival, agent_free_at[idx])
        waits.append(start - arrival)
        service = rng.expovariate(1.0 / mean_service_minutes)
        agent_free_at[idx] = start + service
        busy_minutes += service

    backlog_at_end = sum(1 for free_at in agent_free_at if free_at > duration_minutes)
    mean_wait = sum(waits) / len(waits) if waits else 0.0
    return mean_wait, backlog_at_end, busy_minutes, len(arrivals)


def run_simulation(
    arrival_rate_per_hour: float,
    num_agents: int,
    mean_service_minutes: float,
    duration_hours: float = 8.0,
    trials: int = 200,
    seed: int = 42,
) -> SimulationResult:
    if num_agents < 1:
        raise ValueError("num_agents must be >= 1")
    if arrival_rate_per_hour < 0 or mean_service_minutes <= 0 or duration_hours <= 0:
        raise ValueError("arrival_rate_per_hour, mean_service_minutes, duration_hours must be positive")
    if trials < 1:
        raise ValueError("trials must be >= 1")

    rng = random.Random(seed)
    duration_minutes = duration_hours * 60.0

    trial_waits: list[float] = []
    trial_backlogs: list[int] = []
    trial_busy: list[float] = []
    trial_arrivals: list[int] = []

    for _ in range(trials):
        mean_wait, backlog, busy_minutes, arrival_count = _simulate_one_trial(
            rng, arrival_rate_per_hour, num_agents, mean_service_minutes, duration_minutes
        )
        trial_waits.append(mean_wait)
        trial_backlogs.append(backlog)
        trial_busy.append(busy_minutes)
        trial_arrivals.append(arrival_count)

    sorted_waits = sorted(trial_waits)

    def percentile(sorted_data: list[float], p: float) -> float:
        if not sorted_data:
            return 0.0
        idx = min(len(sorted_data) - 1, max(0, int(round(p * (len(sorted_data) - 1)))))
        return sorted_data[idx]

    utilization = sum(trial_busy) / (trials * num_agents * duration_minutes)

    return SimulationResult(
        trials=trials,
        arrival_rate_per_hour=arrival_rate_per_hour,
        num_agents=num_agents,
        mean_service_minutes=mean_service_minutes,
        duration_hours=duration_hours,
        mean_wait_minutes=round(sum(trial_waits) / trials, 3),
        p50_wait_minutes=round(percentile(sorted_waits, 0.5), 3),
        p95_wait_minutes=round(percentile(sorted_waits, 0.95), 3),
        mean_backlog_at_end=round(sum(trial_backlogs) / trials, 3),
        utilization=round(min(utilization, 1.0), 4),
        mean_arrivals_per_trial=round(sum(trial_arrivals) / trials, 2),
    )
