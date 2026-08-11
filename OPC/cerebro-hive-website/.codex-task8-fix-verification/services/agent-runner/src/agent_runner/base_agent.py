"""BaseHiveAgent — implements plan → execute → observe → reflect lifecycle."""
from __future__ import annotations

import time
from abc import ABC, abstractmethod
from typing import Any, Callable

import structlog

log = structlog.get_logger(__name__)


class ExecuteRequest:
    """Payload received from swarm-runtime's worker pool."""
    def __init__(self, data: dict[str, Any]) -> None:
        self.task_id: str = data.get("taskId", "")
        self.run_id: str = data.get("runId", "")
        self.capability: str = data.get("capability", "")
        self.priority: str = data.get("priority", "normal")
        # The "input" dict contains objective + any task-specific fields
        raw_input: dict[str, Any] = data.get("input") or {}
        self.objective: str = raw_input.get("objective") or data.get("objective", "")
        self.input: dict[str, Any] = raw_input
        self.name: str = raw_input.get("name", self.capability + " task")


class ExecuteResponse:
    """Response sent back to the worker pool dispatcher."""
    def __init__(
        self,
        success: bool,
        output: dict[str, Any],
        error: str = "",
        tokens_used: int = 0,
        cost_usd: float = 0.0,
    ) -> None:
        self.success = success
        self.output = output
        self.error = error
        self.tokens_used = tokens_used
        self.cost_usd = cost_usd

    def to_dict(self) -> dict[str, Any]:
        return {
            "success": self.success,
            "output": self.output,
            "error": self.error,
            "tokensUsed": self.tokens_used,
            "costUsd": self.cost_usd,
        }


class BaseHiveAgent(ABC):
    """
    Base class for all HiveSwarm agents.

    Lifecycle:
      plan()     → produce a structured plan for the objective
      execute()  → carry out the plan using LLM + tools
      observe()  → evaluate quality and correctness of the output
      reflect()  → capture learnings for future improvement
    """

    capability: str  # e.g. "Planning", "Critique", "Coding", "Research"
    name: str        # human-readable name

    def __init__(self, llm: Callable[[str, str], str]) -> None:
        self._llm = llm
        self.log = structlog.get_logger(self.__class__.__name__)

    def run(self, req: ExecuteRequest) -> ExecuteResponse:
        """Execute the full agent lifecycle for a task request."""
        t0 = time.time()
        self.log.info(
            "agent.run.start",
            task_id=req.task_id,
            objective=req.objective[:120] if req.objective else "",
        )
        try:
            plan_output = self.plan(req)
            exec_output = self.execute(req, plan_output)
            observation = self.observe(req, exec_output)
            reflection = self.reflect(req, exec_output, observation)

            output = {
                "plan": plan_output,
                "result": exec_output,
                "observation": observation,
                "reflection": reflection,
                "agentName": self.name,
                "capability": self.capability,
                "durationMs": int((time.time() - t0) * 1000),
            }
            self.log.info("agent.run.done", task_id=req.task_id, success=True)
            return ExecuteResponse(success=True, output=output)

        except Exception as exc:
            self.log.exception("agent.run.error", task_id=req.task_id, error=str(exc))
            return ExecuteResponse(
                success=False,
                output={},
                error=str(exc),
            )

    def _call_llm(self, system: str, user: str) -> str:
        """Call the configured LLM with system + user prompt."""
        return self._llm(system, user)

    @abstractmethod
    def plan(self, req: ExecuteRequest) -> dict[str, Any]:
        """
        Produce a structured plan for the given objective.
        Returns a dict that will be passed to execute().
        """
        ...

    @abstractmethod
    def execute(self, req: ExecuteRequest, plan: dict[str, Any]) -> dict[str, Any]:
        """
        Carry out the plan. Call LLM, use tools, produce output.
        Returns the primary result dict.
        """
        ...

    def observe(self, req: ExecuteRequest, result: dict[str, Any]) -> dict[str, Any]:
        """
        Evaluate the output quality.
        Default implementation checks presence of expected keys.
        Override in subclasses for richer evaluation.
        """
        has_result = bool(result)
        return {
            "hasOutput": has_result,
            "qualityScore": 0.8 if has_result else 0.0,
            "notes": "Output produced successfully." if has_result else "No output generated.",
        }

    def reflect(
        self,
        req: ExecuteRequest,
        result: dict[str, Any],
        observation: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Capture learnings for future optimization.
        Default: just record what happened.
        """
        return {
            "objectiveClarity": "clear",
            "executionStrategy": "llm_direct",
            "qualityScore": observation.get("qualityScore", 0.0),
            "suggestions": [],
        }
