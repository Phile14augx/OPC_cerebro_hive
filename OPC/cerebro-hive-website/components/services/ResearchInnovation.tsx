"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Newspaper, FileText, FlaskConical, ArrowRight } from "lucide-react";

const resources = [
  {
    icon: Newspaper,
    title: "Daily AI Research Briefings",
    type: "Insights",
    link: "/insights"
  },
  {
    icon: BookOpen,
    title: "AI Architecture Playbooks",
    type: "Methodology",
    link: "/resources"
  },
  {
    icon: FileText,
    title: "Benchmarking & Evaluation",
    type: "Research",
    link: "/research"
  },
  {
    icon: FlaskConical,
    title: "Open-Source Initiatives",
    type: "Code",
    link: "https://github.com/Phile14augx"
  }
];

export function ResearchInnovation() {
  return (
    <section className="section-pad bg-surface-elevated border-y border-border">
      <div className="container-wide max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-6">
              Research & Innovation at <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00F57A]">CerebroHive Labs</span>
            </h2>
            <p className="text-lg text-text-secondary font-inter leading-relaxed mb-8">
              We don't just implement AI; we push its boundaries. Our dedicated research arm continuously evaluates frontier models, publishes architecture patterns, and contributes to the open-source community to ensure our clients always receive state-of-the-art solutions.
            </p>
            
            <Link href="/research" className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-primary-accent hover:text-text-primary transition-colors group">
              Explore Our Research <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <Link href={item.link} className="block p-6 rounded-2xl bg-background border border-border hover:border-primary-accent/30 hover:shadow-elevated transition-all duration-300 group h-full">
                    <item.icon size={24} className="text-text-muted mb-4 group-hover:text-primary-accent transition-colors" />
                    <span className="block text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">{item.type}</span>
                    <h3 className="text-sm font-space font-bold text-text-primary group-hover:text-primary-accent transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
