import React from 'react';
import { BarChart3, Target, ShieldCheck, Zap, PieChart, Activity } from 'lucide-react';

export default function EvidenceViewer({ analysisResult }) {
  if (!analysisResult) {
    return (
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 text-center text-slate-500 text-xs flex flex-col items-center justify-center h-48">
        <Activity className="w-8 h-8 text-slate-600 mb-2" />
        <p>No query executed yet.</p>
        <p className="text-[11px] text-slate-600">Run a query to view extracted remote-sensing evidence and quantitative metrics.</p>
      </div>
    );
  }

  const quant = analysisResult.quantitative_metrics || {};
  const spatial = analysisResult.spatial_grounding || {};
  const conf = analysisResult.confidence || 0.95;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Evidence Grounding & Quantitative Metrics
          </h3>
        </div>
        
        {/* Calibrated Confidence Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold">
          <span className="text-slate-400">Model Confidence:</span>
          <span className={`font-mono ${conf >= 0.9 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {Math.round(conf * 100)}% ({analysisResult.confidence_level || 'High'})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Land-Cover Distributions */}
        {quant.land_cover_distribution && (
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-cyan-400" />
              <span>BigEarthNet Land-Cover Breakdown</span>
            </h4>
            <div className="space-y-2 pt-1">
              {quant.land_cover_distribution.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300 truncate max-w-[200px]">{item.class}</span>
                    <span className="font-mono text-cyan-400 font-bold">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bi-Temporal Change Metrics */}
        {quant.change_percentage !== undefined && (
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span>Multi-Temporal Change Dynamics</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Area Changed</span>
                <span className="text-lg font-black text-rose-400 font-mono">
                  {quant.change_percentage}%
                </span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Modified Pixels</span>
                <span className="text-lg font-black text-cyan-400 font-mono">
                  {quant.changed_pixels?.toLocaleString()}
                </span>
              </div>
            </div>
            {quant.semantics && (
              <div className="text-[11px] text-slate-300 space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <p><b className="text-slate-400">Dominant Dynamic:</b> {quant.semantics.dominant_change_type}</p>
                <p><b className="text-slate-400">Urban Fabric:</b> {quant.semantics.urban_trend}</p>
                <p><b className="text-slate-400">Vegetation Canopy:</b> {quant.semantics.vegetation_trend}</p>
              </div>
            )}
          </div>
        )}

        {/* Cross-Modal Optical-SAR Complementary Breakdown */}
        {quant.land_cover_percentages && (
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cross-Modal Fused Extraction</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Built-up</span>
                <span className="text-sm font-black text-rose-400 font-mono">
                  {quant.land_cover_percentages.built_up_percentage}%
                </span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Water Body</span>
                <span className="text-sm font-black text-blue-400 font-mono">
                  {quant.land_cover_percentages.water_percentage}%
                </span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Vegetation</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {quant.land_cover_percentages.vegetation_percentage}%
                </span>
              </div>
            </div>
            {quant.complementary_insights && (
              <div className="space-y-1 pt-1">
                {quant.complementary_insights.map((ins, i) => (
                  <p key={i} className="text-[11px] text-slate-300">
                    <b className="text-cyan-400">{ins.modality}:</b> {ins.contribution}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Text-Guided Grounded Detections */}
        {spatial.detections && spatial.detections.length > 0 && (
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>Grounded Spatial Regions ({spatial.detections.length})</span>
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
              {spatial.detections.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-[11px]"
                >
                  <span className="text-slate-300">
                    #{d.id} {d.label || spatial.target_entity}
                  </span>
                  <span className="font-mono text-cyan-400 font-semibold">
                    BBox: [{d.bbox?.join(', ')}]
                  </span>
                  <span className="text-emerald-400 font-bold">{Math.round(d.confidence * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
