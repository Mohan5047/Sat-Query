"""
SatQuery AI - Visualization Utilities
Helper functions for overlay generation, colorbar maps, and side-by-side composites.
"""
from typing import Dict, Any, List, Optional
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import matplotlib.cm as cm
from backend.utils.geotiff_io import array_to_base64_png

def create_split_slider_composite(img1: np.ndarray, img2: np.ndarray, split_ratio: float = 0.5) -> str:
    """Creates a split comparison image between two rasters."""
    h = min(img1.shape[0], img2.shape[0])
    w = min(img1.shape[1], img2.shape[1])
    
    split_x = int(w * split_ratio)
    composite = np.zeros((h, w, 3), dtype=np.uint8)
    
    composite[:, :split_x] = img1[:h, :split_x, :3]
    composite[:, split_x:] = img2[:h, split_x:w, :3]
    
    # Draw vertical divider line
    composite[:, max(0, split_x - 1):min(w, split_x + 2)] = [255, 255, 255]
    
    return array_to_base64_png(composite)
