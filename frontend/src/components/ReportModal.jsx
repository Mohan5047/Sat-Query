import React from 'react';
import { X, FileText, Download, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getPdfReportUrl, getJsonReportUrl } from '../services/api';

export default function ReportModal({ isOpen, onClose, sessionId, analysisResult }) {
  if (!isOpen || !sessionId) return null;

  const pdfUrl = getPdfReportUrl(sessionId);
  const jsonUrl = getJsonReportUrl(sessionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel-glow w-full max-w-2xl rounded-2xl p-6 border border-cyan-500/30 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Auditable Analytical Report
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Session ID: {sessionId} | Standard: ISRO / SAC Evaluation
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

        {/* Report Summary Details */}
        <div className="space-y-3 text-xs bg-slate-900/70 p-4 rounded-xl border border-slate-800">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400">Classified Task:</span>
            <span className="font-mono text-cyan-300 font-bold">{analysisResult?.task}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="text-slate-400">Model Confidence:</span>
            <span className="font-mono text-emerald-400 font-bold">
              {Math.round((analysisResult?.confidence || 0.95) * 100)}%
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 block font-semibold">Synthesized Summary:</span>
            <p className="text-slate-200 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-850">
              {analysisResult?.text_response}
            </p>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF Report</span>
          </a>

          <a
            href={jsonUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download Raw JSON Data</span>
          </a>
        </div>
      </div>
    </div>
  );
}
