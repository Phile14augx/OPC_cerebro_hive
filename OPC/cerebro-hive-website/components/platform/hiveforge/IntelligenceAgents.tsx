"use client";

import { useEffect, useState } from "react";
import { intelligenceService } from "../../../app/platform/hiveforge/core/intelligence/IntelligenceService";

export function IntelligenceAgents() {
  const [recommendation, setRecommendation] = useState<string>("Loading Copilot Context...");
  
  useEffect(() => {
    // In a real application, this would take context from the current view.
    // For now, we simulate an optimization query.
    const fetchContext = async () => {
      try {
        const decision = await intelligenceService.recommendOptimization("workspace-1");
        // We simulate that the decision engine returned a response. 
        // We'll mock a display here since decision engine logic is mocked.
        setRecommendation("Optimization: Downgrade 'res-db-1' in eu-west-1 to save $45/mo. Confidence: 92%.");
      } catch (err) {
        setRecommendation("AI Agent ready. No active optimizations.");
      }
    };
    fetchContext();
  }, []);

  return (
    <div className="bg-surface/50 border border-border rounded-xl p-4 mt-4 animate-in fade-in">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🤖</span>
        <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider">Copilot Advisor</h4>
      </div>
      <div className="text-xs text-text-secondary bg-black/20 p-3 rounded border border-border/50">
        {recommendation}
      </div>
      <div className="mt-3 flex gap-2">
        <button className="flex-1 bg-surface border border-border text-[10px] uppercase font-bold py-1.5 rounded hover:bg-white hover:text-black transition-colors">
          Explain
        </button>
        <button className="flex-1 bg-primary-accent border border-primary-accent text-white text-[10px] uppercase font-bold py-1.5 rounded hover:opacity-90 transition-opacity">
          Execute
        </button>
      </div>
    </div>
  );
}
