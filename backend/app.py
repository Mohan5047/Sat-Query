"""
SatQuery AI - Backend API Application
FastAPI Server providing agentic remote-sensing query processing, tool orchestration, and reporting.
"""
import os
import shutil
import uuid
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from backend.config import UPLOAD_DIR, OUTPUT_DIR, SAMPLE_DATA_DIR
from backend.core.agent import SatQueryAgent
from backend.core.validator import InputValidator
from backend.utils.geotiff_io import read_image_and_metadata, array_to_base64_png, normalize_to_rgb_uint8
from backend.utils.report_builder import ReportBuilder

app = FastAPI(
    title="SatQuery AI - Remote Sensing Vision-Language Assistant",
    description="Agentic Vision-Language Assistant for Multimodal Remote Sensing Image Analysis (ISRO/SAC).",
    version="1.0.0"
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = SatQueryAgent()
sessions_cache: Dict[str, Any] = {}

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SatQuery AI",
        "agency": "ISRO / SAC Theme Standard",
        "agentic_controller": "Active",
        "tools_registered": len(agent.registry.list_tools())
    }

@app.get("/api/tools")
def get_registered_tools():
    return {"tools": agent.registry.list_tools()}

@app.get("/api/samples")
def get_samples():
    """Returns catalog of pre-loaded benchmark datasets."""
    catalog = [
        {
            "id": "single_optical_urban",
            "name": "Cartosat-2S High-Res Optical (Urban, Port & Runway)",
            "category": "SINGLE_OPTICAL",
            "mode": "SINGLE",
            "image1_path": str(SAMPLE_DATA_DIR / "single_optical" / "cartosat_optical_scene.tif"),
            "image1_preview": str(SAMPLE_DATA_DIR / "single_optical" / "cartosat_optical_scene.png"),
            "image2_path": None,
            "description": "Multi-spectral optical image containing urban built-up fabric, coastal water bodies, forest canopy, and airport runway.",
            "suggested_queries": [
                "Describe the land-cover and major objects visible in this image.",
                "Highlight the water body referred to in the query.",
                "How many airport runways or aircraft facilities are present?",
                "What is the dominant land cover class across the scene?"
            ]
        },
        {
            "id": "single_sar_scene",
            "name": "RISAT-1A SAR Microwave Backscatter Scene",
            "category": "SINGLE_SAR",
            "mode": "SINGLE",
            "image1_path": str(SAMPLE_DATA_DIR / "single_sar" / "risat_sar_backscatter.tif"),
            "image1_preview": str(SAMPLE_DATA_DIR / "single_sar" / "risat_sar_backscatter.png"),
            "image2_path": None,
            "description": "Synthetic Aperture Radar (SAR) backscatter image demonstrating microwave scattering, double-bounce built-up return, and specular water absorption.",
            "suggested_queries": [
                "Describe the microwave backscatter patterns and surface structures visible.",
                "Identify built-up regions exhibiting high double-bounce radar return.",
                "Locate the dark specular water surface in this SAR imagery."
            ]
        },
        {
            "id": "bitemporal_urban_expansion",
            "name": "Bi-Temporal Urban Expansion Pair (2021 vs 2024)",
            "category": "BITEMPORAL",
            "mode": "BITEMPORAL",
            "image1_path": str(SAMPLE_DATA_DIR / "bitemporal_pairs" / "urban_change_2021_t1.tif"),
            "image1_preview": str(SAMPLE_DATA_DIR / "bitemporal_pairs" / "urban_change_2021_t1.png"),
            "image2_path": str(SAMPLE_DATA_DIR / "bitemporal_pairs" / "urban_change_2024_t2.tif"),
            "image2_preview": str(SAMPLE_DATA_DIR / "bitemporal_pairs" / "urban_change_2024_t2.png"),
            "description": "Spatially coregistered bi-temporal pair capturing 3-year urban expansion, infrastructure addition, and agricultural clearing.",
            "suggested_queries": [
                "What changed between these two dates, and where did the change occur?",
                "Has the built-up area increased, decreased, or remained unchanged?",
                "Generate a spatial change heatmap highlighting newly developed zones.",
                "Quantify the percentage of surface modification between T1 and T2."
            ]
        },
        {
            "id": "crossmodal_cartosat_risat",
            "name": "Cross-Modal Cartosat Optical + RISAT SAR Pair",
            "category": "CROSSMODAL",
            "mode": "CROSSMODAL",
            "image1_path": str(SAMPLE_DATA_DIR / "optical_sar_pairs" / "cartosat2s_optical_coreg.tif"),
            "image1_preview": str(SAMPLE_DATA_DIR / "optical_sar_pairs" / "cartosat2s_optical_coreg.png"),
            "image2_path": str(SAMPLE_DATA_DIR / "optical_sar_pairs" / "risat1a_sar_coreg.tif"),
            "image2_preview": str(SAMPLE_DATA_DIR / "optical_sar_pairs" / "risat1a_sar_coreg.png"),
            "description": "Co-registered Optical and Synthetic Aperture Radar (SAR) pair for joint information extraction and complementary surface characterization.",
            "suggested_queries": [
                "Use the optical and SAR images together to identify built-up and water-covered regions.",
                "Extract complementary information from this optical-SAR pair.",
                "Generate a fused multimodal thematic land-cover classification map."
            ]
        }
    ]
    return {"samples": catalog}

