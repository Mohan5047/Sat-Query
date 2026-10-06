import React, { useState, useRef } from 'react';
import { Eye, SplitSquareVertical, Sliders, Maximize2, Layers, Sparkles, ZoomIn, ZoomOut, RotateCcw, Download, Crosshair } from 'lucide-react';

export default function ImageViewer({
  mode,
  image1Preview,
  image2Preview,
  analysisResult,
  isLoading,
  settings
}) {
  const [activeLayer, setActiveLayer] = useState('auto');
  const [splitPosition, setSplitPosition] = useState(50);
  const [viewMode, setViewMode] = useState('split'); // 'split' or 'side-by-side'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [coords, setCoords] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef(null);

  const visualArtifacts = analysisResult?.visual_artifacts || {};

  // Determine which image to show based on activeLayer
  const getDisplayImage1 = () => {
    if (activeLayer === 'grounding' && visualArtifacts.visual_evidence_overlay) {
      return visualArtifacts.visual_evidence_overlay;
    }
    if (activeLayer === 'ndvi' && visualArtifacts.ndvi_b64) {
      return visualArtifacts.ndvi_b64;
    }
    if (activeLayer === 'fcc_nir' && visualArtifacts.fcc_nir_b64) {
      return visualArtifacts.fcc_nir_b64;
    }
    if (activeLayer === 'change_heatmap' && visualArtifacts.change_heatmap_b64) {
      return visualArtifacts.change_heatmap_b64;
    }
    if (activeLayer === 'thematic' && visualArtifacts.thematic_map_b64) {
      return visualArtifacts.thematic_map_b64;
    }
    if (activeLayer === 'fused' && visualArtifacts.fused_composite_b64) {
      return visualArtifacts.fused_composite_b64;
    }
    return visualArtifacts.primary_rgb_b64 || image1Preview;
  };

  const getDisplayImage2 = () => {
    if (activeLayer === 'change_mask' && visualArtifacts.change_mask_b64) {
      return visualArtifacts.change_mask_b64;
    }
    return visualArtifacts.secondary_rgb_b64 || image2Preview;
  };

  const currentImg1 = getDisplayImage1();
  const currentImg2 = getDisplayImage2();

  // Mouse move coordinate crosshair handler
  const handleMouseMove = (e) => {
    if (!canvasRef.current || settings?.coordinate_crosshair === false) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const yPct = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    const pxX = Math.round(xPct * 512);
    const pxY = Math.round(yPct * 512);
    setCoords({ x: pxX, y: pxY });
  };

  const handleMouseLeave = () => {
    setCoords(null);
  };

  // Quick download current layer
  const handleDownloadLayer = () => {
    const link = document.createElement('a');
    link.download = `SatQuery_${activeLayer}_layer.png`;
    link.href = currentImg1;
    link.click();
  };

  return (
    <div className={`glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 shadow-xl transition-all ${isFullscreen ? 'fixed inset-4 z-50 overflow-auto' : ''}`}>
      {/* Viewer Header & Layer Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Geospatial & Multimodal Viewer
          </h3>
        </div>

        {/* Dynamic Layer Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveLayer('auto')}
            className={`px-2.5 py-1 rounded-lg border transition ${
              activeLayer === 'auto'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            True Color / Base
          </button>

          {visualArtifacts.visual_evidence_overlay && (
            <button
              onClick={() => setActiveLayer('grounding')}
              className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 ${
                activeLayer === 'grounding'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-slate-900 text-amber-400/80 border-slate-800 hover:text-amber-300'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Grounded BBoxes</span>
            </button>
          )}

          {visualArtifacts.change_heatmap_b64 && (
            <button
              onClick={() => setActiveLayer('change_heatmap')}
              className={`px-2.5 py-1 rounded-lg border transition ${
                activeLayer === 'change_heatmap'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                  : 'bg-slate-900 text-rose-400/80 border-slate-800 hover:text-rose-300'
              }`}
            >
              Change Heatmap
            </button>
          )}

          {visualArtifacts.fused_composite_b64 && (
            <button
              onClick={() => setActiveLayer('fused')}
              className={`px-2.5 py-1 rounded-lg border transition ${
                activeLayer === 'fused'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                  : 'bg-slate-900 text-emerald-400/80 border-slate-800 hover:text-emerald-300'
              }`}
            >
              Optical-SAR Fused
            </button>
          )}

          {visualArtifacts.thematic_map_b64 && (
            <button
              onClick={() => setActiveLayer('thematic')}
              className={`px-2.5 py-1 rounded-lg border transition ${
                activeLayer === 'thematic'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold'
                  : 'bg-slate-900 text-indigo-400/80 border-slate-800 hover:text-indigo-300'
              }`}
            >
              Thematic Land Cover
            </button>
          )}

          {visualArtifacts.ndvi_b64 && (
            <button
              onClick={() => setActiveLayer('ndvi')}
              className={`px-2.5 py-1 rounded-lg border transition ${
                activeLayer === 'ndvi'
                  ? 'bg-lime-500/20 text-lime-300 border-lime-500/40'
                  : 'bg-slate-900 text-lime-400/80 border-slate-800 hover:text-lime-300'
              }`}
            >
              NDVI Index
            </button>
          )}

          {/* Canvas Tools Toolbar */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-2 ml-1">
            <button
              onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
              className="p-1 rounded bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
              className="p-1 rounded bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {zoomLevel !== 1 && (
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded bg-slate-900 text-cyan-400 border border-slate-800"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleDownloadLayer}
              className="p-1 rounded bg-slate-900 text-slate-400 hover:text-cyan-400 border border-slate-800"
              title="Export Current Layer Image"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 rounded bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Display Canvas */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative w-full ${isFullscreen ? 'h-[75vh]' : 'h-80 md:h-[420px]'} bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center`}
      >
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin"></div>
            <p className="text-sm font-semibold text-cyan-300 animate-pulse">
              SatQuery Agent executing specialist model workflow...
            </p>
          </div>
        )}

        {/* Live Coordinate Crosshair HUD */}
        {coords && settings?.coordinate_crosshair !== false && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 backdrop-blur border border-cyan-500/40 text-[10px] font-mono px-3 py-1 rounded-full text-cyan-300 flex items-center gap-2 shadow-lg">
            <Crosshair className="w-3 h-3 text-cyan-400 animate-spin-slow" />
            <span>Grid: [{coords.x}, {coords.y}]</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">GSD: 2.5m</span>
          </div>
        )}

        {/* Scaled Visual Content Container */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-150"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* If Paired Observation (Bi-Temporal or Cross-Modal) */}
          {mode !== 'SINGLE' && currentImg2 ? (
            viewMode === 'split' ? (
              /* Split Comparison Slider */
              <div className="relative w-full h-full select-none overflow-hidden">
                <img
                  src={currentImg1}
                  alt="Primary Modality"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${splitPosition}%` }}
                >
                  <img
                    src={currentImg2}
                    alt="Secondary Modality"
                    className="absolute inset-0 w-full h-full object-contain max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>

                {/* Slider Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-ew-resize shadow-2xl z-20 flex items-center justify-center"
                  style={{ left: `${splitPosition}%` }}
                >
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg border-2 border-white text-[10px] font-bold">
                    ↔
                  </div>
                </div>

                {/* Range input controller */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitPosition}
                  onChange={(e) => setSplitPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                />

                {/* Badges */}
                <span className="absolute top-3 left-3 bg-slate-900/90 text-cyan-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border border-cyan-500/40 z-10">
                  {mode === 'BITEMPORAL' ? 'T1: Pre-Event' : 'Optical RGB'}
                </span>
                <span className="absolute top-3 right-3 bg-slate-900/90 text-indigo-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border border-indigo-500/40 z-10">
                  {mode === 'BITEMPORAL' ? 'T2: Post-Event' : 'SAR Backscatter'}
                </span>
              </div>
            ) : (
              /* Side-by-Side Dual View */
              <div className="grid grid-cols-2 w-full h-full gap-2 p-2">
                <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900/50">
                  <img src={currentImg1} alt="Left" className="w-full h-full object-contain" />
                  <span className="absolute bottom-2 left-2 bg-slate-900/90 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded">
                    Primary Modality
                  </span>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900/50">
                  <img src={currentImg2} alt="Right" className="w-full h-full object-contain" />
                  <span className="absolute bottom-2 right-2 bg-slate-900/90 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded">
                    Secondary Modality
                  </span>
                </div>
              </div>
            )
          ) : (
            /* Single Image Full Canvas */
            <div className="relative w-full h-full flex items-center justify-center p-2">
              {currentImg1 ? (
                <img src={currentImg1} alt="Remote Sensing Image" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <p className="text-xs text-slate-500">No image loaded.</p>
              )}
              <span className="absolute bottom-3 right-3 bg-slate-900/90 text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded border border-slate-800">
                {activeLayer.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Viewer Footer Status & Controls */}
      {mode !== 'SINGLE' && (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Slide cursor across the canvas to compare observation pairs</span>
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'split' ? 'side-by-side' : 'split')}
            className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
          >
            Switch to {viewMode === 'split' ? 'Side-by-Side View' : 'Split Slider View'}
          </button>
        </div>
      )}
    </div>
  );
}
