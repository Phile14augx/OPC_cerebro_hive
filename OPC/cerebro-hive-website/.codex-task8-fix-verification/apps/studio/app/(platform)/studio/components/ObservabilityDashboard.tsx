"use client";

import React from 'react';

export default function ObservabilityDashboard() {
  return (
    <div className="grid grid-cols-4 gap-6 w-full h-full">
      <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700 flex flex-col items-center justify-center">
        <span className="text-neutral-400 text-sm mb-2">Avg Latency</span>
        <span className="text-3xl font-bold text-blue-400">124ms</span>
      </div>
      <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700 flex flex-col items-center justify-center">
        <span className="text-neutral-400 text-sm mb-2">Token Usage (1h)</span>
        <span className="text-3xl font-bold text-purple-400">45.2k</span>
      </div>
      <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700 flex flex-col items-center justify-center">
        <span className="text-neutral-400 text-sm mb-2">Active Agents</span>
        <span className="text-3xl font-bold text-green-400">12</span>
      </div>
      <div className="bg-neutral-900 rounded-lg p-4 border border-neutral-700 flex flex-col items-center justify-center">
        <span className="text-neutral-400 text-sm mb-2">Policy Blocks</span>
        <span className="text-3xl font-bold text-red-400">0</span>
      </div>
    </div>
  );
}
