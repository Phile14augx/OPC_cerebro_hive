"""Cortex: the enterprise decision engine — optimization, forecasting, and
recommendation. Two real, exact algorithms (least-squares regression and
0/1 knapsack dynamic programming), not heuristics dressed up as math.

Production swap-in: a real solver (OR-Tools / Gurobi) for optimization at
scale, and a proper time-series model (ARIMA/Prophet) for forecasting with
seasonality — the interfaces here (forecast(), optimize()) are what those
would sit behind.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np


@dataclass
class ForecastResult:
    slope: float
    intercept: float
    r_squared: float
    historical: list[float]
    forecast: list[float]


def forecast(values: list[float], periods_ahead: int = 3) -> ForecastResult:
    """Ordinary least-squares linear regression over an evenly-spaced series.
    Exact, not approximated — same math you'd get from numpy.polyfit or a
    spreadsheet's TREND(). Small-n series are supported (down to 2 points)
    but the caller should treat r_squared as the confidence signal."""
    if len(values) < 2:
        raise ValueError("forecast requires at least 2 data points")

    x = np.arange(len(values), dtype=np.float64)
    y = np.array(values, dtype=np.float64)

    slope, intercept = np.polyfit(x, y, 1)
    predicted = slope * x + intercept
    ss_res = float(np.sum((y - predicted) ** 2))
    ss_tot = float(np.sum((y - y.mean()) ** 2))
    r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 1.0

    future_x = np.arange(len(values), len(values) + periods_ahead, dtype=np.float64)
    future_y = slope * future_x + intercept

    return ForecastResult(
        slope=float(slope),
        intercept=float(intercept),
        r_squared=round(r_squared, 4),
        historical=[round(v, 4) for v in y.tolist()],
        forecast=[round(v, 4) for v in future_y.tolist()],
    )


@dataclass
class KnapsackItem:
    name: str
    cost: int
    value: float


@dataclass
class OptimizeResult:
    selected: list[str] = field(default_factory=list)
    total_cost: int = 0
    total_value: float = 0.0
    excluded: list[str] = field(default_factory=list)


def optimize(items: list[KnapsackItem], budget: int) -> OptimizeResult:
    """Exact 0/1 knapsack via dynamic programming: choose the subset of
    items that maximizes total value without exceeding the budget. This is
    the textbook DP (O(n * budget)), not a greedy approximation — the
    result is provably optimal for the given inputs."""
    if budget < 0:
        raise ValueError("budget must be >= 0")

    n = len(items)
    # dp[i][b] = best value achievable using the first i items with budget b
    dp = [[0.0] * (budget + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        item = items[i - 1]
        for b in range(budget + 1):
            dp[i][b] = dp[i - 1][b]
            if item.cost <= b:
                with_item = dp[i - 1][b - item.cost] + item.value
                if with_item > dp[i][b]:
                    dp[i][b] = with_item

    # Backtrack to find which items were actually selected.
    selected: list[str] = []
    b = budget
    for i in range(n, 0, -1):
        if dp[i][b] != dp[i - 1][b]:
            item = items[i - 1]
            selected.append(item.name)
            b -= item.cost

    selected.reverse()
    selected_set = set(selected)
    total_cost = sum(item.cost for item in items if item.name in selected_set)
    total_value = dp[n][budget]
    excluded = [item.name for item in items if item.name not in selected_set]

    return OptimizeResult(selected=selected, total_cost=total_cost, total_value=round(total_value, 4), excluded=excluded)
