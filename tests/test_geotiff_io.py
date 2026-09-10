"""
Tests for GeoTIFF I/O & Spectral Index Calculation
"""
import pytest
import numpy as np
from backend.utils.geotiff_io import read_image_and_metadata, compute_spectral_indices, normalize_to_rgb_uint8
from backend.config import SAMPLE_DATA_DIR

def test_read_geotiff():
    path = SAMPLE_DATA_DIR / "single_optical" / "cartosat_optical_scene.tif"
    arr, meta = read_image_and_metadata(path)
    assert arr.ndim == 3
    assert meta["format"] in ["TIF", "TIFF"]
    assert meta["bands_count"] >= 3

def test_spectral_indices():
    # 4-band dummy array (R, G, B, NIR)
    arr = np.random.randint(0, 255, (100, 100, 4), dtype=np.uint8)
    indices = compute_spectral_indices(arr)
    assert "NDVI" in indices
    assert "NDWI" in indices
    assert "FCC_NIR" in indices
    assert indices["NDVI"].shape == (100, 100)

def test_normalize_to_rgb():
    # Test 1-band SAR
    sar_arr = np.random.randint(0, 255, (100, 100), dtype=np.uint8)
    rgb = normalize_to_rgb_uint8(sar_arr)
    assert rgb.shape == (100, 100, 3)
    assert rgb.dtype == np.uint8
