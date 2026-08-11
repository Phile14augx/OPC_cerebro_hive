import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ServerCrash, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const GatewayNode = ({ data, isConnectable }: NodeProps) => {
  const isBrainMode = data?.isBrainMode;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      className={`relative rounded-xl border \${
        isBrainMode ? 'border-primary-accent bg-background shadow-[0_0_15px_rgba(0,245,122,0.4)]' : 'border-border bg-surface shadow-elevated'
      } p-5 w-[240px] transition-all duration-500`}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="opacity-0" />
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg \${isBrainMode ? 'bg-primary-accent/20 text-primary-accent' : 'bg-background text-text-secondary'}`}>
          <ServerCrash size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-primary">API Gateway</h3>
          <p className="text-[10px] text-text-muted">Next.js Edge</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between p-2 rounded bg-background border border-border">
          <span className="text-[10px] font-mono text-text-secondary">Auth</span>
          <ShieldCheck size={12} className="text-green-500" />
        </div>
        <div className="flex items-center justify-between p-2 rounded bg-background border border-border">
          <span className="text-[10px] font-mono text-text-secondary">Rate Limit</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="opacity-0" />
    </motion.div>
  );
};
