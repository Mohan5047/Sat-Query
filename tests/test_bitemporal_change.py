"""
Tests for Bi-temporal Change Engine & Cross-modal Optical-SAR Fusion
"""
import pytest
from backend.models.rs_change_engine import RSChangeEngine
from backend.models.rs_optical_sar_fusion import RSOpticalSARFusionEngine
from backend.utils.geotiff_io import read_image_and_metadata
from backend.config import SAMPLE_DATA_DIR

def test_bitemporal_change_engine():
    t1_path = SAMPLE_DATA_DIR / "bitemporal_pairs" / "urban_change_2021_t1.tif"
    t2_path = SAMPLE_DATA_DIR / "bitemporal_pairs" / "urban_change_2024_t2.tif"
    
    t1_arr, _ = read_image_and_metadata(t1_path)
    t2_arr, _ = read_image_and_metadata(t2_path)
    
    engine = RSChangeEngine()
    res = engine.analyze_change(t1_arr, t2_arr, query="What changed between these two dates?")
    
    assert res["change_percentage"] > 2.0
    assert "heatmap_b64" in res
    assert "change_mask_overlay_b64" in res
    assert "semantic_change_analysis" in res

def test_optical_sar_fusion_engine():
    opt_path = SAMPLE_DATA_DIR / "optical_sar_pairs" / "cartosat2s_optical_coreg.tif"
    sar_path = SAMPLE_DATA_DIR / "optical_sar_pairs" / "risat1a_sar_coreg.tif"
    
    opt_arr, _ = read_image_and_metadata(opt_path)
    sar_arr, _ = read_image_and_metadata(sar_path)
    
    engine = RSOpticalSARFusionEngine()
    res = engine.fuse_and_analyze(opt_arr, sar_arr, query="Extract complementary built-up and water features.")
    
    assert res["task"] == "CROSSMODAL_FUSION"
    assert "fused_composite_b64" in res
    assert "thematic_map_b64" in res
    assert res["metrics"]["built_up_percentage"] > 0
    assert res["metrics"]["water_percentage"] > 0
