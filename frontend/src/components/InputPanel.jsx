import React, { useState } from 'react';
import { Layers, UploadCloud, FileSpreadsheet, Compass, CheckCircle2, AlertCircle } from 'lucide-react';

export default function InputPanel({
  samples,
  selectedSample,
  onSelectSample,
  mode,
  setMode,
  file1,
  setFile1,
  file2,
  setFile2,
  file1Preview,
  setFile1Preview,
  file2Preview,
  setFile2Preview
}) {
  const [activeTab, setActiveTab] = useState('samples'); // 'samples' or 'upload'

  const handleFileChange = (e, fileIndex) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (fileIndex === 1) {
        setFile1(file);
        setFile1Preview(event.target.result);
        onSelectSample(null);
      } else {
        setFile2(file);
        setFile2Preview(event.target.result);
        onSelectSample(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
      {/* Configuration Mode Selector */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Observation Modality
          </h2>
        </div>
        
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => { setMode('SINGLE'); if (selectedSample?.mode !== 'SINGLE') onSelectSample(samples.find(s => s.mode === 'SINGLE')); }}
            className={`px-3 py-1.5 rounded-lg transition ${mode === 'SINGLE' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Single Optical / SAR
          </button>
          <button
            onClick={() => { setMode('BITEMPORAL'); onSelectSample(samples.find(s => s.mode === 'BITEMPORAL')); }}
            className={`px-3 py-1.5 rounded-lg transition ${mode === 'BITEMPORAL' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Bi-Temporal Pair (T1 & T2)
          </button>
          <button
            onClick={() => { setMode('CROSSMODAL'); onSelectSample(samples.find(s => s.mode === 'CROSSMODAL')); }}
            className={`px-3 py-1.5 rounded-lg transition ${mode === 'CROSSMODAL' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Cross-Modal (Optical + SAR)
          </button>
        </div>
      </div>

      {/* Input Source Tabs: Benchmark Samples vs Custom Upload */}
      <div className="flex items-center justify-between text-xs font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('samples')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'samples' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Benchmark Dataset Samples</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'upload' ? 'bg-slate-800 text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload GeoTIFF / TIFF</span>
          </button>
        </div>
      </div>

      {/* Benchmark Samples Catalog */}
      {activeTab === 'samples' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {samples
            .filter((s) => s.mode === mode)
            .map((sample) => {
              const isSelected = selectedSample?.id === sample.id;
              return (
                <div
                  key={sample.id}
                  onClick={() => onSelectSample(sample)}
                  className={`cursor-pointer rounded-xl p-3 border transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                        {sample.name}
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 inline" />}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {sample.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60 pt-2">
                    <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded text-cyan-300">
                      {sample.category}
                    </span>
                    <span className="text-slate-500">
                      {sample.suggested_queries.length} Suggested Queries
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Custom File Upload Drag & Drop Area */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* File 1 / Primary Upload */}
          <div className="border border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-4 text-center bg-slate-900/40 transition flex flex-col items-center justify-center">
            <UploadCloud className="w-8 h-8 text-cyan-400 mb-2" />
            <span className="text-xs font-bold text-slate-200">
              {mode === 'SINGLE' ? 'Primary Raster (Optical or SAR)' : (mode === 'BITEMPORAL' ? 'T1 Pre-Event Image' : 'Optical / Multispectral Image')}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">GeoTIFF, TIFF, PNG, or JPEG</span>
            <label className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer transition">
              Browse File 1
              <input type="file" accept=".tif,.tiff,.geotiff,.png,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 1)} className="hidden" />
            </label>
            {file1 && <span className="text-[11px] text-emerald-400 mt-2 font-mono truncate max-w-full">✓ {file1.name}</span>}
          </div>

          {/* File 2 / Secondary Upload (If Paired) */}
          {mode !== 'SINGLE' ? (
            <div className="border border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-4 text-center bg-slate-900/40 transition flex flex-col items-center justify-center">
              <UploadCloud className="w-8 h-8 text-indigo-400 mb-2" />
              <span className="text-xs font-bold text-slate-200">
                {mode === 'BITEMPORAL' ? 'T2 Post-Event Image' : 'Co-registered SAR Image'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">GeoTIFF, TIFF, PNG, or JPEG</span>
              <label className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer transition">
                Browse File 2
                <input type="file" accept=".tif,.tiff,.geotiff,.png,.jpg,.jpeg" onChange={(e) => handleFileChange(e, 2)} className="hidden" />
              </label>
              {file2 && <span className="text-[11px] text-emerald-400 mt-2 font-mono truncate max-w-full">✓ {file2.name}</span>}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-xl p-4 bg-slate-900/20 border border-slate-800 text-center text-xs text-slate-500">
              Single-Image mode active. Secondary image not required.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
