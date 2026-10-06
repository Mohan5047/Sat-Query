"""
Tests for SatQuery AI Agentic Controller & Query Router
"""
import pytest
from pathlib import Path
from backend.config import SAMPLE_DATA_DIR
from backend.core.agent import SatQueryAgent

@pytest.fixture
def agent():
    return SatQueryAgent()

@pytest.fixture
def sample_paths():
    return {
        "optical": SAMPLE_DATA_DIR / "single_optical" / "cartosat_optical_scene.tif",
        "sar": SAMPLE_DATA_DIR / "single_sar" / "risat_sar_backscatter.tif",
        "t1": SAMPLE_DATA_DIR / "bitemporal_pairs" / "urban_change_2021_t1.tif",
        "t2": SAMPLE_DATA_DIR / "bitemporal_pairs" / "urban_change_2024_t2.tif",
        "cross_opt": SAMPLE_DATA_DIR / "optical_sar_pairs" / "cartosat2s_optical_coreg.tif",
        "cross_sar": SAMPLE_DATA_DIR / "optical_sar_pairs" / "risat1a_sar_coreg.tif",
    }

def test_single_caption_query(agent, sample_paths):
    query = "Describe the land-cover and major objects visible in this image."
    res = agent.process_query(query, sample_paths["optical"])
    assert res["status"] == "success"
    assert res["task"] == "SINGLE_CAPTION"
    assert "caption" in res["text_response"].lower() or "predominant" in res["text_response"].lower()
    assert res["confidence"] > 0.85
    assert len(res["execution_trace"]["steps"]) >= 2

def test_single_grounding_query(agent, sample_paths):
    query = "Highlight the water body referred to in the query."
    res = agent.process_query(query, sample_paths["optical"])
    assert res["status"] == "success"
    assert res["task"] == "SINGLE_GROUNDING"
    assert "visual_evidence_overlay" in res["visual_artifacts"]
    assert "detections" in res["spatial_grounding"]
    assert len(res["spatial_grounding"]["detections"]) > 0

def test_bitemporal_change_query(agent, sample_paths):
    query = "What changed between these two dates, and where did the change occur?"
    res = agent.process_query(query, sample_paths["t1"], sample_paths["t2"], pair_mode="BITEMPORAL")
    assert res["status"] == "success"
    assert res["task"] in ["BITEMPORAL_CHANGE", "BITEMPORAL_CDVQA"]
    assert "change_heatmap_b64" in res["visual_artifacts"]
    assert res["quantitative_metrics"]["change_percentage"] > 0

def test_bitemporal_cdvqa_built_up_trend(agent, sample_paths):
    query = "Has the built-up area increased, decreased, or remained unchanged?"
    res = agent.process_query(query, sample_paths["t1"], sample_paths["t2"], pair_mode="BITEMPORAL")
    assert res["status"] == "success"
    assert any(term in res["text_response"].lower() for term in ["increased", "decreased", "unchanged"])

def test_optical_sar_fusion_query(agent, sample_paths):
    query = "Use the optical and SAR images together to identify built-up and water-covered regions."
    res = agent.process_query(query, sample_paths["cross_opt"], sample_paths["cross_sar"], pair_mode="CROSSMODAL")
    assert res["status"] == "success"
    assert res["task"] == "CROSSMODAL_FUSION"
    assert "fused_composite_b64" in res["visual_artifacts"]
    assert "thematic_map_b64" in res["visual_artifacts"]
    assert "built_up_percentage" in res["quantitative_metrics"]["land_cover_percentages"]

def test_forced_tool_override(agent, sample_paths):
    # Query is conversational description, but forced tool is SINGLE_GROUNDING
    query = "Give me an overview of this satellite image."
    adv_settings = {"forced_tool": "SINGLE_GROUNDING", "box_color": "cyan"}
    res = agent.process_query(query, sample_paths["optical"], advanced_settings=adv_settings)
    assert res["status"] == "success"
    assert res["task"] == "SINGLE_GROUNDING"
    assert "visual_evidence_overlay" in res["visual_artifacts"]
    assert res["execution_trace"]["key_parameters"]["forced_tool"] == "SINGLE_GROUNDING"
    assert res["execution_trace"]["key_parameters"]["box_color"] == "cyan"

def test_advanced_settings_parameters(agent, sample_paths):
    query = "What changed between these dates?"
    adv_settings = {
        "change_percentile": 85,
        "change_colormap": "turbo",
        "optical_weight": 0.7,
        "sar_weight": 0.3
    }
    res = agent.process_query(query, sample_paths["t1"], sample_paths["t2"], pair_mode="BITEMPORAL", advanced_settings=adv_settings)
    assert res["status"] == "success"
    assert res["task"] in ["BITEMPORAL_CHANGE", "BITEMPORAL_CDVQA"]
    assert res["execution_trace"]["key_parameters"]["threshold_percentile"] == 85
    assert res["execution_trace"]["key_parameters"]["colormap"] == "turbo"

