"use client";

import { motion } from "framer-motion";
import { typeTokens, spacingTokens } from "@/lib/design-system/tokens";
import { Node } from "@/components/ui/visualization/Node";
import { Edge } from "@/components/ui/visualization/Edge";
import { GlowLayer } from "@/components/ui/visualization/GlowLayer";
import { Brain, Database, Cloud, Code, Network } from "lucide-react";

export function LivingEnterpriseBrain() {
  return (
    <section className={`relative min-h-[600px] flex flex-col items-center justify-center overflow-hidden bg-background ${spacingTokens.sectionGap} ${spacingTokens.pagePadding}`}>
      <div className="text-center mb-16 z-10">
        <motion.h2 
          className={typeTokens.heading2}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Living Enterprise Brain
        </motion.h2>
        <motion.p 
          className={`mt-4 ${typeTokens.bodyLg} max-w-2xl mx-auto`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Connecting every tool, database, and workflow into a single intelligence layer.
        </motion.p>
      </div>

      <div className="relative w-full max-w-4xl aspect-[2/1] md:aspect-[3/1] mt-8 flex items-center justify-center z-10">
        
        {/* Ambient Glow */}
        <div className="absolute inset-0 flex items-center justify-center">
           <GlowLayer color="primary" className="w-64 h-64" intensity={0.6} />
        </div>

        {/* Edges - SVG lines connecting outer nodes to the center */}
        {/* We use basic SVG here for demonstration. Real-world would calculate node coordinates dynamically */}
        <div className="absolute inset-0 pointer-events-none">
          <Edge startX={200} startY={100} endX={500} endY={200} active pulse delay={0.2} strokeColor="rgba(255,255,255,0.1)" activeColor="rgba(0,229,255,0.5)" />
          <Edge startX={800} startY={100} endX={500} endY={200} active pulse delay={0.4} strokeColor="rgba(255,255,255,0.1)" activeColor="rgba(0,229,255,0.5)" />
          <Edge startX={200} startY={300} endX={500} endY={200} active pulse delay={0.6} strokeColor="rgba(255,255,255,0.1)" activeColor="rgba(0,229,255,0.5)" />
          <Edge startX={800} startY={300} endX={500} endY={200} active pulse delay={0.8} strokeColor="rgba(255,255,255,0.1)" activeColor="rgba(0,229,255,0.5)" />
        </div>

        {/* Center Node */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <Node 
            icon={<Brain className="w-8 h-8" />} 
            label="Cerebro OS" 
            size="lg" 
            isActive 
            delay={1.0}
          />
        </div>

        {/* Outer Nodes */}
        <div className="absolute top-[10%] left-[15%] z-20">
          <Node icon={<Database />} label="ERP System" size="md" delay={0.2} />
        </div>
        
        <div className="absolute top-[10%] right-[15%] z-20">
          <Node icon={<Cloud />} label="Cloud Storage" size="md" delay={0.4} />
        </div>
        
        <div className="absolute bottom-[10%] left-[15%] z-20">
          <Node icon={<Code />} label="CRM Platform" size="md" delay={0.6} />
        </div>
        
        <div className="absolute bottom-[10%] right-[15%] z-20">
          <Node icon={<Network />} label="API Gateway" size="md" delay={0.8} />
        </div>
      </div>
    </section>
  );
}
