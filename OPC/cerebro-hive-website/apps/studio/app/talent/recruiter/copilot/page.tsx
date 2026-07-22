'use client';

import React, { useState, useEffect } from 'react';

export default function CopilotDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/v1/talent/copilot?projectId=mock-backend-role');
        const json = await res.json();
        if (json.success) {
          setCandidates(json.data);
          if (json.data.length > 0) setSelectedCandidate(json.data[0]);
        }
      } catch (e) {
        console.error("Failed to load copilot insights", e);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-[#222] pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Workforce Intelligence Copilot
            </h1>
            <p className="text-gray-400 mt-2">AI-Driven Semantic Matching for: <span className="text-white font-medium">Senior Backend Engineer</span></p>
          </div>
          <button className="px-4 py-2 bg-[#222] hover:bg-[#333] border border-[#444] rounded text-sm transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            Adjust Target Profile
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500 animate-pulse text-xl">Analyzing skill graphs...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Candidate List (Ranking) */}
            <div className="col-span-1 space-y-4">
              <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <span className="bg-blue-900/30 text-blue-400 p-1 rounded">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </span>
                Ranked Matches
              </h2>
              {candidates.map((c: any, index: number) => (
                <div 
                  key={c.candidateId} 
                  onClick={() => setSelectedCandidate(c)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedCandidate?.candidateId === c.candidateId ? 'bg-[#1a1a1a] border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-[#111] border-[#222] hover:border-[#444]'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-100 flex items-center gap-2">
                        {c.candidateName || `Candidate ${c.candidateId.substring(0, 6)}`}
                        {index === 0 && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/30">TOP MATCH</span>}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{c.matchType} Match</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-light text-emerald-400">{Math.round(c.overallFitScore)}%</div>
                    </div>
                  </div>
                </div>
              ))}
              {candidates.length === 0 && (
                <div className="text-gray-500 p-8 border border-dashed border-[#333] rounded-xl text-center">
                  No candidates evaluated yet.
                </div>
              )}
            </div>

            {/* Explainability View */}
            {selectedCandidate && (
              <div className="col-span-2 space-y-6">
                
                {/* Executive Summary */}
                <div className="bg-gradient-to-br from-[#1a1a24] to-[#111] p-6 rounded-xl border border-blue-900/30 shadow-lg">
                  <h3 className="text-xl font-medium text-white mb-2">Copilot Recommendation: <span className="text-emerald-400 font-bold">{selectedCandidate.overallFitScore >= 90 ? 'Strong Hire' : 'Hire'}</span></h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {selectedCandidate.candidateName || `Candidate ${selectedCandidate.candidateId.substring(0, 6)}`} demonstrates exceptional capability overlap with the target profile. 
                    The strongest indicators come from <strong className="text-gray-100">Execution Artifacts</strong>, showing deterministic proof of System Design and Algorithmic abilities.
                  </p>
                </div>

                {/* Evidence Chain */}
                <h3 className="text-lg font-semibold text-gray-200 pt-4">Explainability Chain</h3>
                <div className="space-y-4">
                  {selectedCandidate.explainability?.matchedSkills?.map((skill: any, idx: number) => (
                    <div key={idx} className="bg-[#151515] p-5 rounded-xl border border-[#222] flex flex-col gap-3">
                      
                      {/* Skill Header */}
                      <div className="flex justify-between items-center border-b border-[#333] pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono bg-[#222] px-2 py-1 rounded text-blue-300">
                            {skill.skillId}
                          </span>
                        </div>
                        <span className="text-emerald-400 font-medium">Score: {skill.candidateScore}</span>
                      </div>
                      
                      {/* Evidence Trace */}
                      <div className="pl-4 border-l-2 border-purple-500/30 py-2">
                        <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Provenance</span>
                        <p className="text-gray-300 text-sm mt-1">{skill.evidenceReasoning}</p>
                        
                        <div className="flex gap-4 mt-3">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <svg className="w-3 h-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            High Confidence
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            Execution Artifact
                          </span>
                        </div>
                      </div>

                    </div>
                  ))}
                  
                  {/* Skill Gap */}
                  {selectedCandidate.explainability?.missingSkills?.length > 0 && (
                    <div className="bg-red-900/10 p-5 rounded-xl border border-red-900/30">
                      <h4 className="text-sm uppercase font-bold text-red-400 tracking-wider mb-2">Identified Gaps</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.explainability.missingSkills.map((gap: any, i: number) => (
                          <span key={i} className="bg-red-900/20 text-red-300 text-xs px-2 py-1 rounded border border-red-900/50">
                            {gap.skillId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
