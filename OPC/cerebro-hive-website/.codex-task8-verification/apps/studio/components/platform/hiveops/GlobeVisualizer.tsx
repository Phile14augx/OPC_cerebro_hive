"use client";

import React from "react";
import { motion } from "framer-motion";
import { Server, Activity, ShieldAlert } from "lucide-react";

const regions = [
  { id: "us-east", name: "US-East", x: 25, y: 35, status: "healthy", clusters: 12 },
  { id: "us-west", name: "US-West", x: 15, y: 40, status: "healthy", clusters: 8 },
  { id: "eu-west", name: "EU-West", x: 45, y: 30, status: "degraded", clusters: 15 },
  { id: "ap-south", name: "India", x: 70, y: 45, status: "healthy", clusters: 6 },
  { id: "ap-southeast", name: "Singapore", x: 80, y: 55, status: "healthy", clusters: 10 },
  { id: "ap-northeast", name: "Tokyo", x: 85, y: 35, status: "healthy", clusters: 9 },
];

export function GlobeVisualizer() {
  return (
    <div className="relative w-full h-[300px] bg-[#0B0D14] border border-slate-800 rounded-xl overflow-hidden group">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D14] via-transparent to-transparent"></div>

      {/* Map Placeholder (Using a simplified SVG outline or just dots) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
        {/* Abstract World Map Vector representation could go here */}
        <div className="w-[80%] h-[70%] border border-slate-700/50 rounded-[40%] blur-[2px]" />
      </div>

      {/* Region Nodes */}
      {regions.map((region, idx) => (
        <motion.div
          key={region.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1, duration: 0.5 }}
          className="absolute group/node cursor-pointer"
          style={{ left: `${region.x}%`, top: `${region.y}%` }}
        >
          {/* Ping Animation */}
          <div className={`absolute -inset-2 rounded-full animate-ping opacity-20 ${
            region.status === "healthy" ? "bg-emerald-500" :
            region.status === "degraded" ? "bg-amber-500" : "bg-red-500"
          }`} />
          
          {/* Core Node */}
          <div className={`relative w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
            region.status === "healthy" ? "bg-emerald-400" :
            region.status === "degraded" ? "bg-amber-400" : "bg-red-400"
          }`} />

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max opacity-0 group-hover/node:opacity-100 transition-opacity pointer-events-none z-10">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-xl flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-200">{region.name}</span>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <Server className="w-3 h-3" />
                <span>{region.clusters} Clusters</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                {region.status === "healthy" ? (
                  <><Activity className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Healthy</span></>
                ) : (
                  <><ShieldAlert className="w-3 h-3 text-amber-400" /><span className="text-amber-400">Degraded</span></>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex gap-4 text-xs text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" /> Healthy
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-400" /> Degraded
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-400" /> Critical
        </div>
      </div>
      
      <div className="absolute top-4 left-4">
        <h3 className="text-sm font-semibold text-slate-200">Global Infrastructure</h3>
        <p className="text-xs text-slate-500">Live Topology View</p>
      </div>
    </div>
  );
}
