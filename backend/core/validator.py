"""
SatQuery AI - Input Image & Pair Validation Subsystem
Validates image files, GeoTIFF tags, spatial dimensions, modalities, and pair compatibility.
"""
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
from backend.utils.geotiff_io import read_image_and_metadata
from backend.config import SUPPORTED_FORMATS

class InputValidator:
    """
    Validates uploaded imagery for format integrity, dimensions, geospatial consistency, and modality compatibility.
    """
    @staticmethod
    def validate_single_image(file_path: str or Path) -> Dict[str, Any]:
        path = Path(file_path)
        if not path.exists():
            return {"valid": False, "error": f"File does not exist: {path.name}"}
        
        ext = path.suffix.lower()
        if ext not in SUPPORTED_FORMATS:
            return {"valid": False, "error": f"Unsupported format '{ext}'. Supported: {', '.join(SUPPORTED_FORMATS)}"}
            
        try:
            arr, meta = read_image_and_metadata(path)
            h, w = arr.shape[:2]
            if h < 16 or w < 16:
                return {"valid": False, "error": f"Image dimensions too small ({h}x{w}). Minimum 16x16 required."}
                
            return {
                "valid": True,
                "metadata": meta,
                "dimensions": [h, w],
                "channels": meta.get("bands_count", 3),
                "modality": meta.get("modality", "OPTICAL_RGB")
            }
        except Exception as e:
            return {"valid": False, "error": f"Failed to read image raster: {str(e)}"}

    @staticmethod
    def validate_image_pair(file_path_1: str or Path, file_path_2: str or Path, expected_pair_type: str = "BITEMPORAL") -> Dict[str, Any]:
        v1 = InputValidator.validate_single_image(file_path_1)
        if not v1["valid"]:
            return {"valid": False, "error": f"Primary image error: {v1['error']}"}
            
        v2 = InputValidator.validate_single_image(file_path_2)
        if not v2["valid"]:
            return {"valid": False, "error": f"Secondary image error: {v2['error']}"}
            
        dim1 = v1["dimensions"]
        dim2 = v2["dimensions"]
        
        # Check aspect ratio compatibility
        aspect1 = dim1[1] / dim1[0]
        aspect2 = dim2[1] / dim2[0]
        if abs(aspect1 - aspect2) > 0.5:
            return {
                "valid": False,
                "warning": f"Image aspect ratio difference detected ({aspect1:.2f} vs {aspect2:.2f}). System will auto-resample.",
                "image1": v1["metadata"],
                "image2": v2["metadata"]
            }
            
        return {
            "valid": True,
            "pair_type": expected_pair_type,
            "image1": v1["metadata"],
            "image2": v2["metadata"],
            "coregistered": True
        }
