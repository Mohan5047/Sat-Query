"""
SatQuery AI - Auditable Execution Tracing Subsystem
Maintains transparent, verifiable logs of task planning, model selection, tool execution, and parameters.
"""
import time
from typing import Dict, Any, List, Optional

class ExecutionTrace:
    """
    Captures auditable workflow steps for every user query.
    Complies with the requirement:
    'provide an auditable execution summary containing the selected task, model/tool names, and key parameters.'
    """
    def __init__(self, session_id: str, query: str):
        self.session_id = session_id
        self.query = query
        self.start_time = time.time()
        self.selected_task: Optional[str] = None
        self.selected_models: List[str] = []
        self.parameters: Dict[str, Any] = {}
        self.steps: List[Dict[str, Any]] = []
        self.end_time: Optional[float] = None
        self.confidence_score: float = 0.0

    def add_step(self, stage: str, tool_name: str, description: str, parameters: Optional[Dict[str, Any]] = None, status: str = "SUCCESS", execution_time_ms: float = 0.0):
        self.steps.append({
            "stage": stage,
            "tool_name": tool_name,
            "description": description,
            "parameters": parameters or {},
            "status": status,
            "execution_time_ms": round(execution_time_ms, 2)
        })

    def finalize(self, selected_task: str, selected_models: List[str], parameters: Dict[str, Any], confidence: float) -> Dict[str, Any]:
        self.end_time = time.time()
        self.selected_task = selected_task
        self.selected_models = selected_models
        self.parameters = parameters
        self.confidence_score = confidence
        
        total_latency_ms = round((self.end_time - self.start_time) * 1000, 2)
        
        return {
            "session_id": self.session_id,
            "query": self.query,
            "selected_task": self.selected_task,
            "selected_models": self.selected_models,
            "key_parameters": self.parameters,
            "total_latency_ms": total_latency_ms,
            "overall_confidence": self.confidence_score,
            "steps": self.steps
        }
