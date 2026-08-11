#!/usr/bin/env python3
"""
HiveSwarm Demo Script
=====================
Submits a natural-language goal to the swarm and streams live progress.

Usage:
  python scripts/demo_swarm.py
  python scripts/demo_swarm.py --goal "Build a REST API for user management"
  python scripts/demo_swarm.py --api http://localhost:8910 --goal "Research LLM benchmarks"

Prerequisites:
  docker compose up swarm-api planner-service agent-runner redis nats
  (add --profile swarm to also start swarm-runtime + temporal)

Environment:
  SWARM_API_URL  defaults to http://localhost:8910
  ANTHROPIC_API_KEY  optional; leave unset for mock mode
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.request
from typing import Any

# ── ANSI colours ─────────────────────────────────────────────────────────────

RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
GREEN = "\033[32m"
CYAN = "\033[36m"
YELLOW = "\033[33m"
RED = "\033[31m"
MAGENTA = "\033[35m"
BLUE = "\033[34m"


def colour(text: str, *codes: str) -> str:
    return "".join(codes) + text + RESET


def hdr(text: str) -> None:
    print(f"\n{colour('━' * 60, DIM)}")
    print(colour(f" {text}", BOLD, CYAN))
    print(colour('━' * 60, DIM))


def ok(text: str) -> None:
    print(colour(f"  ✓ {text}", GREEN))


def info(text: str) -> None:
    print(colour(f"  · {text}", DIM))


def warn(text: str) -> None:
    print(colour(f"  ⚠ {text}", YELLOW))


def err(text: str) -> None:
    print(colour(f"  ✗ {text}", RED))


# ── HTTP helpers ──────────────────────────────────────────────────────────────

def http_post(url: str, payload: dict[str, Any], timeout: float = 30.0) -> dict[str, Any]:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        body = exc.read().decode()
        raise RuntimeError(f"HTTP {exc.code}: {body}") from exc


def http_get(url: str, timeout: float = 10.0) -> dict[str, Any]:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"HTTP {exc.code}") from exc


# ── Demo steps ────────────────────────────────────────────────────────────────

def check_services(api: str) -> None:
    hdr("Checking services")
    services = {
        "swarm-api": f"{api}/health",
        "agent-runner": "http://localhost:8960/health",
        "planner-service": "http://localhost:8920/health",
    }
    all_ok = True
    for name, url in services.items():
        try:
            resp = http_get(url, timeout=3.0)
            status = resp.get("status", "?")
            ok(f"{name}  [{status}]")
        except Exception as exc:
            warn(f"{name}  [{exc}]  — will continue anyway")
            all_ok = False
    if not all_ok:
        warn("Some services unreachable. Ensure docker compose services are running.")


def submit_goal(api: str, goal: str) -> dict[str, Any]:
    hdr("Submitting goal to swarm")
    print(f"  Goal: {colour(goal, BOLD, BLUE)}\n")

    url = f"{api}/api/v1/swarm/goal"
    t0 = time.time()
    resp = http_post(url, {"goal": goal}, timeout=120.0)
    elapsed = time.time() - t0

    ok(f"Run created in {elapsed:.1f}s")
    print(f"\n  {colour('Run ID:', BOLD)}    {resp['runId']}")
    print(f"  {colour('DAG ID:', BOLD)}    {resp['dagId']}")
    print(f"  {colour('Confidence:', BOLD)} {resp.get('plannerConfidence', 0):.0%}")
    print(f"  {colour('Waves:', BOLD)}     {resp.get('totalWaves', '?')}")
    print(f"  {colour('Tasks:', BOLD)}     {len(resp.get('tasks', []))}")

    tasks = resp.get("tasks", [])
    if tasks:
        print(f"\n  {colour('Task plan:', BOLD)}")
        for t in tasks:
            cap = colour(f"[{t['capability']}]", MAGENTA)
            wave = colour(f"wave {t['waveIndex']}", DIM)
            print(f"    {wave}  {cap}  {t['name']}")
            if t.get("objective"):
                info(f"           {t['objective'][:80]}")

    reasoning = resp.get("plannerReasoning", "")
    if reasoning:
        print(f"\n  {colour('Planner reasoning:', BOLD)}")
        for line in reasoning.split(". ")[:3]:
            info(line.strip() + ".")

    return resp


def poll_run(api: str, run_id: str, max_wait: float = 300.0) -> dict[str, Any]:
    hdr("Monitoring run progress")
    url = f"{api}/api/v1/swarm/runs/{run_id}"
    tasks_url = f"{api}/api/v1/swarm/runs/{run_id}/tasks"

    t0 = time.time()
    last_status = ""
    dot_count = 0

    while True:
        elapsed = time.time() - t0
        if elapsed > max_wait:
            warn(f"Timed out after {max_wait:.0f}s — run still in progress")
            break

        try:
            run = http_get(url)
            status = run.get("status", "unknown")

            if status != last_status:
                print(f"\n  Status → {colour(status.upper(), BOLD, _status_colour(status))}")
                last_status = status

            if status in ("completed", "failed", "cancelled"):
                # Print final task results
                try:
                    tasks_resp = http_get(tasks_url)
                    tasks = tasks_resp.get("data", [])
                    if tasks:
                        print(f"\n  {colour('Task results:', BOLD)}")
                        for t in tasks:
                            t_status = t.get("status", "?")
                            cap = colour(f"[{t.get('capability', '?')}]", MAGENTA)
                            status_str = colour(t_status, _status_colour(t_status))
                            print(f"    {cap} {t.get('name', '?'):40s} → {status_str}")
                except Exception:
                    pass

                if status == "completed":
                    ok(f"Run completed in {elapsed:.1f}s")
                elif status == "failed":
                    err(f"Run failed after {elapsed:.1f}s")
                break

            # Print a progress dot every 5 seconds
            time.sleep(2.0)
            dot_count += 1
            if dot_count % 3 == 0:
                print(f"  {colour(f'  [{elapsed:.0f}s] waiting...', DIM)}", end="\r", flush=True)

        except Exception as exc:
            warn(f"Poll error: {exc}")
            time.sleep(3.0)

    return run


def _status_colour(status: str) -> str:
    mapping = {
        "completed": GREEN,
        "running": CYAN,
        "pending": YELLOW,
        "queued": YELLOW,
        "failed": RED,
        "cancelled": RED,
    }
    return mapping.get(status.lower(), RESET)


def print_run_output(api: str, run_id: str) -> None:
    hdr("Run summary")
    try:
        run = http_get(f"{api}/api/v1/swarm/runs/{run_id}")
        print(f"  Status:    {colour(run.get('status', '?').upper(), BOLD)}")
        print(f"  Run ID:    {run_id}")
        if run.get("output"):
            print(f"\n  {colour('Output:', BOLD)}")
            print(json.dumps(run["output"], indent=4).replace("\n", "\n  "))
        meta = run.get("metadata", {})
        if meta:
            print(f"\n  {colour('Metadata:', BOLD)}")
            for k, v in meta.items():
                print(f"    {k}: {v}")
    except Exception as exc:
        warn(f"Could not fetch run summary: {exc}")


# ── Main ──────────────────────────────────────────────────────────────────────

DEFAULT_GOAL = (
    "Research best practices for building a production-grade REST API, "
    "then implement a simple user authentication endpoint in Python with JWT support, "
    "and critically review the implementation for security issues."
)


def main() -> None:
    parser = argparse.ArgumentParser(description="HiveSwarm demo script")
    parser.add_argument(
        "--goal",
        default=DEFAULT_GOAL,
        help="Natural language goal to submit to the swarm",
    )
    parser.add_argument(
        "--api",
        default="http://localhost:8910",
        help="swarm-api base URL (default: http://localhost:8910)",
    )
    parser.add_argument(
        "--no-poll",
        action="store_true",
        help="Submit goal and exit without polling for completion",
    )
    args = parser.parse_args()

    print(colour("\n  HiveSwarm Demo", BOLD, CYAN))
    print(colour("  Enterprise Multi-Agent Operating System\n", DIM))

    api = args.api.rstrip("/")

    try:
        check_services(api)
        run_resp = submit_goal(api, args.goal)
        run_id = run_resp["runId"]

        if args.no_poll:
            print(f"\n  {colour('Run ID:', BOLD)} {run_id}")
            print(f"  Poll: GET {api}/api/v1/swarm/runs/{run_id}")
        else:
            poll_run(api, run_id, max_wait=300.0)
            print_run_output(api, run_id)

        print(colour("\n  Done.\n", BOLD, GREEN))

    except KeyboardInterrupt:
        print(colour("\n  Interrupted.\n", YELLOW))
        sys.exit(1)
    except Exception as exc:
        err(f"Demo failed: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
