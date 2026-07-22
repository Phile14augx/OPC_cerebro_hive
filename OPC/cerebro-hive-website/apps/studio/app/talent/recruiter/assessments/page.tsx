'use client';

import React, { useState, useEffect } from 'react';

export default function AssessmentStudio() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [lastTraceId, setLastTraceId] = useState('');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/talent/assessments');
      const json = await res.json();
      
      if (json.success) {
        setAssessments(json.data);
        setLastTraceId(json.traceId);
      } else {
        setError(json.error || 'Failed to fetch assessments');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    try {
      setError('');
      const res = await fetch('/api/v1/talent/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, workspaceId: 'mock-workspace-id' })
      });
      
      const json = await res.json();
      setLastTraceId(json.traceId);
      
      if (json.success) {
        setTitle('');
        fetchAssessments(); // Refresh list
      } else {
        setError(json.error || 'Failed to create assessment');
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-[#0a0a0a] min-h-screen text-white font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Assessment Studio
        </h1>
        {lastTraceId && (
          <div className="text-xs text-gray-500 font-mono bg-[#111] p-2 rounded border border-[#222]">
            Latest Trace ID: {lastTraceId}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Create Form */}
        <div className="col-span-1 bg-[#151515] p-6 rounded-xl border border-[#222] shadow-2xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">New Assessment</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g., Senior Full-Stack Engineer"
              />
            </div>
            <button 
              type="submit"
              disabled={!title}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2 px-4 rounded transition-all"
            >
              Create Draft
            </button>
          </form>
        </div>

        {/* Assessment List */}
        <div className="col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-gray-200">Your Assessments</h2>
          {loading ? (
            <div className="text-gray-500 animate-pulse">Loading...</div>
          ) : assessments.length === 0 ? (
            <div className="text-gray-500 p-8 border border-dashed border-[#333] rounded-xl text-center">
              No assessments found. Create one to get started.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {assessments.map((a: any) => (
                <div key={a.id} className="bg-[#151515] p-5 rounded-xl border border-[#222] hover:border-[#444] transition-all flex justify-between items-center group">
                  <div>
                    <h3 className="font-medium text-lg text-gray-200">{a.title}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${a.status === 'draft' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                        {a.status.toUpperCase()}
                      </span>
                      <span>ID: <span className="font-mono">{a.id.split('-')[0]}...</span></span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-[#222] hover:bg-[#333] rounded text-sm font-medium">
                    Edit Schema
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
