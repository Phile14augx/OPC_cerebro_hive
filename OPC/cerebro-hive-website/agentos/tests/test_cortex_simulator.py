"""Tests for Cortex (forecast + optimize) and Simulator — verified against
known-correct arithmetic, not just 'did it return 200'."""


def test_cortex_forecast_perfect_linear_series(client, auth_headers):
    # y = 2x + 10 exactly -> regression should recover slope=2, intercept=10, r_squared=1
    resp = client.post(
        "/cortex/forecast",
        json={"values": [10, 12, 14, 16, 18], "periods_ahead": 2},
        headers=auth_headers,
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert abs(body["slope"] - 2.0) < 1e-6
    assert abs(body["intercept"] - 10.0) < 1e-6
    assert abs(body["r_squared"] - 1.0) < 1e-6
    assert body["forecast"] == [20.0, 22.0]


def test_cortex_forecast_requires_two_points(client, auth_headers):
    resp = client.post("/cortex/forecast", json={"values": [5]}, headers=auth_headers)
    assert resp.status_code == 400


def test_cortex_optimize_is_exact_knapsack(client, auth_headers):
    # Classic small knapsack with a brute-force-verified optimal answer:
    # budget 10, items (cost, value): A(6,30) B(3,14) C(4,16) D(2,9).
    # Full enumeration of all 16 subsets under budget 10 gives a true
    # optimum of {A, C}: cost 10, value 46 (beats {A,B}=44, {B,C,D}=39, etc).
    resp = client.post(
        "/cortex/optimize",
        json={
            "budget": 10,
            "items": [
                {"name": "A", "cost": 6, "value": 30},
                {"name": "B", "cost": 3, "value": 14},
                {"name": "C", "cost": 4, "value": 16},
                {"name": "D", "cost": 2, "value": 9},
            ],
        },
        headers=auth_headers,
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["total_value"] == 46.0
    assert set(body["selected"]) == {"A", "C"}
    assert body["total_cost"] == 10


def test_simulator_run_is_reproducible_with_same_seed(client, auth_headers):
    payload = {
        "arrival_rate_per_hour": 20,
        "num_agents": 3,
        "mean_service_minutes": 8,
        "duration_hours": 8,
        "trials": 50,
        "seed": 7,
    }
    resp1 = client.post("/simulator/run", json=payload, headers=auth_headers)
    resp2 = client.post("/simulator/run", json=payload, headers=auth_headers)
    assert resp1.status_code == 200 and resp2.status_code == 200
    assert resp1.json() == resp2.json()  # same seed -> identical result, proving it's deterministic-given-seed


def test_simulator_more_agents_reduces_wait_time(client, auth_headers):
    base = {"arrival_rate_per_hour": 30, "mean_service_minutes": 8, "duration_hours": 8, "trials": 80, "seed": 3}
    understaffed = client.post("/simulator/run", json={**base, "num_agents": 2}, headers=auth_headers).json()
    overstaffed = client.post("/simulator/run", json={**base, "num_agents": 6}, headers=auth_headers).json()
    # A real queueing simulation: adding agents should not make waits worse.
    assert overstaffed["mean_wait_minutes"] <= understaffed["mean_wait_minutes"]


def test_simulator_rejects_bad_params(client, auth_headers):
    resp = client.post(
        "/simulator/run",
        json={"arrival_rate_per_hour": 10, "num_agents": 0, "mean_service_minutes": 5},
        headers=auth_headers,
    )
    assert resp.status_code == 400
