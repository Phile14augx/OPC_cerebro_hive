import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MonitorSmartphone } from 'lucide-react';
import { motion } from 'framer-motion';

export const ClientNode = ({ data, isConnectable }: NodeProps) => {
  const isBrainMode = data?.isBrainMode;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative rounded-xl border \${
        isBrainMode ? 'border-primary-accent bg-background shadow-[0_0_15px_rgba(0,245,122,0.4)]' : 'border-border bg-surface shadow-elevated'
      } p-4 w-[200px] flex items-center justify-center gap-3 transition-all duration-500`}
    >
      <div className={`p-2 rounded-lg \${isBrainMode ? 'bg-primary-accent/20 text-primary-accent' : 'bg-background text-text-secondary'}`}>
        <MonitorSmartphone size={20} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-text-primary">Client Apps</h3>
        <p className="text-[10px] text-text-muted">Web, Mobile, CLI</p>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="opacity-0" />
    </motion.div>
  );
};
