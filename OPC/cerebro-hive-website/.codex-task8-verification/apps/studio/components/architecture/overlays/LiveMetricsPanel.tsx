import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const LiveMetricsPanel = () => {
  const [metrics, setMetrics] = useState({
    latency: 42,
    requests: 2143,
    memory: 1.3,
    events: 8400
  });

  useEffect(() => {
    // Simulate live telemetry
    const interval = setInterval(() => {
      setMetrics(prev => ({
        latency: Math.max(20, Math.min(100, prev.latency + (Math.random() * 10 - 5))),
        requests: Math.max(1000, prev.requests + (Math.random() * 100 - 45)),
        memory: Math.max(1.0, Math.min(3.0, prev.memory + (Math.random() * 0.1 - 0.05))),
        events: Math.max(5000, prev.events + (Math.random() * 400 - 180))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className="absolute top-6 right-6 flex flex-col gap-3 z-50 pointer-events-none"
    >
      <MetricCard label="Global Latency" value={`${Math.round(metrics.latency)} ms`} />
      <MetricCard label="Requests/sec" value={Math.round(metrics.requests).toLocaleString()} />
      <MetricCard label="Memory Usage" value={`${metrics.memory.toFixed(2)} GB`} />
      <MetricCard label="Events/sec" value={Math.round(metrics.events).toLocaleString()} />
      
      <div className="flex gap-2 mt-2">
        <div className="p-3 bg-surface/80 backdrop-blur-md border border-border rounded-xl flex-1 flex flex-col items-center justify-center gap-1 shadow-elevated">
          <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Agents</span>
          <span className="text-lg font-space font-bold text-primary-accent">18</span>
        </div>
        <div className="p-3 bg-surface/80 backdrop-blur-md border border-border rounded-xl flex-1 flex flex-col items-center justify-center gap-1 shadow-elevated">
          <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Workers</span>
          <span className="text-lg font-space font-bold text-secondary-accent">22</span>
        </div>
      </div>
    </motion.div>
  );
};

const MetricCard = ({ label, value }: { label: string, value: string }) => (
  <div className="w-40 p-3 bg-surface/80 backdrop-blur-md border border-border rounded-xl shadow-elevated flex items-center justify-between">
    <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">{label}</span>
    <span className="text-xs font-mono font-bold text-text-primary">{value}</span>
  </div>
);
