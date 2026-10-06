"""
SatQuery AI - Agentic Vision-Language Controller & Query Router
Orchestrates task classification, specialist model selection, tool execution, and evidence synthesis.
"""
import uuid
import time
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple
import numpy as np

from backend.config import (
    TASK_SINGLE_VQA, TASK_SINGLE_CAPTION, TASK_SINGLE_GROUNDING,
    TASK_BITEMPORAL_CHANGE, TASK_BITEMPORAL_CDVQA, TASK_CROSSMODAL_FUSION,
    TASK_SPECTRAL_ANALYSIS
)
from backend.core.validator import InputValidator
from backend.core.tool_registry import RSToolRegistry
from backend.core.trace import ExecutionTrace
from backend.core.evidence import EvidenceSynthesizer
from backend.utils.geotiff_io import read_image_and_metadata, compute_spectral_indices, array_to_base64_png, normalize_to_rgb_uint8

class SatQueryAgent:
    """
    Agentic remote-sensing query orchestrator.
    Interprets user intent, validates multimodal inputs, schedules specialist tools,
    and returns evidence-grounded answers accompanied by an auditable execution trace.
    """
    def __init__(self):
        self.registry = RSToolRegistry()

    def process_query(
        self,
        query: str,
        image_path_1: str or Path,
        image_path_2: Optional[str or Path] = None,
        pair_mode: Optional[str] = None, # 'BITEMPORAL', 'CROSSMODAL', or None
        advanced_settings: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Main entrypoint for processing user queries over single or paired remote-sensing imagery,
        supporting custom advanced settings (model backbone, thresholds, colormaps, weights).
        """
        session_id = str(uuid.uuid4())[:8]
        trace = ExecutionTrace(session_id, query)
        settings = advanced_settings or {}
        
        # Step 1: Input Validation & Modality Inspection
        t0 = time.time()
        v1 = InputValidator.validate_single_image(image_path_1)
        if not v1["valid"]:
            trace.add_step("VALIDATION", "InputValidator", f"Validation failed: {v1['error']}", status="FAILED")
            return EvidenceSynthesizer.synthesize_response(
                task="ERROR",
                text_answer=f"Input validation error: {v1['error']}",
                confidence=0.0,
                visual_artifacts={},
                execution_trace=trace.finalize("ERROR", [], {}, 0.0)
            )
            
        arr1, meta1 = read_image_and_metadata(image_path_1)
        arr2, meta2 = (None, None)
        is_paired = False
        
        if image_path_2 and Path(image_path_2).exists():
            v2 = InputValidator.validate_single_image(image_path_2)
            if v2["valid"]:
                arr2, meta2 = read_image_and_metadata(image_path_2)
                is_paired = True
                
        trace.add_step(
            "INPUT_VALIDATION",
            "InputValidator",
            f"Validated {'image pair' if is_paired else 'single image'} successfully.",
            parameters={"image1_format": meta1.get("format"), "image1_crs": meta1.get("crs"), "is_paired": is_paired},
            execution_time_ms=(time.time() - t0) * 1000
        )
        
        # Step 2: Query Interpretation & Task Classification (with Forced Tool Override support)
        t1 = time.time()
        forced_tool = settings.get("forced_tool", "AUTO")
        if forced_tool and forced_tool != "AUTO":
            classified_task = forced_tool
            routing_note = f"Task explicitly enforced by Advanced Settings: '{classified_task}'."
        else:
            classified_task = self._classify_query_task(query, is_paired, meta1, meta2, pair_mode)
            routing_note = f"Classified query intent as '{classified_task}'."

        trace.add_step(
            "INTENT_ROUTING",
            "SatQueryAgenticRouter",
            routing_note,
            parameters={"query": query, "target_task": classified_task, "input_mode": pair_mode or ("PAIRED" if is_paired else "SINGLE"), "forced_tool": forced_tool},
            execution_time_ms=(time.time() - t1) * 1000
        )
        
        # Step 3: Tool Scheduling & Specialist Execution with Advanced Settings
        selected_models = []
        key_parameters = {k: v for k, v in settings.items() if v is not None}
        visual_artifacts = {}
        quantitative_metrics = {}
        spatial_grounding = {}
        confidence = 0.95
        text_response = ""
        
        # Base RGB visualizer for Primary Image
        visual_artifacts["primary_rgb_b64"] = array_to_base64_png(normalize_to_rgb_uint8(arr1))
        if is_paired and arr2 is not None:
            visual_artifacts["secondary_rgb_b64"] = array_to_base64_png(normalize_to_rgb_uint8(arr2))
            
        # Calculate Spectral / Radar Indices
        indices = compute_spectral_indices(arr1)
        if "NDVI" in indices:
            # Colorized NDVI
            import matplotlib.cm as cm
            ndvi_norm = (indices["NDVI"] + 1.0) / 2.0
            visual_artifacts["ndvi_b64"] = array_to_base64_png((cm.viridis(ndvi_norm)[:, :, :3] * 255).astype(np.uint8))
        if "FCC_NIR" in indices:
            visual_artifacts["fcc_nir_b64"] = array_to_base64_png(indices["FCC_NIR"])
            
        # Parse configurable advanced parameters
        change_p = float(settings.get("change_percentile", 80.0))
        change_cmap = str(settings.get("change_colormap", "inferno"))
        opt_w = float(settings.get("optical_weight", 0.6))
        sar_w = float(settings.get("sar_weight", 0.4))
        box_col = str(settings.get("box_color", "gold"))
        response_style = str(settings.get("response_style", "technical_scientific"))

        # ROUTE 1: BITEMPORAL CHANGE UNDERSTANDING & CDVQA
        if classified_task in [TASK_BITEMPORAL_CHANGE, TASK_BITEMPORAL_CDVQA]:
            if not is_paired or arr2 is None:
                text_response = "Change detection requires a bi-temporal image pair (T1 pre-event and T2 post-event). Please provide both dates."
                confidence = 0.5
            else:
                t_exec = time.time()
                selected_models.append("RSChangeEngine")
                key_parameters.update({
                    "change_metric": "Change Vector Analysis (CVA)",
                    "threshold_percentile": change_p,
                    "colormap": change_cmap
                })
                
                change_res = self.registry.change_engine.analyze_change(
                    arr1, arr2, query=query, metadata=meta1,
                    change_percentile=change_p, colormap=change_cmap
                )
                
                visual_artifacts["change_heatmap_b64"] = change_res["heatmap_b64"]
                visual_artifacts["change_mask_b64"] = change_res["change_mask_overlay_b64"]
                quantitative_metrics["change_percentage"] = change_res["change_percentage"]
                quantitative_metrics["changed_pixels"] = change_res["changed_pixels"]
                quantitative_metrics["semantics"] = change_res["semantic_change_analysis"]
                
                if change_res.get("cdvqa_result"):
                    text_response = change_res["cdvqa_result"]["answer"]
                    confidence = change_res["cdvqa_result"]["confidence"]
                else:
                    text_response = change_res["summary"]
                    confidence = 0.94
                    
                trace.add_step(
                    "SPECIALIST_EXECUTION",
                    "RSChangeEngine",
                    f"Executed multi-temporal change differencing (CVA p={change_p}%, cmap={change_cmap}) and CDVQA inference.",
                    parameters=key_parameters,
                    execution_time_ms=(time.time() - t_exec) * 1000
                )
                
        # ROUTE 2: OPTICAL-SAR CROSS-MODAL COMPLEMENTARY FUSION
        elif classified_task == TASK_CROSSMODAL_FUSION:
            if not is_paired or arr2 is None:
                text_response = "Cross-modal analysis requires a co-registered Optical and SAR image pair. Please provide both modalities."
                confidence = 0.5
            else:
                t_exec = time.time()
                selected_models.append("RSOpticalSARFusionEngine")
                key_parameters.update({
                    "fusion_method": "Multi-sensor Feature Fusion (Spectral + Microwave Backscatter)",
                    "optical_weight": opt_w,
                    "sar_weight": sar_w
                })
                
                fusion_res = self.registry.optical_sar_fusion.fuse_and_analyze(
                    arr1, arr2, query=query, metadata=meta1,
                    optical_weight=opt_w, sar_weight=sar_w
                )
                
                visual_artifacts["fused_composite_b64"] = fusion_res["fused_composite_b64"]
                visual_artifacts["thematic_map_b64"] = fusion_res["thematic_map_b64"]
                quantitative_metrics["land_cover_percentages"] = fusion_res["metrics"]
                quantitative_metrics["complementary_insights"] = fusion_res["complementary_insights"]
                text_response = fusion_res["answer"]
                confidence = fusion_res["confidence"]
                
                trace.add_step(
                    "SPECIALIST_EXECUTION",
                    "RSOpticalSARFusionEngine",
                    f"Executed joint optical-SAR reasoning with custom weights (Opt: {opt_w}, SAR: {sar_w}).",
                    parameters=key_parameters,
                    execution_time_ms=(time.time() - t_exec) * 1000
                )

        # ROUTE 3: TEXT-GUIDED REGION GROUNDING
        elif classified_task == TASK_SINGLE_GROUNDING:
            t_exec = time.time()
            selected_models.append("RSGroundingEngine")
            key_parameters.update({
                "grounding_target": query,
                "box_color": box_col,
                "iou_threshold": float(settings.get("iou_threshold", 0.5))
            })
            
            grounding_res = self.registry.grounding_engine.ground_query(
                arr1, query,
                modality=meta1.get("modality", "OPTICAL_RGB"),
                box_color=box_col
            )
            
            visual_artifacts["visual_evidence_overlay"] = grounding_res["visual_evidence_overlay"]
            visual_artifacts["binary_mask_b64"] = grounding_res["binary_mask_b64"]
            spatial_grounding["detections"] = grounding_res["detections"]
            spatial_grounding["target_entity"] = grounding_res["target_entity"]
            quantitative_metrics["grounded_area_percentage"] = grounding_res["grounded_area_percentage"]
            quantitative_metrics["detections_count"] = grounding_res["detections_count"]
            
            text_response = grounding_res["summary"]
            confidence = grounding_res["confidence"]
            
            trace.add_step(
                "SPECIALIST_EXECUTION",
                "RSGroundingEngine",
                f"Located and grounded '{grounding_res['target_entity']}' with {len(grounding_res['detections'])} bounding bounding regions (color: {box_col}).",
                parameters=key_parameters,
                execution_time_ms=(time.time() - t_exec) * 1000
            )

        # ROUTE 4: SCENE CAPTIONING & DESCRIPTION
        elif classified_task == TASK_SINGLE_CAPTION:
            t_exec = time.time()
            selected_models.append("RSCaptioner")
            key_parameters.update({
                "description_granularity": "Multi-scale land-cover & infrastructure",
                "response_style": response_style
            })
            
            caption_res = self.registry.captioner.generate_caption(arr1, modality=meta1.get("modality", "OPTICAL_RGB"), metadata=meta1)
            
            quantitative_metrics["land_cover_distribution"] = caption_res["land_cover_distribution"]
            text_response = caption_res["caption"]
            confidence = caption_res["confidence"]
            
            trace.add_step(
                "SPECIALIST_EXECUTION",
                "RSCaptioner",
                "Generated structured remote sensing scene description and land-cover breakdown.",
                parameters=key_parameters,
                execution_time_ms=(time.time() - t_exec) * 1000
            )

        # ROUTE 5: REMOTE SENSING VQA (RS-VQA)
        else:
            t_exec = time.time()
            selected_models.append("RSVQAEngine")
            key_parameters.update({
                "vqa_benchmark": "RSVQA/VRSBench Standard",
                "query": query,
                "response_style": response_style
            })
            
            vqa_res = self.registry.vqa_engine.answer_question(arr1, query, modality=meta1.get("modality", "OPTICAL_RGB"), metadata=meta1)
            
            text_response = vqa_res["answer"]
            confidence = vqa_res["confidence"]
            if "evidence_classes" in vqa_res:
                quantitative_metrics["evidence_classes"] = vqa_res["evidence_classes"]
            if "bounding_boxes" in vqa_res:
                spatial_grounding["detections"] = vqa_res["bounding_boxes"]
                
            trace.add_step(
                "SPECIALIST_EXECUTION",
                "RSVQAEngine",
                f"Answered remote sensing visual question with confidence {confidence}.",
                parameters=key_parameters,
                execution_time_ms=(time.time() - t_exec) * 1000
            )
            
        # Step 4: Final Evidence Synthesis & Trace Finalization
        execution_trace_data = trace.finalize(classified_task, selected_models, key_parameters, confidence)
        
        return EvidenceSynthesizer.synthesize_response(
            task=classified_task,
            text_answer=text_response,
            confidence=confidence,
            visual_artifacts=visual_artifacts,
            quantitative_metrics=quantitative_metrics,
            spatial_grounding=spatial_grounding,
            execution_trace=execution_trace_data
        )

    def _classify_query_task(
        self,
        query: str,
        is_paired: bool,
        meta1: Dict[str, Any],
        meta2: Optional[Dict[str, Any]],
        pair_mode: Optional[str]
    ) -> str:
        q_lower = query.lower()
        
        # Explicit pair modes take precedence or pair context
        if pair_mode == "CROSSMODAL" or any(kw in q_lower for kw in ["optical and sar", "sar and optical", "cross-modal", "cartosat and risat", "together to identify"]):
            return TASK_CROSSMODAL_FUSION
            
        if pair_mode == "BITEMPORAL" or any(kw in q_lower for kw in ["changed between", "two dates", "increased, decreased", "increased or decreased", "change occur", "change detection"]):
            return TASK_BITEMPORAL_CHANGE
            
        if any(kw in q_lower for kw in ["highlight", "locate", "ground", "bounding box", "find the water", "where is the runway", "pinpoint", "segment"]):
            return TASK_SINGLE_GROUNDING
            
        if any(kw in q_lower for kw in ["describe", "caption", "scene description", "major objects visible", "summarize image", "overview of this image"]):
            return TASK_SINGLE_CAPTION
            
        # Fallback to RS-VQA
        return TASK_SINGLE_VQA
