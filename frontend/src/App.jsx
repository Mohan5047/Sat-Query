import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InputPanel from './components/InputPanel';
import ImageViewer from './components/ImageViewer';
import ChatInterface from './components/ChatInterface';
import EvidenceViewer from './components/EvidenceViewer';
import ExecutionTrace from './components/ExecutionTrace';
import ReportModal from './components/ReportModal';
import ToolsModal from './components/ToolsModal';
import { getSamples, getTools, analyzeQuery } from './services/api';

export default function App() {
  const [samples, setSamples] = useState([]);
  const [tools, setTools] = useState([]);
  const [selectedSample, setSelectedSample] = useState(null);
  const [mode, setMode] = useState('SINGLE'); // 'SINGLE', 'BITEMPORAL', 'CROSSMODAL'
  
  // Custom file upload state
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [file1Preview, setFile1Preview] = useState(null);
  const [file2Preview, setFile2Preview] = useState(null);

  // Analysis & Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Modal states
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  // Load initial benchmark samples and tool registry
  useEffect(() => {
    getSamples()
      .then((data) => {
        if (data.samples && data.samples.length > 0) {
          setSamples(data.samples);
          // Default select the first sample
          const first = data.samples.find((s) => s.mode === 'SINGLE') || data.samples[0];
          setSelectedSample(first);
          setFile1Preview(first.image1_preview);
          setFile2Preview(first.image2_preview);
        }
      })
      .catch((err) => console.error('Failed to load benchmark samples:', err));

    getTools()
      .then((data) => {
        if (data.tools) setTools(data.tools);
      })
      .catch((err) => console.error('Failed to load tool registry:', err));
  }, []);

  const handleSelectSample = (sample) => {
    setSelectedSample(sample);
    if (sample) {
      setFile1(null);
      setFile2(null);
      setFile1Preview(sample.image1_preview);
      setFile2Preview(sample.image2_preview);
      setMode(sample.mode);
    }
  };

  const handleExecuteQuery = async (queryText) => {
    if (!queryText) return;

    // Add user message to chat
    setChatHistory((prev) => [...prev, { role: 'user', content: queryText }]);
    setIsLoading(true);

    try {
      const payload = {
        query: queryText,
        pairMode: mode !== 'SINGLE' ? mode : undefined,
        sampleImage1Path: selectedSample ? selectedSample.image1_path : undefined,
        sampleImage2Path: selectedSample ? selectedSample.image2_path : undefined,
        file1: file1 || undefined,
        file2: file2 || undefined,
      };

      const result = await analyzeQuery(payload);
      setAnalysisResult(result);

      const sessionId = result.execution_trace?.session_id || 'active';
      setCurrentSessionId(sessionId);

      // Add agent response to chat
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'agent',
          content: result.text_response,
          meta: result,
        },
      ]);
    } catch (error) {
      console.error('Analysis error:', error);
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'agent',
          content: `Analysis Error: ${error.message || 'Failed to process remote sensing query.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b19]">
      <Header
        onOpenTools={() => setIsToolsOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        hasReport={!!currentSessionId}
        sessionId={currentSessionId}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Top Section: Observation Modality & Uploader */}
        <InputPanel
          samples={samples}
          selectedSample={selectedSample}
          onSelectSample={handleSelectSample}
          mode={mode}
          setMode={setMode}
          file1={file1}
          setFile1={setFile1}
          file2={file2}
          setFile2={setFile2}
          file1Preview={file1Preview}
          setFile1Preview={setFile1Preview}
          file2Preview={file2Preview}
          setFile2Preview={setFile2Preview}
        />

        {/* Middle Section: Dual Geospatial Canvas + Conversational Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ImageViewer
              mode={mode}
              image1Preview={file1Preview}
              image2Preview={file2Preview}
              analysisResult={analysisResult}
              isLoading={isLoading}
            />
          </div>
          <div className="lg:col-span-5">
            <ChatInterface
              suggestedQueries={selectedSample?.suggested_queries}
              onExecuteQuery={handleExecuteQuery}
              chatHistory={chatHistory}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Bottom Section: Evidence Grounding & Auditable Trace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <EvidenceViewer analysisResult={analysisResult} />
          </div>
          <div className="lg:col-span-6">
            <ExecutionTrace executionTrace={analysisResult?.execution_trace} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        sessionId={currentSessionId}
        analysisResult={analysisResult}
      />

      <ToolsModal
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
        tools={tools}
      />
    </div>
  );
}
