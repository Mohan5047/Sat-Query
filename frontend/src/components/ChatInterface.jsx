import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, Bot, User, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ChatInterface({
  suggestedQueries,
  onExecuteQuery,
  chatHistory,
  isLoading
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onExecuteQuery(inputText.trim());
    setInputText('');
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col h-[520px] shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Conversational Agentic Interface
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
          Query-Driven Multi-Model Dispatch
        </span>
      </div>

      {/* Suggested Quick Queries Pills */}
      {suggestedQueries && suggestedQueries.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5 font-medium">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Representative Problem Queries:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQueries.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onExecuteQuery(q)}
                disabled={isLoading}
                className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition truncate max-w-full"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message History Container */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2 p-4">
            <Bot className="w-10 h-10 text-slate-600 animate-bounce" />
            <p className="font-semibold text-slate-400">
              SatQuery AI Assistant Ready
            </p>
            <p className="text-[11px] max-w-sm">
              Type a natural-language remote sensing query or select a representative query above to analyze single or paired imagery.
            </p>
          </div>
        ) : (
          chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'agent' && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`rounded-2xl p-3.5 max-w-[85%] space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-md shadow-cyan-600/10'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-md'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {/* Metadata Badge for Agent Responses */}
                {msg.role === 'agent' && msg.meta && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <span className="font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/50">
                      Task: {msg.meta.task}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{Math.round(msg.meta.confidence * 100)}% Confidence</span>
                    </span>
                    {msg.meta.execution_trace?.total_latency_ms && (
                      <span className="text-slate-500 font-mono">
                        {msg.meta.execution_trace.total_latency_ms} ms
                      </span>
                    )}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-cyan-400 bg-slate-900/60 p-3 rounded-xl border border-cyan-500/20 w-fit">
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Agent orchestrating remote-sensing specialist models...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a query (e.g. 'Describe land cover', 'What changed between dates?', 'Highlight water body')..."
          disabled={isLoading}
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
