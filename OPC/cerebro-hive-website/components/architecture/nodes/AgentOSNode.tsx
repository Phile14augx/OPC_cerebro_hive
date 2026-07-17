import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Brain, Cpu, Database, Network } from 'lucide-react';
import { motion } from 'framer-motion';

export const AgentOSNode = ({ data, isConnectable }: NodeProps) => {
  const nodeData = data as { isBrainMode?: boolean; [key: string]: unknown };
  const isBrainMode = nodeData?.isBrainMode;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
      className={`relative rounded-2xl border \${
        isBrainMode ? 'border-primary-accent bg-background shadow-[0_0_30px_rgba(0,245,122,0.3)]' : 'border-border bg-surface shadow-elevated'
      } p-6 w-[400px] transition-all duration-500`}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="opacity-0" />
      
      <div className="flex items-center justify-between mb-6 border-b border-border/50 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg \${isBrainMode ? 'bg-primary-accent/20 text-primary-accent' : 'bg-background text-text-secondary'}`}>
            <Brain size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">AgentOS Core</h3>
            <p className="text-[11px] text-text-muted">Golang Orchestrator</p>
          </div>
        </div>
        
        {isBrainMode && (
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-accent animate-ping" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Task Orchestration */}
        <div className="p-3 rounded-xl bg-background border border-border flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
            <Cpu size={14} className="text-secondary-accent" /> Orchestration
          </div>
          <div className="flex flex-col gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-secondary-accent" 
                  initial={{ width: "10%" }}
                  animate={{ width: ["10%", "90%", "30%", "100%", "20%"] }}
                  transition={{ duration: 2 + i, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Context Memory */}
        <div className="p-3 rounded-xl bg-background border border-border flex flex-col gap-3 items-center justify-center relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-text-primary absolute top-3 left-3 z-10">
            <Database size={14} className="text-blue-400" /> Memory
          </div>
          
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mt-4 rounded-full border-2 border-dashed border-blue-400/50 flex items-center justify-center"
          >
            <div className="w-10 h-10 rounded-full border border-blue-400/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ filter: 'blur(2px)' }} />
            </div>
          </motion.div>
        </div>

        {/* Multi-Agent */}
        <div className="col-span-2 p-3 rounded-xl bg-background border border-border flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-text-primary">
            <Network size={14} className="text-purple-400" /> Multi-Agent Swarm
          </div>
          <div className="flex justify-between items-center px-4 py-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-[10px] text-purple-400 font-bold">A</div>
            <motion.div 
              className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mx-2 relative"
            >
              <motion.div 
                className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]"
                animate={{ left: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
            <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-[10px] text-purple-400 font-bold">B</div>
            <motion.div 
              className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent mx-2 relative"
            >
              <motion.div 
                className="absolute top-1/2 -translate-y-1/2 right-0 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]"
                animate={{ right: ["0%", "100%", "0%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
              />
            </motion.div>
            <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-[10px] text-purple-400 font-bold">C</div>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="opacity-0" />
    </motion.div>
  );
};
