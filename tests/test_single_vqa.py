"""
Tests for RS-VQA, Scene Captioning, and Grounding Models
"""
import pytest
import numpy as np
from backend.models.rs_domain_adapter import RSDomainAdapter
from backend.models.rs_vqa_engine import RSVQAEngine
from backend.models.rs_captioner import RSCaptioner
from backend.models.rs_grounding import RSGroundingEngine
from backend.utils.geotiff_io import read_image_and_metadata
from backend.config import SAMPLE_DATA_DIR

@pytest.fixture
def optical_data():
    path = SAMPLE_DATA_DIR / "single_optical" / "cartosat_optical_scene.tif"
    arr, meta = read_image_and_metadata(path)
    return arr, meta

def test_domain_adapter_landcover(optical_data):
    arr, meta = optical_data
    adapter = RSDomainAdapter()
    lc = adapter.predict_landcover_distribution(arr)
    assert len(lc) > 0
    assert lc[0]["percentage"] > 0
    assert any("water" in item["class"].lower() for item in lc)

def test_vqa_count_and_presence(optical_data):
    arr, meta = optical_data
    vqa = RSVQAEngine()
    # Presence question
    res_pres = vqa.answer_question(arr, "Is there a water body in the image?")
    assert "yes" in res_pres["answer"].lower()
    assert res_pres["confidence"] > 0.8
    
    # Count question
    res_count = vqa.answer_question(arr, "How many airport runways or aircraft are visible?")
    assert "count" in res_count or "bounding_boxes" in res_count

def test_captioner_detailed_output(optical_data):
    arr, meta = optical_data
    captioner = RSCaptioner()
    cap = captioner.generate_caption(arr, metadata=meta)
    assert "caption" in cap
    assert len(cap["land_cover_distribution"]) > 0

def test_grounding_detections(optical_data):
    arr, meta = optical_data
    grounder = RSGroundingEngine()
    g_res = grounder.ground_query(arr, "Highlight the water body")
    assert g_res["task"] == "SINGLE_GROUNDING"
    assert g_res["detections_count"] > 0
    assert "visual_evidence_overlay" in g_res
