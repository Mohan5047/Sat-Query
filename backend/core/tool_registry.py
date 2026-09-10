"""
SatQuery AI - Specialist Remote-Sensing Tool Registry
Maintains registry of domain-adapted remote-sensing specialist models and tools.
"""
from typing import Dict, Any, List, Optional
import numpy as np

from backend.models.rs_domain_adapter import RSDomainAdapter
from backend.models.rs_vqa_engine import RSVQAEngine
from backend.models.rs_captioner import RSCaptioner
from backend.models.rs_grounding import RSGroundingEngine
from backend.models.rs_change_engine import RSChangeEngine
from backend.models.rs_optical_sar_fusion import RSOpticalSARFusionEngine
from backend.utils.geotiff_io import compute_spectral_indices, array_to_base64_png, normalize_to_rgb_uint8

class RSToolRegistry:
    """
    Central tool registry defining capabilities, inputs, and invocation methods for each specialist.
    """
    def __init__(self):
        self.domain_adapter = RSDomainAdapter()
        self.vqa_engine = RSVQAEngine(self.domain_adapter)
        self.captioner = RSCaptioner(self.domain_adapter)
        self.grounding_engine = RSGroundingEngine()
        self.change_engine = RSChangeEngine()
        self.optical_sar_fusion = RSOpticalSARFusionEngine()
        
        self._tools = {
            "rs_domain_adapter": {
                "name": "BigEarthNet Domain Representation Adapter",
                "description": "Multi-band & SAR feature extractor adapted on BigEarthNet representations.",
                "type": "REPRESENTATION_BACKBONE",
                "permitted_params": ["modality", "feature_layer"]
            },
            "rs_vqa_engine": {
                "name": "Remote Sensing VQA Specialist (RSVQA / VRSBench)",
                "description": "Factual, presence, counting, and spatial relationship VQA engine.",
                "type": "VQA",
                "permitted_params": ["query", "modality", "confidence_threshold"]
            },
            "rs_captioner": {
                "name": "Remote Sensing Scene Captioner & Land-Cover Descriptor",
                "description": "Generates structured scene descriptions, land cover breakdown, and spatial summaries.",
                "type": "CAPTIONING",
                "permitted_params": ["modality", "detail_level"]
            },
            "rs_grounding": {
                "name": "Text-Guided Region Grounding & Bounding Locator",
                "description": "Localizes and delineates queried entities with bounding boxes and masks.",
                "type": "GROUNDING",
                "permitted_params": ["query", "target_category", "iou_threshold"]
            },
            "rs_change_engine": {
                "name": "Bi-Temporal Change Engine & CDVQA Specialist",
                "description": "Performs CVA differencing, change heatmap generation, and Change-VQA.",
                "type": "CHANGE_ANALYSIS",
                "permitted_params": ["query", "change_threshold", "temporal_delta"]
            },
            "rs_optical_sar_fusion": {
                "name": "Optical-SAR Cross-Modal Fusion Specialist",
                "description": "Extracts complementary features from co-registered Optical and SAR pairs.",
                "type": "CROSSMODAL_FUSION",
                "permitted_params": ["query", "fusion_weight", "polarization"]
            },
            "spectral_band_analyzer": {
                "name": "Spectral & Radar Band Index Analyzer",
                "description": "Computes NDVI, NDWI, False-Color NIR composites, and SAR dB amplitude.",
                "type": "SPECTRAL_ANALYSIS",
                "permitted_params": ["index_type", "colormap"]
            }
        }

    def get_tool_info(self, tool_id: str) -> Optional[Dict[str, Any]]:
        return self._tools.get(tool_id)

    def list_tools(self) -> List[Dict[str, Any]]:
        return [{"id": k, **v} for k, v in self._tools.items()]
