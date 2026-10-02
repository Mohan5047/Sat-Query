import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SatQuery UI caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b19] flex items-center justify-center p-6 text-slate-100">
          <div className="glass-panel-glow max-w-lg w-full p-8 rounded-2xl border border-rose-500/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/40">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">
              Application Interface Notice
            </h2>
            <p className="text-xs text-slate-400">
              The application encountered a transient interface state. You can reload to restore full satellite analysis functionality.
            </p>
            <div className="text-[11px] font-mono text-rose-400 bg-slate-950 p-3 rounded border border-slate-800 text-left overflow-x-auto">
              {this.state.error?.message || 'Unknown render error'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload SatQuery Interface</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
