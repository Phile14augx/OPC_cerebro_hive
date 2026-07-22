"use client";

import React from 'react';

export default function TaskGraphViewer() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-neutral-900 rounded-lg border border-neutral-700 p-4">
      <div className="text-center space-y-4">
        <div className="flex justify-center space-x-8">
          <div className="px-4 py-2 bg-blue-900/50 border border-blue-700 rounded-lg text-blue-300">
            Node: Retrieve Policy
          </div>
          <div className="flex items-center text-neutral-500">→</div>
          <div className="px-4 py-2 bg-purple-900/50 border border-purple-700 rounded-lg text-purple-300">
            Node: Evaluate Compliance
          </div>
        </div>
        <p className="text-neutral-500 text-sm">TaskGraph DAG Visualization (React Flow Placeholder)</p>
      </div>
    </div>
  );
}
