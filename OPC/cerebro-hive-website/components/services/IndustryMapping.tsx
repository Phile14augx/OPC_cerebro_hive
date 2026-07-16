"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Building, Stethoscope, Briefcase, ShoppingBag, Factory, Shield, Cpu, Zap, ArrowRight } from "lucide-react";

const industries = [
  {
    id: "healthcare",
    name: "Healthcare & Life Sciences",
    icon: Stethoscope,
    description: "Clinical documentation automation, HIPAA-compliant RAG for patient history, and medical imaging analysis.",
    link: "/industries/healthcare",
    color: "#00E5FF"
  },
  {
    id: "finance",
    name: "Financial Services",
    icon: Briefcase,
    description: "Algorithmic risk assessment, automated compliance checking, and intelligent document processing.",
    link: "/industries/financial-services",
    color: "#00F57A"
  },
  {
    id: "retail",
    name: "Retail & E-commerce",
    icon: ShoppingBag,
    description: "Hyper-personalized recommendation engines, dynamic pricing models, and supply chain forecasting.",
    link: "/industries/retail",
    color: "#FF8A00"
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    icon: Factory,
    description: "Predictive maintenance, computer vision for quality control, and autonomous inventory management.",
    link: "/industries/manufacturing",
    color: "#7B61FF"
  },
  {
    id: "government",
    name: "Government & Public Sector",
    icon: Shield,
    description: "Secure data lakehouses, citizen service chatbots, and automated policy analysis.",
    link: "/industries/government",
    color: "#FF2ED1"
  },
  {
    id: "technology",
    name: "Technology & SaaS",
    icon: Cpu,
    description: "AI-native feature development, automated tier-1 support, and intelligent product onboarding.",
    link: "/industries/technology",
    color: "#00C8FF"
  }
];

export function IndustryMapping() {
  return (
    <section className="section-pad bg-surface-elevated border-y border-border">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-6">
            Industries We Serve
          </h2>
          <p className="text-lg text-text-secondary font-inter max-w-2xl mx-auto">
            Deep domain expertise combined with bleeding-edge AI engineering. We build 
            solutions tailored to the regulatory and operational realities of your sector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry, i) => (
            <motion.div
              key={industry.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link 
                href={industry.link}
                className="group block p-8 rounded-2xl bg-background border border-border hover:border-primary-accent/50 transition-all duration-300 h-full relative overflow-hidden"
              >
                {/* Subtle gradient glow on hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle at top right, ${industry.color}, transparent 60%)` }}
                />
                
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface border border-border"
                    style={{ color: industry.color }}
                  >
                    <industry.icon size={20} />
                  </div>
                  <h3 className="text-lg font-space font-bold text-text-primary group-hover:text-primary-accent transition-colors">
                    {industry.name}
                  </h3>
                </div>
                
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  {industry.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-text-muted group-hover:text-primary-accent transition-colors">
                  Explore Solutions <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
