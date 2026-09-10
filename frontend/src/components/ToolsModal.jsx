import React from 'react';
import { X, BookOpen, Cpu, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function ToolsModal({ isOpen, onClose, tools }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel-glow w-full max-w-3xl rounded-2xl p-6 border border-cyan-500/30 space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Specialist Remote-Sensing Model Registry
              </h3>
              <p className="text-[11px] text-slate-400">
                Predefined domain-adapted tools orchestrated dynamically by SatQuery AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tools List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {tools && tools.length > 0 ? (
            tools.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2 hover:border-cyan-500/40 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 inline" />
                    {t.name}
                  </span>
                  <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    {t.type}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{t.description}</p>
                {t.permitted_params && (
                  <div className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-850">
                    <span className="text-slate-500 font-bold">Permitted Parameters: </span>
                    {t.permitted_params.join(', ')}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">Loading specialist models...</p>
          )}
        </div>
      </div>
    </div>
  );
}
