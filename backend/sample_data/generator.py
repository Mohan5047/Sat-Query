"""
SatQuery AI - Sample Dataset Generator
Creates realistic remote-sensing GeoTIFF and benchmark image files for:
1. Single Optical (Urban, coastal, runway, forest)
2. Single SAR (Microwave radar backscatter)
3. Bi-temporal Pair (Urban expansion & flood inundation)
4. Cross-Modal Pair (Co-registered Optical + SAR)
"""
import os
from pathlib import Path
import numpy as np
import tifffile
from PIL import Image

from backend.config import SAMPLE_DATA_DIR

def generate_sample_datasets():
    single_opt_dir = SAMPLE_DATA_DIR / "single_optical"
    single_sar_dir = SAMPLE_DATA_DIR / "single_sar"
    bitemp_dir = SAMPLE_DATA_DIR / "bitemporal_pairs"
    crossmodal_dir = SAMPLE_DATA_DIR / "optical_sar_pairs"
    
    for d in [single_opt_dir, single_sar_dir, bitemp_dir, crossmodal_dir]:
        d.mkdir(parents=True, exist_ok=True)
        
    h, w = 512, 512
    np.random.seed(42)
    
    # 1. Generate Single Optical GeoTIFF (Urban & Coastal Scene with Runway & Water)
    opt_img = np.zeros((h, w, 4), dtype=np.uint8) # R, G, B, NIR
    
    # Background: Grassland / light vegetation
    opt_img[:, :, 0] = np.random.randint(60, 100, (h, w))  # Red
    opt_img[:, :, 1] = np.random.randint(120, 170, (h, w)) # Green
    opt_img[:, :, 2] = np.random.randint(40, 80, (h, w))   # Blue
    opt_img[:, :, 3] = np.random.randint(180, 240, (h, w)) # NIR
    
    # Water body (Lake / Reservoir in South-West)
    y, x = np.ogrid[:h, :w]
    water_mask = ((x - 140)**2 + (y - 360)**2) < 100**2
    # Add river branch
    river_mask = (np.abs(y - (0.8 * x + 200)) < 18) & (x >= 140) & (x <= 450)
    water_mask = water_mask | river_mask
    opt_img[water_mask, 0] = np.random.randint(15, 45, np.sum(water_mask))
    opt_img[water_mask, 1] = np.random.randint(40, 85, np.sum(water_mask))
    opt_img[water_mask, 2] = np.random.randint(110, 175, np.sum(water_mask))
    opt_img[water_mask, 3] = np.random.randint(10, 35, np.sum(water_mask)) # Low NIR in water
    
    # Dense Forest in North-East
    forest_mask = (x > 320) & (y < 220)
    opt_img[forest_mask, 0] = np.random.randint(20, 50, np.sum(forest_mask))
    opt_img[forest_mask, 1] = np.random.randint(90, 130, np.sum(forest_mask))
    opt_img[forest_mask, 2] = np.random.randint(20, 50, np.sum(forest_mask))
    opt_img[forest_mask, 3] = np.random.randint(210, 255, np.sum(forest_mask)) # High NIR
    
    # Urban cluster / Built-up area in North-West
    urban_mask = (x >= 60) & (x <= 240) & (y >= 60) & (y <= 240)
    opt_img[urban_mask, 0] = np.random.randint(140, 210, np.sum(urban_mask))
    opt_img[urban_mask, 1] = np.random.randint(140, 200, np.sum(urban_mask))
    opt_img[urban_mask, 2] = np.random.randint(140, 200, np.sum(urban_mask))
    opt_img[urban_mask, 3] = np.random.randint(120, 180, np.sum(urban_mask))
    
    # Airport Runway in Center-East
    runway_mask = (x >= 280) & (x <= 480) & (np.abs(y - 280) < 14)
    opt_img[runway_mask, 0] = 220
    opt_img[runway_mask, 1] = 220
    opt_img[runway_mask, 2] = 225
    opt_img[runway_mask, 3] = 160
    
    single_opt_path = single_opt_dir / "cartosat_optical_scene.tif"
    tifffile.imwrite(single_opt_path, opt_img, photometric="rgb")
    
    # Save standard PNG preview as well
    Image.fromarray(opt_img[:, :, :3]).save(single_opt_dir / "cartosat_optical_scene.png")
    
    # 2. Generate Single SAR Backscatter Scene (RISAT style)
    sar_img = np.random.rayleigh(scale=35.0, size=(h, w)).astype(np.float32)
    # Smooth water has very low backscatter (specular)
    sar_img[water_mask] = np.random.rayleigh(scale=5.0, size=np.sum(water_mask))
    # Urban structures have very high double-bounce return
    sar_img[urban_mask] = np.random.rayleigh(scale=85.0, size=np.sum(urban_mask))
    # Runway flat pavement has low-to-medium backscatter
    sar_img[runway_mask] = np.random.rayleigh(scale=18.0, size=np.sum(runway_mask))
    # Forest volume scattering
    sar_img[forest_mask] = np.random.rayleigh(scale=45.0, size=np.sum(forest_mask))
    
    sar_uint8 = np.clip(sar_img, 0, 255).astype(np.uint8)
    single_sar_path = single_sar_dir / "risat_sar_backscatter.tif"
    tifffile.imwrite(single_sar_path, sar_uint8)
    Image.fromarray(sar_uint8).save(single_sar_dir / "risat_sar_backscatter.png")
    
    # 3. Generate Bi-temporal Pair (Urban Growth / Infrastructure Change)
    # T1: 2021 Baseline (Vegetation / agricultural fields before construction)
    t1_img = opt_img.copy()
    # In T1, the South-East region was agricultural fields
    se_mask = (x >= 280) & (x <= 480) & (y >= 340) & (y <= 490)
    t1_img[se_mask, 0] = np.random.randint(60, 90, np.sum(se_mask))
    t1_img[se_mask, 1] = np.random.randint(140, 180, np.sum(se_mask))
    t1_img[se_mask, 2] = np.random.randint(40, 70, np.sum(se_mask))
    t1_img[se_mask, 3] = np.random.randint(190, 240, np.sum(se_mask))
    
    # T2: 2024 Post-Development (New residential & industrial built-up complexes built in South-East)
    t2_img = t1_img.copy()
    t2_img[se_mask, 0] = np.random.randint(160, 220, np.sum(se_mask))
    t2_img[se_mask, 1] = np.random.randint(160, 210, np.sum(se_mask))
    t2_img[se_mask, 2] = np.random.randint(160, 210, np.sum(se_mask))
    t2_img[se_mask, 3] = np.random.randint(110, 160, np.sum(se_mask))
    
    t1_path = bitemp_dir / "urban_change_2021_t1.tif"
    t2_path = bitemp_dir / "urban_change_2024_t2.tif"
    tifffile.imwrite(t1_path, t1_img[:, :, :3])
    tifffile.imwrite(t2_path, t2_img[:, :, :3])
    Image.fromarray(t1_img[:, :, :3]).save(bitemp_dir / "urban_change_2021_t1.png")
    Image.fromarray(t2_img[:, :, :3]).save(bitemp_dir / "urban_change_2024_t2.png")
    
    # 4. Generate Co-registered Cross-Modal Pair (Cartosat Optical + RISAT SAR)
    cross_opt_path = crossmodal_dir / "cartosat2s_optical_coreg.tif"
    cross_sar_path = crossmodal_dir / "risat1a_sar_coreg.tif"
    tifffile.imwrite(cross_opt_path, opt_img[:, :, :3])
    tifffile.imwrite(cross_sar_path, sar_uint8)
    Image.fromarray(opt_img[:, :, :3]).save(crossmodal_dir / "cartosat2s_optical_coreg.png")
    Image.fromarray(sar_uint8).save(crossmodal_dir / "risat1a_sar_coreg.png")
    
    print("Sample datasets generated successfully in:", SAMPLE_DATA_DIR)

if __name__ == "__main__":
    generate_sample_datasets()
