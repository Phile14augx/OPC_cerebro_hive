from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core import cortex_engine
from app.models.identity import APIKey
from app.security import get_current_api_key

router = APIRouter(prefix="/cortex", tags=["cortex"])


class ForecastRequest(BaseModel):
    values: list[float]
    periods_ahead: int = 3


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
    name: str
    cost: int
    value: float


class OptimizeRequest(BaseModel):
    budget: int
    items: list[OptimizeItem]


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
