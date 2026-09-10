"""
SatQuery AI - System Configuration
"""
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent
SAMPLE_DATA_DIR = BASE_DIR / "sample_data"
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"

# Ensure runtime directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
SAMPLE_DATA_DIR.mkdir(parents=True, exist_ok=True)

# Supported image formats
SUPPORTED_FORMATS = [".tif", ".tiff", ".geotiff", ".png", ".jpg", ".jpeg"]

# Task Types supported by SatQuery Agentic Controller
TASK_SINGLE_VQA = "SINGLE_VQA"
TASK_SINGLE_CAPTION = "SINGLE_CAPTION"
TASK_SINGLE_GROUNDING = "SINGLE_GROUNDING"
TASK_BITEMPORAL_CHANGE = "BITEMPORAL_CHANGE"
TASK_BITEMPORAL_CDVQA = "BITEMPORAL_CDVQA"
TASK_CROSSMODAL_FUSION = "CROSSMODAL_FUSION"
TASK_SPECTRAL_ANALYSIS = "SPECTRAL_ANALYSIS"

# Image Modalities
MODALITY_OPTICAL = "OPTICAL"
MODALITY_MULTISPECTRAL = "MULTISPECTRAL"
MODALITY_SAR = "SAR"
MODALITY_COREGISTERED_PAIR = "COREGISTERED_PAIR"
MODALITY_BITEMPORAL_PAIR = "BITEMPORAL_PAIR"

# Predefined benchmark categories adapted to BigEarthNet
BIGEARTHNET_CLASSES = [
    "Continuous urban fabric",
    "Discontinuous urban fabric",
    "Industrial or commercial units",
    "Road and rail networks and associated land",
    "Port areas and coastal infrastructure",
    "Airports and runways",
    "Non-irrigated arable land",
    "Permanently irrigated land",
    "Rice fields",
    "Vineyards and fruit trees",
    "Pastures and grasslands",
    "Broad-leaved forest",
    "Coniferous forest",
    "Mixed forest",
    "Natural grassland and scrub",
    "Moors and heathland",
    "Inland wetlands and marshes",
    "Coastal lagoons and estuaries",
    "Water courses (rivers/canals)",
    "Water bodies (lakes/reservoirs)",
    "Marine waters"
]
