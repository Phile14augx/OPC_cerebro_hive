import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { OrganizationNodeData } from '@/lib/services/organizationService';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface InspectorPanelProps {
  node: OrganizationNodeData | null;
  onClose: () => void;
}

const themeColors: Record<string, string> = {
  executive: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  engineering: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  research: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  consulting: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  business: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  default: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
};

export const InspectorPanel = ({ node, onClose }: InspectorPanelProps) => {
  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-4 right-4 bottom-4 w-[360px] bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-white/5">
            <div>
              <div className={cn("inline-block px-2 py-1 rounded text-[10px] font-mono uppercase tracking-widest mb-3 border", themeColors[node.theme] || themeColors.default)}>
                {node.type}
              </div>
              <h2 className="text-xl font-space font-bold text-white mb-1">{node.title}</h2>
              <p className="text-xs text-text-secondary font-inter">{node.subtitle}</p>
            </div>
            <button onClick={onClose} className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
            
            {/* Avatar (if any) */}
            {node.avatar && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden relative border border-white/10 shadow-inner">
                  <Image src={node.avatar} alt="Avatar" fill className="object-cover" />
                </div>
                <div className="text-xs text-text-muted italic">
                  "Leading the {node.title} division."
                </div>
              </div>
            )}

            {/* Metrics Grid */}
            {node.metrics && (
              <div>
                <h3 className="text-[10px] font-space font-bold text-text-muted uppercase tracking-widest mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(node.metrics).map(([key, value]) => (
                    <div key={key} className="bg-surface border border-white/5 p-3 rounded-lg flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-text-muted capitalize">{key}</span>
                      <span className="text-lg font-space font-bold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Capabilities */}
            {node.capabilities && node.capabilities.length > 0 && (
              <div>
                <h3 className="text-[10px] font-space font-bold text-text-muted uppercase tracking-widest mb-3">Capabilities & Focus</h3>
                <ul className="flex flex-col gap-2">
                  {node.capabilities.map((cap, i) => (
                    <li key={i} className="text-xs font-inter text-text-secondary flex items-start gap-2">
                      <span className="text-white/20 mt-0.5">•</span> {cap}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technologies */}
            {node.technologies && node.technologies.length > 0 && (
              <div>
                <h3 className="text-[10px] font-space font-bold text-text-muted uppercase tracking-widest mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {node.technologies.map((tech, i) => (
                    <span key={i} className="text-[10px] font-mono text-text-muted bg-white/5 border border-white/5 px-2 py-1 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 bg-surface/50">
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-space font-bold text-white transition-colors flex items-center justify-center gap-2">
              View Full Report <ExternalLink size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
