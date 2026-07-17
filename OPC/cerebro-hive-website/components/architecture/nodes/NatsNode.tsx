import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const NatsNode = ({ data, isConnectable }: NodeProps) => {
  const isBrainMode = data?.isBrainMode;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      className={`relative rounded-xl border \${
        isBrainMode ? 'border-primary-accent bg-background shadow-[0_0_15px_rgba(0,245,122,0.4)]' : 'border-border bg-surface shadow-elevated'
      } p-5 w-[240px] transition-all duration-500`}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="opacity-0" />
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg \${isBrainMode ? 'bg-primary-accent/20 text-primary-accent' : 'bg-background text-text-secondary'}`}>
          <Activity size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-primary">NATS Event Bus</h3>
          <p className="text-[10px] text-text-muted">Pub/Sub & Queues</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 relative h-12 rounded-lg bg-background border border-border overflow-hidden">
        {/* Animated event streams inside the bus */}
        <motion.div 
          className="absolute top-2 left-0 h-[2px] w-4 bg-green-500 rounded-full"
          animate={{ x: [0, 240] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-5 left-0 h-[2px] w-6 bg-cyan-500 rounded-full"
          animate={{ x: [0, 240] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
        />
        <motion.div 
          className="absolute top-8 left-0 h-[2px] w-3 bg-purple-500 rounded-full"
          animate={{ x: [0, 240] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.2 }}
        />
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="opacity-0" />
    </motion.div>
  );
};
