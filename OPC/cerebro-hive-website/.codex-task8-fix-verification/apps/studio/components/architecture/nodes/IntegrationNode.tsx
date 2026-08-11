import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Blocks } from 'lucide-react';
import { motion } from 'framer-motion';

export const IntegrationNode = ({ data, isConnectable }: NodeProps) => {
  const isBrainMode = data?.isBrainMode;

  const integrations = [
    { name: "SAP", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { name: "Salesforce", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    { name: "ServiceNow", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    { name: "Snowflake", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
      className={`relative rounded-xl border \${
        isBrainMode ? 'border-primary-accent bg-background shadow-[0_0_15px_rgba(0,245,122,0.4)]' : 'border-border bg-surface shadow-elevated'
      } p-5 w-[360px] transition-all duration-500`}
    >
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="opacity-0" />
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg \${isBrainMode ? 'bg-primary-accent/20 text-primary-accent' : 'bg-background text-text-secondary'}`}>
          <Blocks size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-text-primary">Enterprise Integrations</h3>
          <p className="text-[10px] text-text-muted">ERP, CRM, Data Warehouses</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {integrations.map((int) => (
          <div key={int.name} className={`flex items-center justify-center p-2 rounded-lg border text-[10px] font-bold \${int.color}`}>
            {int.name}
          </div>
        ))}
      </div>

    </motion.div>
  );
};
