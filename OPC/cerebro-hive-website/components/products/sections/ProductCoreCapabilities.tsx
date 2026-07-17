"use client";

import React from "react";
import { motion } from "framer-motion";
import { PackagedProduct } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Box, Code, Cpu, Database, Network, Shield, Workflow, PlayCircle, Server, DollarSign, Map, Copy, Zap, User, UserCheck, Activity, BookOpen, Lightbulb, Award } from "lucide-react";

const getIcon = (name: string) => {
  const icons: any = {
    Box, Code, Cpu, Database, Network, Shield, Workflow, PlayCircle, Server, DollarSign, Map, Copy, Zap, User, UserCheck, Activity, BookOpen, Lightbulb, Award
  };
  const Icon = icons[name] || Box;
  return <Icon size={24} />;
};

export const ProductCoreCapabilities = ({ product }: { product: PackagedProduct }) => {
  if (!product.coreCapabilities || product.coreCapabilities.length === 0) return null;

  return (
    <section className="section-pad bg-background border-b border-border">
      <div className="container-wide">
        <SectionHeading 
          label="Capabilities" 
          title="Core Features" 
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {product.coreCapabilities.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 bg-surface-elevated border border-border rounded-2xl shadow-sm hover:border-secondary-accent/40 transition-colors flex flex-col group"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary-accent/10 flex items-center justify-center text-secondary-accent mb-6 group-hover:scale-110 transition-transform">
                {getIcon(feat.icon || "Box")}
              </div>
              <h4 className="text-xl font-space font-bold text-text-primary mb-3">{feat.title}</h4>
              <p className="text-text-secondary leading-relaxed text-sm">{feat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
