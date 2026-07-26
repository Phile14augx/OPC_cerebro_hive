
from .base_agent import SystemAgent
from typing import Dict, Any

class ReviewerAgent(SystemAgent):
    def __init__(self):
        super().__init__("Reviewer", ["quality_assurance", "critique"])

    def execute(self, inputs: Dict[str, Any]) -> Dict[str, Any]:
        task_output = inputs.get("task_output", {})
        print(f"[Reviewer] Reviewing output...")
        
        # Simulate review logic - randomly fail or pass for demo
        is_valid = True
        feedback = "Output meets quality standards."
        
        if "error" in str(task_output).lower():
            is_valid = False
            feedback = "Output contains errors and must be replanned."
            
        return {
            "approved": is_valid,
            "feedback": feedback
        }