@app.post("/api/inspect_image")
def inspect_image(
    file_path: Optional[str] = Form(None)
):
    """Inspects metadata and preview of a raster."""
    if not file_path or not Path(file_path).exists():
        raise HTTPException(status_code=400, detail="File path does not exist.")
        
    arr, meta = read_image_and_metadata(file_path)
    rgb = normalize_to_rgb_uint8(arr)
    b64 = array_to_base64_png(rgb)
    return {
        "metadata": meta,
        "preview_b64": b64
    }

@app.post("/api/analyze")
async def analyze_query(
    query: str = Form(...),
    pair_mode: Optional[str] = Form(None),
    sample_image1_path: Optional[str] = Form(None),
    sample_image2_path: Optional[str] = Form(None),
    file1: Optional[UploadFile] = File(None),
    file2: Optional[UploadFile] = File(None),
):
    """
    Core agentic analysis endpoint.
    Accepts uploaded files or sample paths with natural-language text query.
    """
    img1_path = None
    img2_path = None
    
    # Handle File 1
    if file1 and file1.filename:
        ext = Path(file1.filename).suffix or ".png"
        img1_path = UPLOAD_DIR / f"upload_1_{uuid.uuid4().hex[:8]}{ext}"
        with open(img1_path, "wb") as f:
            shutil.copyfileobj(file1.file, f)
    elif sample_image1_path and Path(sample_image1_path).exists():
        img1_path = Path(sample_image1_path)
    else:
        raise HTTPException(status_code=400, detail="Primary image is required (either upload or sample selection).")
        
    # Handle File 2 (optional or pair mode)
    if file2 and file2.filename:
        ext = Path(file2.filename).suffix or ".png"
        img2_path = UPLOAD_DIR / f"upload_2_{uuid.uuid4().hex[:8]}{ext}"
        with open(img2_path, "wb") as f:
            shutil.copyfileobj(file2.file, f)
    elif sample_image2_path and Path(sample_image2_path).exists():
        img2_path = Path(sample_image2_path)
        
    # Execute Agentic Analysis Pipeline
    try:
        analysis_result = agent.process_query(
            query=query,
            image_path_1=img1_path,
            image_path_2=img2_path,
            pair_mode=pair_mode
        )
        
        session_id = analysis_result.get("execution_trace", {}).get("session_id", str(uuid.uuid4())[:8])
        sessions_cache[session_id] = analysis_result
        
        # Pre-generate reports
        ReportBuilder.generate_pdf_report(session_id, analysis_result)
        ReportBuilder.generate_json_report(session_id, analysis_result)
        
        return analysis_result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"SatQuery analysis error: {str(e)}")

@app.get("/api/report/pdf/{session_id}")
def download_pdf_report(session_id: str):
    pdf_path = OUTPUT_DIR / f"SatQuery_Report_{session_id}.pdf"
    if not pdf_path.exists():
        # Check cache and build
        if session_id in sessions_cache:
            ReportBuilder.generate_pdf_report(session_id, sessions_cache[session_id], pdf_path)
        else:
            raise HTTPException(status_code=404, detail="Report not found for session.")
    return FileResponse(
        str(pdf_path),
        media_type="application/pdf",
        filename=f"SatQuery_Report_{session_id}.pdf"
    )

@app.get("/api/report/json/{session_id}")
def download_json_report(session_id: str):
    json_path = OUTPUT_DIR / f"SatQuery_Report_{session_id}.json"
    if not json_path.exists():
        if session_id in sessions_cache:
            ReportBuilder.generate_json_report(session_id, sessions_cache[session_id], json_path)
        else:
            raise HTTPException(status_code=404, detail="Report not found for session.")
    return FileResponse(
        str(json_path),
        media_type="application/json",
        filename=f"SatQuery_Report_{session_id}.json"
    )

# Mount compiled React frontend if exists
frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        target_file = frontend_dist / full_path
        if target_file.exists() and target_file.is_file():
            return FileResponse(str(target_file))
        return FileResponse(str(frontend_dist / "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

