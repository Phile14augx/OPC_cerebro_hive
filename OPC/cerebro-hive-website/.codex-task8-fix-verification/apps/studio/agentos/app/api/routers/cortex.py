from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from app.core import cortex_engine
from app.models.identity import APIKey
from app.security import get_current_api_key

router = APIRouter(prefix="/cortex", tags=["cortex"])


class ForecastRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    values: list[float] = Field(min_length=1, max_length=100_000)
    periods_ahead: int = Field(default=3, gt=0, le=10_000)


class ForecastResponse(BaseModel):
    slope: float
    intercept: float
    r_squared: float
    historical: list[float]
    forecast: list[float]


@router.post("/forecast", response_model=ForecastResponse)
def run_forecast(payload: ForecastRequest, _key: APIKey = Depends(get_current_api_key)) -> cortex_engine.ForecastResult:
    try:
        return cortex_engine.forecast(payload.values, payload.periods_ahead)
    except ValueError as exc:
        raise HTTPException(400, str(exc))


class OptimizeItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=200)
    cost: int = Field(ge=0, le=20_000)
    value: float = Field(ge=0)


# The knapsack DP is O(items * budget) — both capped so a single request can't
# force a multi-minute (or multi-GB) dynamic-programming table.
class OptimizeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    budget: int = Field(ge=0, le=20_000)
    items: list[OptimizeItem] = Field(min_length=1, max_length=200)


class OptimizeResponse(BaseModel):
    selected: list[str]
    total_cost: int
    total_value: float
    excluded: list[str]


@router.post("/optimize", response_model=OptimizeResponse)
def run_optimize(payload: OptimizeRequest, _key: APIKey = Depends(get_current_api_key)) -> cortex_engine.OptimizeResult:
    try:
        items = [cortex_engine.KnapsackItem(name=i.name, cost=i.cost, value=i.value) for i in payload.items]
        return cortex_engine.optimize(items, payload.budget)
    except ValueError as exc:
        raise HTTPException(400, str(exc))
