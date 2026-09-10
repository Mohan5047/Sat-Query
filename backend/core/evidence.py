"""
SatQuery AI - Evidence Synthesis & Confidence Estimator
Binds textual answers with visual grounding artifacts, spatial statistics, and calibrated confidence metrics.
"""
from typing import Dict, Any, List, Optional
import numpy as np

class EvidenceSynthesizer:
    """
    Synthesizes multi-source outputs into an evidence-grounded response.
    """
    @staticmethod
    def synthesize_response(
        task: str,
        text_answer: str,
        confidence: float,
        visual_artifacts: Dict[str, Any],
        quantitative_metrics: Optional[Dict[str, Any]] = None,
        spatial_grounding: Optional[Dict[str, Any]] = None,
        execution_trace: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Structures the final output payload for the frontend and reporting engine.
        """
        return {
            "status": "success",
            "task": task,
            "text_response": text_answer,
            "confidence": round(float(confidence), 3),
            "confidence_level": "High" if confidence >= 0.9 else ("Moderate" if confidence >= 0.75 else "Low"),
            "visual_artifacts": visual_artifacts,
            "quantitative_metrics": quantitative_metrics or {},
            "spatial_grounding": spatial_grounding or {},
            "execution_trace": execution_trace or {}
        }
