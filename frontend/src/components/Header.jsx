import React from 'react';
import { Satellite, Cpu, ShieldCheck, Download, Sparkles, BookOpen } from 'lucide-react';

export default function Header({ onOpenTools, onOpenReport, hasReport, sessionId }) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-cyan-500/20 px-6 py-3.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Theme */}
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
              <Satellite className="w-6 h-6 text-white animate-pulse" />
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                SatQuery AI
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Agentic VLM v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <span className="text-orange-400 font-semibold">ISRO / SAC Space Technology</span>
              <span>•</span>
              <span>Multimodal Remote Sensing Vision-Language Assistant</span>
            </p>
          </div>
        </div>

        {/* Status Indicators & Action Bar */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="font-mono">BigEarthNet Adapted</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1 text-cyan-400">
              <Cpu className="w-3.5 h-3.5" />
              <span className="font-mono">GeoTIFF Engine</span>
            </div>
          </div>

          <button
            onClick={onOpenTools}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition hover:border-cyan-500/40"
            title="View Registered Specialist RS Models"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tools Registry</span>
          </button>

          {hasReport && (
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
