"""
SatQuery AI - Geospatial I/O & Spectral Processing
Handles GeoTIFF / TIFF parsing, metadata extraction, band normalization, and spectral index calculations.
"""
import os
import json
import base64
from io import BytesIO
from pathlib import Path
from typing import Dict, Any, Tuple, Optional, List
import numpy as np
from PIL import Image
import tifffile

def read_image_and_metadata(file_path: str or Path) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Reads a geospatial raster (GeoTIFF / TIFF) or standard image (PNG / JPEG)
    and returns (numpy_array_HWC_or_HW, metadata_dict).
    """
    file_path = Path(file_path)
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = file_path.suffix.lower()
    metadata: Dict[str, Any] = {
        "filename": file_path.name,
        "format": ext.replace(".", "").upper(),
        "file_size_kb": round(os.path.getsize(file_path) / 1024, 2),
        "is_geotiff": False,
        "crs": "EPSG:4326 (WGS84) [Default/Estimated]",
        "bounds": None,
        "bands_count": 3,
        "dtype": "uint8",
        "shape": None
    }

    if ext in [".tif", ".tiff", ".geotiff"]:
        try:
            with tifffile.TiffFile(file_path) as tif:
                arr = tif.asarray()
                metadata["is_geotiff"] = True
                
                # Check for GeoTIFF tags
                geotags = {}
                if hasattr(tif, "geotiff_metadata") and tif.geotiff_metadata:
                    geotags = tif.geotiff_metadata
                
                page = tif.pages[0]
                if hasattr(page, "tags"):
                    if "ModelTiepointTag" in page.tags or "GeoKeyDirectoryTag" in page.tags:
                        metadata["is_geotiff"] = True
                        metadata["crs"] = "EPSG:32643 (UTM Zone 43N / Cartosat-RISAT Grid)"
                        metadata["spatial_resolution_m"] = 2.5
                
                # Reshape array to standard (H, W, C) or (H, W)
                if arr.ndim == 2:
                    # Single band (e.g. SAR VV or single band pan)
                    metadata["bands_count"] = 1
                    metadata["modality"] = "SAR" if "sar" in file_path.name.lower() or "risat" in file_path.name.lower() else "SINGLE_BAND"
                elif arr.ndim == 3:
                    if arr.shape[0] in [1, 2, 3, 4, 8, 12, 13] and arr.shape[0] < arr.shape[1]:
                        # Channels-first (C, H, W) -> transpose to (H, W, C)
                        arr = np.transpose(arr, (1, 2, 0))
                    metadata["bands_count"] = arr.shape[-1]
                    if metadata["bands_count"] >= 4:
                        metadata["modality"] = "MULTISPECTRAL"
                    elif metadata["bands_count"] == 2:
                        metadata["modality"] = "SAR_DUAL_POL"
                    else:
                        metadata["modality"] = "OPTICAL_RGB"
                        
                metadata["shape"] = [int(arr.shape[0]), int(arr.shape[1]), int(metadata["bands_count"])]
                metadata["dtype"] = str(arr.dtype)
                return arr, metadata
        except Exception as e:
            # Fallback to PIL if tifffile fails
            img = Image.open(file_path)
            arr = np.array(img)
            metadata["shape"] = list(arr.shape)
            metadata["dtype"] = str(arr.dtype)
            return arr, metadata
    else:
        # Standard PNG / JPEG benchmark image
        img = Image.open(file_path).convert("RGB")
        arr = np.array(img)
        metadata["bands_count"] = 3
        metadata["modality"] = "OPTICAL_RGB"
        metadata["shape"] = [arr.shape[0], arr.shape[1], 3]
        metadata["dtype"] = str(arr.dtype)
        return arr, metadata

def normalize_to_rgb_uint8(arr: np.ndarray, modality: str = "OPTICAL_RGB") -> np.ndarray:
    """
    Converts any multi-band or SAR numpy array to standard 3-channel uint8 (0-255) for rendering.
    """
    arr = np.squeeze(arr)
    if arr.ndim == 2:
        # Single band (e.g., SAR intensity or grayscale)
        norm = arr.astype(np.float32)
        p2, p98 = np.percentile(norm, (2, 98))
        if p98 > p2:
            norm = np.clip((norm - p2) / (p98 - p2), 0, 1)
        else:
            norm = np.clip(norm / 255.0 if norm.max() > 1 else norm, 0, 1)
        rgb = (norm * 255).astype(np.uint8)
        return np.stack([rgb, rgb, rgb], axis=-1)
    
    if arr.ndim == 3:
        num_channels = arr.shape[-1]
        if num_channels == 1:
            return normalize_to_rgb_uint8(arr[:, :, 0], modality)
        elif num_channels == 2:
            # Dual polarization SAR (e.g. VV and VH) -> create false color (VV, VH, VV/VH ratio)
            c1 = arr[:, :, 0].astype(np.float32)
            c2 = arr[:, :, 1].astype(np.float32)
            c1_n = np.clip((c1 - np.percentile(c1, 2)) / (np.percentile(c1, 98) - np.percentile(c1, 2) + 1e-6), 0, 1)
            c2_n = np.clip((c2 - np.percentile(c2, 2)) / (np.percentile(c2, 98) - np.percentile(c2, 2) + 1e-6), 0, 1)
            ratio = np.clip(c1_n / (c2_n + 1e-3), 0, 2) / 2.0
            rgb = np.stack([c1_n, c2_n, ratio], axis=-1)
            return (rgb * 255).astype(np.uint8)
        elif num_channels >= 3:
            # First 3 bands as RGB (or Red, Green, Blue)
            sub = arr[:, :, :3].astype(np.float32)
            for c in range(3):
                p2, p98 = np.percentile(sub[:, :, c], (2, 98))
                if p98 > p2:
                    sub[:, :, c] = np.clip((sub[:, :, c] - p2) / (p98 - p2), 0, 1)
                else:
                    sub[:, :, c] = np.clip(sub[:, :, c] / 255.0 if sub[:, :, c].max() > 1 else sub[:, :, c], 0, 1)
            return (sub * 255).astype(np.uint8)
            
    return np.zeros((256, 256, 3), dtype=np.uint8)

def compute_spectral_indices(arr: np.ndarray) -> Dict[str, np.ndarray]:
    """
    Calculates remote-sensing indices:
    - NDVI: (NIR - Red) / (NIR + Red)
    - NDWI: (Green - NIR) / (Green + NIR) or (NIR - SWIR)/(NIR + SWIR)
    - NDBI: (SWIR - NIR) / (SWIR + NIR) or built-up proxy
    - SAR Backscatter amplitude
    """
    indices: Dict[str, np.ndarray] = {}
    h, w = arr.shape[:2]
    
    if arr.ndim == 3 and arr.shape[-1] >= 4:
        # Multi-band: B1=Blue, B2=Green, B3=Red, B4=NIR
        blue = arr[:, :, 0].astype(np.float32)
        green = arr[:, :, 1].astype(np.float32)
        red = arr[:, :, 2].astype(np.float32)
        nir = arr[:, :, 3].astype(np.float32)
        
        # NDVI
        ndvi = (nir - red) / (nir + red + 1e-6)
        indices["NDVI"] = np.clip(ndvi, -1.0, 1.0)
        
        # NDWI (Water)
        ndwi = (green - nir) / (green + nir + 1e-6)
        indices["NDWI"] = np.clip(ndwi, -1.0, 1.0)
        
        # False Color Composite (NIR, Red, Green)
        fcc = np.stack([nir, red, green], axis=-1)
        indices["FCC_NIR"] = normalize_to_rgb_uint8(fcc)
    elif arr.ndim == 3 and arr.shape[-1] == 3:
        # RGB approximation: R, G, B
        r = arr[:, :, 0].astype(np.float32)
        g = arr[:, :, 1].astype(np.float32)
        b = arr[:, :, 2].astype(np.float32)
        
        # Approximate Green-Red Vegetation Index (GRVI)
        grvi = (g - r) / (g + r + 1e-6)
        indices["NDVI_APPROX"] = np.clip(grvi, -1.0, 1.0)
        
        # Approximate Modified NDWI using Blue & Red
        m_ndwi = (b - (r + g)/2.0) / (b + (r + g)/2.0 + 1e-6)
        indices["NDWI_APPROX"] = np.clip(m_ndwi, -1.0, 1.0)
    elif arr.ndim == 2 or (arr.ndim == 3 and arr.shape[-1] == 1):
        # SAR Intensity
        sar = arr.squeeze().astype(np.float32)
        # Radar dB = 10 * log10(intensity + eps)
        sar_db = 10.0 * np.log10(np.maximum(sar, 1e-4))
        indices["SAR_DB"] = sar_db
        
    return indices

def array_to_base64_png(arr: np.ndarray) -> str:
    """Converts a numpy RGB or grayscale image to a Base64 data URL."""
    if arr.dtype != np.uint8:
        if arr.min() >= 0 and arr.max() <= 1.0:
            arr = (arr * 255).astype(np.uint8)
        else:
            arr = np.clip(arr, 0, 255).astype(np.uint8)
            
    if arr.ndim == 2:
        img = Image.fromarray(arr, mode="L")
    else:
        img = Image.fromarray(arr, mode="RGB")
        
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{b64_str}"
