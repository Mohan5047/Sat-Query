import React, { useState } from 'react';
import { Terminal, CheckCircle, Clock, ChevronDown, ChevronUp, Cpu, Server } from 'lucide-react';

export default function ExecutionTrace({ executionTrace }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!executionTrace || !executionTrace.steps) return null;

  const { session_id, selected_task, selected_models, key_parameters, total_latency_ms, overall_confidence, steps } = executionTrace;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 shadow-xl">
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer border-b border-slate-800/80 pb-3"
      >
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Auditable Agentic Execution Trace
          </h3>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            Session: {session_id}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span className="font-mono">{total_latency_ms} ms</span>
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expanded Trace Details */}
      {isExpanded && (
        <div className="space-y-3 pt-1 text-xs">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Classified Task</span>
              <span className="font-mono text-cyan-300 font-bold">{selected_task}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Invoked Specialist Models</span>
              <span className="font-mono text-indigo-300 font-bold">{selected_models.join(', ') || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Configured Parameters</span>
              <span className="font-mono text-emerald-300 truncate block">
                {JSON.stringify(key_parameters)}
              </span>
            </div>
          </div>

          {/* Execution Pipeline Steps Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                  <th className="py-2 px-3">Stage</th>
                  <th className="py-2 px-3">Specialist Tool</th>
                  <th className="py-2 px-3">Observed Action</th>
                  <th className="py-2 px-3 text-right">Latency</th>
                  <th className="py-2 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {steps.map((step, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-2 px-3 font-mono text-cyan-400 font-semibold">{step.stage}</td>
                    <td className="py-2 px-3 font-bold text-slate-200">{step.tool_name}</td>
                    <td className="py-2 px-3 text-slate-300">{step.description}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-400">{step.execution_time_ms} ms</td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        <CheckCircle className="w-2.5 h-2.5" />
                        <span>{step.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
