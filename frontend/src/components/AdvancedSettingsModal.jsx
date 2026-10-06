import React, { useState } from 'react';
import {
  X, Settings, Cpu, Radio, RotateCcw, Check, Sparkles, Sliders,
  Layers, Crosshair, Palette, Target, Waves, Building2, TreePine, Satellite, ShieldCheck
} from 'lucide-react';
import { MISSION_PRESETS, DEFAULT_ADVANCED_SETTINGS } from '../data/defaultSettings';

export default function AdvancedSettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) {
  const [activeTab, setActiveTab] = useState('presets'); // 'presets', 'agent', 'sar', 'change', 'grounding'
  const [localSettings, setLocalSettings] = useState(settings || DEFAULT_ADVANCED_SETTINGS);

  if (!isOpen) return null;

  const handlePresetSelect = (preset) => {
    const updated = {
      ...preset.settings,
      activePresetId: preset.id
    };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleFieldChange = (key, value) => {
    const updated = {
      ...localSettings,
      [key]: value,
      activePresetId: 'custom'
    };
    setLocalSettings(updated);
    onUpdateSettings(updated);
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_ADVANCED_SETTINGS);
    onUpdateSettings(DEFAULT_ADVANCED_SETTINGS);
  };

  const currentPresetName = MISSION_PRESETS.find(p => p.id === localSettings.activePresetId)?.name || 'Custom Configuration';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel-glow w-full max-w-4xl max-h-[90vh] rounded-2xl border border-cyan-500/30 flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
              <Settings className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-wide text-slate-100">
                  Advanced Engine & Sensor Settings
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-bold">
                  {currentPresetName}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Calibrate remote sensing specialist algorithms, SAR thresholds, and agentic orchestration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Mission Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('agent')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'agent'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>AI Orchestration & VLM</span>
          </button>

          <button
            onClick={() => setActiveTab('sar')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sar'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4 text-indigo-400" />
            <span>Optical–SAR Fusion</span>
          </button>

          <button
            onClick={() => setActiveTab('change')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'change'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-rose-400" />
            <span>Bi-Temporal CVA</span>
          </button>

          <button
            onClick={() => setActiveTab('grounding')}
            className={`py-3 px-3.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'grounding'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Grounding & Visuals</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-200">
          
          {/* TAB 1: MISSION PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>Preconfigured Satellite Mission Scenarios</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Instantly tune optical spectral weights, radar backscatter thresholds, and CVA change sensitivity for specific operational domains.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {MISSION_PRESETS.map((p) => {
                  const isSelected = localSettings.activePresetId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handlePresetSelect(p)}
                      className={`cursor-pointer rounded-xl p-4 border transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-100 text-sm flex items-center gap-2">
                            {p.name}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                          {p.description}
                        </p>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="text-cyan-400">{p.badge}</span>
                        <span className="text-slate-500">CVA: {p.settings.change_percentile}% | Opt/SAR: {Math.round(p.settings.optical_weight*100)}/{Math.round(p.settings.sar_weight*100)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: AI ORCHESTRATION & VLM */}
          {activeTab === 'agent' && (
            <div className="space-y-5">
              {/* Forced Tool Routing Override */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-100 block text-xs">Orchestration Mode</span>
                    <span className="text-slate-400 text-[11px]">
                      Allow autonomous query classification or force a specific specialist tool pipeline.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {localSettings.forced_tool === 'AUTO' ? 'Auto-Orchestrating' : 'Enforced Tool'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'AUTO', label: '🤖 Auto Agentic Routing' },
                    { id: 'SINGLE_VQA', label: '❓ Force RS-VQA' },
                    { id: 'SINGLE_CAPTION', label: '📝 Force Scene Caption' },
                    { id: 'SINGLE_GROUNDING', label: '🎯 Force Region Grounding' },
                    { id: 'BITEMPORAL_CHANGE', label: '🔄 Force Change CVA' },
                    { id: 'CROSSMODAL_FUSION', label: '📡 Force Optical-SAR' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleFieldChange('forced_tool', item.id)}
                      className={`py-2 px-2.5 rounded-lg border text-[11px] font-semibold transition text-left truncate ${
                        localSettings.forced_tool === item.id
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vision-Language Backbone */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-100 block text-xs">Domain Representation Backbone</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'bigearthnet', label: 'BigEarthNet-Adapted', desc: 'Corine 19-class multispectral & SAR representations' },
                    { id: 'remoteclip', label: 'RemoteCLIP Embeddings', desc: 'Deep vision-language RS semantic space' },
                    { id: 'geochat_vlm', label: 'GeoChat Multi-task', desc: 'Adapted multi-sensor spatial reasoning' }
                  ].map((bb) => (
                    <div
                      key={bb.id}
                      onClick={() => handleFieldChange('rs_backbone', bb.id)}
                      className={`cursor-pointer p-3 rounded-lg border transition ${
                        localSettings.rs_backbone === bb.id
                          ? 'bg-cyan-950/40 border-cyan-500/60 text-slate-100'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold block text-[11px] text-cyan-300">{bb.label}</span>
                      <span className="text-[10px] text-slate-400 mt-1 block leading-tight">{bb.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Granularity & Confidence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-100 block text-xs">Response Style</span>
                  <select
                    value={localSettings.response_style}
                    onChange={(e) => handleFieldChange('response_style', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="technical_scientific">Technical & Scientific (Band Math, GSD, Radar dB)</option>
                    <option value="standard">Standard Analytical</option>
                    <option value="concise_executive">Concise Executive Brief</option>
                  </select>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-100 text-xs">Minimum Confidence Gate</span>
                    <span className="font-mono text-cyan-400 font-bold">{Math.round(localSettings.min_confidence * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={Math.round(localSettings.min_confidence * 100)}
                    onChange={(e) => handleFieldChange('min_confidence', Number(e.target.value) / 100)}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>50% (Permissive)</span>
                    <span>85% (Optimal)</span>
                    <span>99% (Strict)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OPTICAL-SAR FUSION */}
          {activeTab === 'sar' && (
            <div className="space-y-5">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
                <div>
                  <h4 className="font-bold text-slate-100 text-xs">Cross-Modal Sensor Fusion Blend Ratio</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Modulate the spectral color dominance vs synthetic aperture radar microwave penetration in the composite visualization.
                  </p>
                </div>

                <div className="space-y-2 bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="flex justify-between font-mono text-xs font-bold">
                    <span className="text-cyan-400">Optical: {Math.round(localSettings.optical_weight * 100)}%</span>
                    <span className="text-indigo-400">SAR Radar: {Math.round(localSettings.sar_weight * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(localSettings.optical_weight * 100)}
                    onChange={(e) => {
                      const opt = Number(e.target.value) / 100;
                      const sar = 1.0 - opt;
                      handleFieldChange('optical_weight', Number(opt.toFixed(2)));
                      handleFieldChange('sar_weight', Number(sar.toFixed(2)));
                    }}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>100% Optical Reflectance</span>
                    <span>Balanced 50/50</span>
                    <span>100% SAR Backscatter</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-100 text-xs">SAR Speckle Filter</span>
                  <select
                    value={localSettings.speckle_filter}
                    onChange={(e) => handleFieldChange('speckle_filter', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="none">Raw (No filter)</option>
                    <option value="lee">Lee Spatial Filter (3x3 Adaptive)</option>
                    <option value="frost">Frost Exponential Filter</option>
                    <option value="median">Median Speckle Filter</option>
                  </select>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-100 text-xs">Radar Amplitude Scaling</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFieldChange('sar_scale', 'db')}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                        localSettings.sar_scale === 'db'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Logarithmic (dB scale)
                    </button>
                    <button
                      onClick={() => handleFieldChange('sar_scale', 'linear')}
                      className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                        localSettings.sar_scale === 'linear'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      Linear Intensity
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BI-TEMPORAL CHANGE DETECTION */}
          {activeTab === 'change' && (
            <div className="space-y-5">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-100 text-xs">Change Vector Analysis (CVA) Sensitivity</span>
                    <p className="text-slate-400 text-[11px]">
                      Percentile threshold for classifying spatial difference magnitude as valid surface change.
                    </p>
                  </div>
                  <span className="font-mono text-rose-400 text-sm font-black">{localSettings.change_percentile}th %</span>
                </div>

                <input
                  type="range"
                  min="60"
                  max="95"
                  value={localSettings.change_percentile}
                  onChange={(e) => handleFieldChange('change_percentile', Number(e.target.value))}
                  className="w-full accent-rose-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>60% (High Recall / More Sensitive)</span>
                  <span>80% (Balanced Baseline)</span>
                  <span>95% (High Precision / Extreme Change Only)</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-100 text-xs">Continuous Change Heatmap Colormap</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'inferno', label: 'Inferno', preview: 'from-black via-purple-600 to-yellow-400' },
                    { id: 'turbo', label: 'Turbo', preview: 'from-blue-600 via-green-500 to-red-600' },
                    { id: 'jet', label: 'Jet', preview: 'from-blue-700 via-yellow-400 to-red-600' },
                    { id: 'magma', label: 'Magma', preview: 'from-black via-pink-600 to-amber-200' },
                    { id: 'viridis', label: 'Viridis', preview: 'from-indigo-900 via-teal-500 to-yellow-400' }
                  ].map((cmItem) => (
                    <div
                      key={cmItem.id}
                      onClick={() => handleFieldChange('change_colormap', cmItem.id)}
                      className={`cursor-pointer p-2.5 rounded-lg border text-center transition ${
                        localSettings.change_colormap === cmItem.id
                          ? 'bg-rose-950/40 border-rose-500/60 text-rose-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className={`w-full h-3 rounded-full bg-gradient-to-r ${cmItem.preview} mb-1.5`} />
                      <span className="text-[11px] block">{cmItem.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GROUNDING & VISUALS */}
          {activeTab === 'grounding' && (
            <div className="space-y-5">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-100 text-xs">Text-Guided Bounding Box Highlight Color</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'gold', label: 'Solar Gold', color: '#ffb703', border: 'border-amber-400' },
                    { id: 'cyan', label: 'Cyber Cyan', color: '#00f5d4', border: 'border-cyan-400' },
                    { id: 'emerald', label: 'Radar Emerald', color: '#06d6a0', border: 'border-emerald-400' },
                    { id: 'crimson', label: 'Thermal Crimson', color: '#ef233c', border: 'border-rose-400' }
                  ].map((col) => (
                    <div
                      key={col.id}
                      onClick={() => handleFieldChange('box_color', col.id)}
                      className={`cursor-pointer p-3 rounded-lg border flex items-center gap-2.5 transition ${
                        localSettings.box_color === col.id
                          ? 'bg-slate-900 border-cyan-400 text-slate-100 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: col.color }} />
                      <span className="font-semibold text-xs">{col.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-100 text-xs">Intersection-over-Union (IoU) Gate</span>
                    <span className="font-mono text-cyan-400 font-bold">{localSettings.iou_threshold}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={Math.round(localSettings.iou_threshold * 100)}
                    onChange={(e) => handleFieldChange('iou_threshold', Number(e.target.value) / 100)}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.20 (High Recall)</span>
                    <span>0.50 (Standard)</span>
                    <span>0.80 (Strict)</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="font-bold text-slate-100 text-xs block">Geospatial Coordinate Crosshair</span>
                    <span className="text-slate-400 text-[11px]">Display live [X, Y] pixel coordinates when hovering over imagery.</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <input
                      type="checkbox"
                      checked={localSettings.coordinate_crosshair}
                      onChange={(e) => handleFieldChange('coordinate_crosshair', e.target.checked)}
                      className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-200">Enable Interactive Coordinate Crosshair</span>
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition py-1 px-2 rounded hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
            >
              Apply & Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
