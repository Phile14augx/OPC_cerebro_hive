from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from app.core import simulator_engine
from app.models.identity import APIKey
from app.security import get_current_api_key

router = APIRouter(prefix="/simulator", tags=["simulator"])

# num_agents * duration_hours * trials roughly bounds the simulation's inner
# work. These caps keep a single request well under the global request
# timeout (RequestGuardMiddleware) instead of relying on the timeout alone to
# cut off a pathological Monte Carlo run.
class SimulateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    arrival_rate_per_hour: float = Field(gt=0, le=100_000)
    num_agents: int = Field(gt=0, le=1000)
    mean_service_minutes: float = Field(gt=0, le=10_000)
    duration_hours: float = Field(default=8.0, gt=0, le=24 * 90)
    trials: int = Field(default=200, gt=0, le=5000)
    seed: int = Field(default=42, ge=0, le=2**31 - 1)


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
