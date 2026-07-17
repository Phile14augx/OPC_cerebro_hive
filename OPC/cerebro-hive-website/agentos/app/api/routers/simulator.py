from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core import simulator_engine
from app.models.identity import APIKey
from app.security import get_current_api_key

router = APIRouter(prefix="/simulator", tags=["simulator"])


class SimulateRequest(BaseModel):
    arrival_rate_per_hour: float
    num_agents: int
    mean_service_minutes: float
    duration_hours: float = 8.0
    trials: int = 200
    seed: int = 42


class SimulateResponse(BaseModel):
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


@router.post("/run", response_model=SimulateResponse)
def run(payload: SimulateRequest, _key: APIKey = Depends(get_current_api_key)) -> simulator_engine.SimulationResult:
    try:
        return simulator_engine.run_simulation(
            arrival_rate_per_hour=payload.arrival_rate_per_hour,
            num_agents=payload.num_agents,
            mean_service_minutes=payload.mean_service_minutes,
            duration_hours=payload.duration_hours,
            trials=payload.trials,
            seed=payload.seed,
        )
    except ValueError as exc:
        raise HTTPException(400, str(exc))
