'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Monaco Editor without SSR
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] text-gray-400">
      <div className="animate-pulse flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
        <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
        <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
        <span className="ml-2">Loading Editor...</span>
      </div>
    </div>
  )
});

export default function CandidateCloudIDE() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [code, setCode] = useState('// Write your solution here\n\nfunction solve() {\n  \n}');
  const [telemetryBatch, setTelemetryBatch] = useState<any[]>([]);
  const batchSequence = useRef(0);

  // 1. Initialize the Session
  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch('/api/v1/talent/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            candidateId: 'mock-candidate-id', 
            assessmentVersionId: 'mock-assessment-version' 
          })
        });
        const json = await res.json();
        if (json.success && json.data.id) {
          setSessionId(json.data.id);
        }
      } catch (e) {
        console.error("Failed to initialize session", e);
      }
    }
    initSession();
  }, []);

  // 2. Telemetry Batching Loop (Every 5 seconds)
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      if (telemetryBatch.length === 0) return;

      const eventsToSend = [...telemetryBatch];
      setTelemetryBatch([]); // Clear current batch

      try {
        await fetch(`/api/v1/talent/sessions/${sessionId}/telemetry`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sequence: batchSequence.current++,
            events: eventsToSend
          })
        });
        console.log(`[Telemetry] Flushed batch ${batchSequence.current - 1} (${eventsToSend.length} events)`);
      } catch (e) {
        console.error("Failed to flush telemetry", e);
        // Ideally we would push them back to the queue for retry
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [sessionId, telemetryBatch]);

  // Telemetry Tracker
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) setCode(value);
    
    // Capture basic keystroke event
    setTelemetryBatch(prev => [...prev, {
      type: 'editor_change',
      timestamp: new Date().toISOString(),
      length: value?.length || 0
    }]);
  };

  // Execution State
  const [isExecuting, setIsExecuting] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalOutput]);

  const handleRunCode = async () => {
    if (!sessionId) return;
    setIsExecuting(true);
    setTerminalOutput(['[SYSTEM] Allocating sandbox environment...']);

    try {
      // 1. Submit Execution Job
      const res = await fetch('/api/v1/talent/executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          language: 'javascript',
          code
        })
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to submit job');
      }

      const jobId = json.data.id;
      setTerminalOutput(prev => [...prev, `[SYSTEM] Job ${jobId} queued. Connecting to execution stream...`]);

      // 2. Connect to SSE Stream
      const eventSource = new EventSource(`/api/v1/talent/executions/${jobId}/stream`);

      eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data);
        
        if (data.type === 'stdout' || data.type === 'stderr') {
          setTerminalOutput(prev => [...prev, data.data]);
        } else if (data.type === 'status') {
          setTerminalOutput(prev => [...prev, `[SYSTEM] Status changed to: ${data.status}`]);
        } else if (data.type === 'result') {
          setTerminalOutput(prev => [...prev, `\n[SYSTEM] Process exited with code ${data.exitCode}`]);
          setIsExecuting(false);
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        setTerminalOutput(prev => [...prev, '[SYSTEM] Connection to execution stream lost.']);
        setIsExecuting(false);
        eventSource.close();
      };

    } catch (e: any) {
      setTerminalOutput(prev => [...prev, `[ERROR] ${e.message}`]);
      setIsExecuting(false);
    }
  };

  const handleFocus = () => {
    setTelemetryBatch(prev => [...prev, { type: 'editor_focus', timestamp: new Date().toISOString() }]);
  };

  const handleBlur = () => {
    setTelemetryBatch(prev => [...prev, { type: 'editor_blur', timestamp: new Date().toISOString() }]);
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      
      {/* LEFT PANE: Instructions & Modules */}
      <div className="w-1/3 border-r border-[#222] bg-[#111] flex flex-col">
        <div className="p-4 border-b border-[#222] bg-[#1a1a1a] flex justify-between items-center">
          <h1 className="font-semibold text-gray-200">Assessment Instructions</h1>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${sessionId ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-400 font-mono">{sessionId ? 'CONNECTED' : 'CONNECTING...'}</span>
          </div>
        </div>
        <div className="p-6 flex-1 overflow-y-auto prose prose-invert">
          <h3>Task: Two Sum</h3>
          <p>
            Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
          </p>
          <p>
            You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.
          </p>
          <div className="mt-8 p-4 bg-[#1e1e1e] rounded border border-[#333]">
            <strong>Example 1:</strong><br/>
            <code>Input: nums = [2,7,11,15], target = 9</code><br/>
            <code>Output: [0,1]</code>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Cloud IDE */}
      <div className="w-2/3 flex flex-col">
        <div className="bg-[#1e1e1e] border-b border-[#333] px-4 py-2 flex items-center justify-between">
          <div className="flex gap-1">
            <div className="px-4 py-1 bg-[#2d2d2d] text-sm text-gray-300 rounded-t border-t border-l border-r border-[#444] cursor-pointer">
              solution.js
            </div>
            <div className="px-4 py-1 text-sm text-gray-500 cursor-pointer hover:bg-[#252525] rounded-t">
              tests.js
            </div>
          </div>
          <button 
            onClick={handleRunCode}
            disabled={isExecuting || !sessionId}
            className={`text-white text-xs font-bold px-4 py-1.5 rounded transition-colors flex items-center gap-2 ${isExecuting ? 'bg-gray-600' : 'bg-emerald-600 hover:bg-emerald-500'}`}
          >
            {isExecuting ? (
              <span className="animate-pulse">EXECUTING...</span>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                RUN TESTS
              </>
            )}
          </button>
        </div>
        
        {/* Editor Area (Top Half) */}
        <div className="flex-[2] relative" onFocus={handleFocus} onBlur={handleBlur}>
          <MonacoEditor
            height="100%"
            language="javascript"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'Consolas, "Courier New", monospace',
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
            }}
          />
        </div>

        {/* Terminal Area (Bottom Half) */}
        <div className="flex-[1] bg-[#111] border-t border-[#333] flex flex-col">
          <div className="bg-[#1a1a1a] border-b border-[#222] px-4 py-1 flex items-center">
            <span className="text-xs font-semibold text-gray-400">TERMINAL OUTPUT</span>
          </div>
          <div 
            ref={terminalRef}
            className="flex-1 p-4 font-mono text-sm overflow-y-auto text-gray-300 whitespace-pre-wrap"
          >
            {terminalOutput.map((line, i) => (
              <span key={i} className={line.startsWith('[ERROR]') ? 'text-red-400' : line.startsWith('[SYSTEM]') ? 'text-blue-400' : ''}>
                {line}
              </span>
            ))}
            {terminalOutput.length === 0 && (
              <div className="text-gray-600 italic">No output. Press Run Tests to execute your code.</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
