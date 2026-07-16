"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Download, Maximize2, ZoomIn, ZoomOut, Target } from 'lucide-react';
import { OrganizationNodeData, OrganizationService } from '@/lib/services/organizationService';
import { useOrganizationWorkspace } from './OrganizationWorkspaceContext';
import { useReactFlow, MiniMap, Panel } from '@xyflow/react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const themeColors: Record<string, string> = {
  executive: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  engineering: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  research: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  consulting: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  business: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  default: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
};

export const InspectorPanel = () => {
  const { selectedNode, setSelectedNode } = useOrganizationWorkspace();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const node = selectedNode;

  return (
    <Panel position="top-right" className="!m-4 flex flex-col gap-4 pointer-events-none z-50">
      
      {/* Primary Inspector Card */}
      <div className="w-[340px] bg-background/80 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto transition-all">
        {node ? (
          /* ACTIVE STATE: Node Selected */
          <div className="flex flex-col h-full max-h-[500px]">
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-border bg-white/[0.02]">
              <div>
                <div className={cn("inline-block px-2 py-1 rounded text-[9px] font-mono uppercase tracking-widest mb-2 border", themeColors[node.theme] || themeColors.default)}>
                  {node.type}
                </div>
                <h2 className="text-lg font-space font-bold text-text-primary mb-0.5 leading-tight">{node.title}</h2>
                <p className="text-[11px] text-text-secondary font-inter line-clamp-1">{node.subtitle}</p>
              </div>
              <button onClick={() => setSelectedNode(null)} className="p-1.5 text-text-muted hover:text-white hover:bg-white/10 rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 custom-scrollbar">
              
              {/* Avatar (if any) */}
              {node.avatar && (
                <div className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-border">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative border border-border shadow-inner shrink-0">
                    <Image src={node.avatar} alt="Avatar" fill className="object-cover" />
                  </div>
                  <div className="text-[10px] text-text-muted italic leading-relaxed">
                    "Leading the {node.title} division towards our enterprise objectives."
                  </div>
                </div>
              )}

              {/* Metrics Grid */}
              {node.metrics && (
                <div>
                  <h3 className="text-[9px] font-space font-bold text-text-muted uppercase tracking-widest mb-2">Key Metrics</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(node.metrics).map(([key, value]) => (
                      <div key={key} className="bg-surface border border-border p-2.5 rounded-lg flex flex-col gap-0.5">
                        <span className="text-[9px] font-mono text-text-muted capitalize">{key}</span>
                        <span className="text-base font-space font-bold text-text-primary">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Capabilities */}
              {node.capabilities && node.capabilities.length > 0 && (
                <div>
                  <h3 className="text-[9px] font-space font-bold text-text-muted uppercase tracking-widest mb-2">Capabilities</h3>
                  <ul className="flex flex-col gap-1.5">
                    {node.capabilities.map((cap, i) => (
                      <li key={i} className="text-[11px] font-inter text-text-secondary flex items-start gap-2">
                        <span className="text-white/20 mt-0.5">•</span> {cap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-border">
              <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-border rounded-lg text-[11px] font-space font-bold text-text-primary transition-colors flex items-center justify-center gap-2">
                Open Full Dashboard <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ) : (
          /* IDLE STATE: Company Overview */
          <div className="flex flex-col">
            <div className="p-5 border-b border-border bg-white/[0.02]">
              <div className="inline-block px-2 py-1 rounded text-[9px] font-mono uppercase tracking-widest mb-2 border border-border text-text-muted bg-white/5">
                Global Network
              </div>
              <h2 className="text-lg font-space font-bold text-text-primary mb-0.5">Company Overview</h2>
              <p className="text-[11px] text-text-secondary font-inter">CerebroHive Organization Intelligence</p>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface border border-border p-2.5 rounded-lg">
                  <span className="text-[9px] font-mono text-text-muted">Total People</span>
                  <span className="block text-base font-space font-bold text-text-primary">68</span>
                </div>
                <div className="bg-surface border border-border p-2.5 rounded-lg">
                  <span className="text-[9px] font-mono text-text-muted">Divisions</span>
                  <span className="block text-base font-space font-bold text-text-primary">4</span>
                </div>
              </div>
              
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-[11px] text-emerald-500 font-inter">Organization systems online and synced.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tools & MiniMap Card */}
      <div className="w-[340px] bg-background/80 backdrop-blur-2xl border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden pointer-events-auto">
        <div className="p-2 border-b border-border flex justify-between gap-1 bg-white/[0.02]">
          <button onClick={() => fitView({ padding: 0.2, duration: 800 })} className="flex-1 py-1.5 flex justify-center items-center text-text-muted hover:text-white hover:bg-white/5 rounded transition-colors" title="Fit View">
            <Maximize2 size={14} />
          </button>
          <button onClick={() => zoomIn({ duration: 400 })} className="flex-1 py-1.5 flex justify-center items-center text-text-muted hover:text-white hover:bg-white/5 rounded transition-colors" title="Zoom In">
            <ZoomIn size={14} />
          </button>
          <button onClick={() => zoomOut({ duration: 400 })} className="flex-1 py-1.5 flex justify-center items-center text-text-muted hover:text-white hover:bg-white/5 rounded transition-colors" title="Zoom Out">
            <ZoomOut size={14} />
          </button>
          <div className="w-px bg-white/10 mx-1" />
          <button className="flex-[2] py-1.5 flex justify-center items-center gap-1.5 text-text-muted hover:text-white hover:bg-white/5 rounded transition-colors text-[10px] font-space uppercase font-bold" title="Export">
            <Download size={12} /> Export
          </button>
        </div>

        {/* Themed MiniMap */}
        <div className="relative h-[160px] w-full bg-[#050A0F]/50">
          <MiniMap 
            nodeColor={n => n.type === 'executive' ? '#F59E0B' : n.type === 'team' ? '#6B7280' : '#3B82F6'}
            maskColor="rgba(0, 0, 0, 0.7)"
            style={{ width: '100%', height: '100%', margin: 0, position: 'absolute', top: 0, left: 0 }}
            className="!bg-transparent !border-0 !m-0 !shadow-none" 
            nodeBorderRadius={4}
            zoomable
            pannable
          />
        </div>
      </div>

    </Panel>
  );
};
