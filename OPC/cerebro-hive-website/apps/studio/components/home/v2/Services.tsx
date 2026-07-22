"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn, withBasePath } from "@/lib/utils";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Brain, Bot, Code2, Cloud, ShieldCheck, Database, LayoutDashboard, Zap, TrendingUp, Users, Rocket, CloudLightning, Lock, BarChart, FileLineChart, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    id: "01",
    title: "Enterprise AI",
    desc: "Transform enterprises with AI strategy, genAI solutions, RAG systems and decision intelligence.",
    bullets: ["AI Strategy & Roadmaps", "Enterprise Copilots", "Knowledge Intelligence"],
    metricValue: "42+",
    metricLabel: "AI Engagements",
    TitleIcon: Brain,
    FooterIcon: TrendingUp,
    imageSrc: "/images/services/enterprise-ai.png"
  },
  {
    id: "02",
    title: "AI Agents",
    desc: "Build and deploy autonomous AI agents that execute, learn and optimize complex business workflows.",
    bullets: ["Multi-Agent Systems", "Agentic Automation", "Tool & API Integration"],
    metricValue: "24+",
    metricLabel: "Active Agents Deployed",
    TitleIcon: Bot,
    FooterIcon: Users,
    imageSrc: "/images/services/ai-agents.png"
  },
  {
    id: "03",
    title: "Software Engineering",
    desc: "Engineer scalable, secure and resilient software systems that power the modern enterprise.",
    bullets: ["Cloud-Native Applications", "Microservices Architecture", "API & Platform Engineering"],
    metricValue: "100M+",
    metricLabel: "Transactions Processed",
    TitleIcon: Code2,
    FooterIcon: Rocket,
    imageSrc: "/images/services/software-engineering.png"
  },
  {
    id: "04",
    title: "Cloud Integration",
    desc: "Accelerate innovation with secure, scalable and cost-optimized cloud solutions.",
    bullets: ["Multi-Cloud Strategy", "Cloud Migration", "DevOps & Platform Engineering"],
    metricValue: "99.9%",
    metricLabel: "Uptime Architected",
    TitleIcon: Cloud,
    FooterIcon: CloudLightning,
    imageSrc: "/images/services/cloud-integration.png"
  },
  {
    id: "05",
    title: "Cybersecurity",
    desc: "Protect your digital assets with enterprise-grade security, compliance and zero trust frameworks.",
    bullets: ["Zero Trust Security", "Threat Detection & Response", "Governance & Compliance"],
    metricValue: "100%",
    metricLabel: "Security First Approach",
    TitleIcon: ShieldCheck,
    FooterIcon: Lock,
    imageSrc: "/images/services/cybersecurity.png"
  },
  {
    id: "06",
    title: "Data & Lakehouse",
    desc: "Unify, engineer and activate your data for analytics, AI and real-time business insights.",
    bullets: ["Data Engineering", "Lakehouse Architecture", "Real-time Analytics"],
    metricValue: "10PB+",
    metricLabel: "Data Engineered",
    TitleIcon: Database,
    FooterIcon: BarChart,
    imageSrc: "/images/services/data-lakehouse.png"
  },
  {
    id: "07",
    title: "Next-Gen ERP",
    desc: "AI-powered ERP solutions that automate operations, finance, HR and supply chain end-to-end.",
    bullets: ["Finance & Accounting", "Supply Chain Management", "HR & Workforce Management"],
    metricValue: "40%",
    metricLabel: "Operational Efficiency ↑",
    TitleIcon: LayoutDashboard,
    FooterIcon: TrendingUp,
    imageSrc: "/images/services/nextgen-erp.png"
  },
  {
    id: "08",
    title: "Hyperautomation",
    desc: "Automate end-to-end processes with RPA, AI and intelligent workflow orchestration.",
    bullets: ["RPA + AI Automation", "Intelligent Workflows", "Process Mining"],
    metricValue: "10x",
    metricLabel: "Faster Process Execution",
    TitleIcon: Zap,
    FooterIcon: Zap,
    imageSrc: "/images/services/hyperautomation.png"
  }
];

export default function Services() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    
    const cards = gsap.utils.toArray<HTMLElement>('.service-card', gridRef.current);
    
    cards.forEach((card) => {
      const num = card.querySelector('.service-num');
      const img = card.querySelector('.service-img');
      const content = card.querySelector('.service-content');
      const footer = card.querySelector('.service-footer');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
        }
      });

      tl.fromTo(num, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4 })
        .fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.2")
        .fromTo(content, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2")
        .fromTo(footer, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.2");
    });
  }, []);

  return (
    <section className="section-pad bg-surface-elevated relative border-t border-border font-inter">
      <div className="container-wide">
        {/* We reuse SectionHeading but maybe center it to match typical layouts */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <p className="text-lg text-text-muted">
            We deliver end-to-end <span className="text-primary-accent">intelligence architectures</span>, from foundational data pipelines to <span className="text-primary-accent">autonomous agentic workflows</span>.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-12 gap-4">
          {services.map((svc, index) => {
            const isHovered = hoveredIdx === index;
            const isSameRowDesktop = hoveredIdx !== null && Math.floor(index / 4) === Math.floor(hoveredIdx / 4);
            const isSameRowTablet = hoveredIdx !== null && Math.floor(index / 2) === Math.floor(hoveredIdx / 2);

            return (
              <div 
                key={svc.id} 
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={cn(
                  "service-card group relative h-[520px] rounded-xl bg-surface border border-border flex flex-col justify-between overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-primary-accent/50 cursor-pointer col-span-12",
                  // Tablet logic
                  hoveredIdx === null ? "md:col-span-6" : 
                    (isSameRowTablet ? (isHovered ? "md:col-span-8" : "md:col-span-4") : "md:col-span-6"),
                  // Desktop logic
                  hoveredIdx === null ? "lg:col-span-3" : 
                    (isSameRowDesktop ? (isHovered ? "lg:col-span-6" : "lg:col-span-2") : "lg:col-span-3")
                )}
              >
              {/* Image Area (Bottom) */}
              <div className="service-img absolute bottom-16 left-0 right-0 h-[260px] pointer-events-none transition-all duration-500 group-hover:opacity-100 opacity-70">
                <Image 
                  src={withBasePath(svc.imageSrc)} 
                  alt={svc.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-cover object-center dark:mix-blend-screen mix-blend-multiply"
                />
                {/* Overlay gradient to fade the top of the image into the card */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-surface/30 to-surface" />
              </div>

              {/* Number (Top Right Outline) */}
              <div 
                className="service-num absolute top-5 right-5 text-5xl font-bold transition-all duration-300 z-0 pointer-events-none"
                style={{ 
                  WebkitTextStroke: '1px #00F57A', 
                  color: 'transparent', 
                  opacity: (hoveredIdx !== null && !isHovered && (isSameRowDesktop || isSameRowTablet)) ? 0 : 0.25 
                }}
              >
                {svc.id}
              </div>

              {/* Main Content (Top) */}
              <div className="service-content relative z-10 pt-6 px-6">
                
                {/* Title and Icon */}
                <div className="flex flex-col gap-3 mb-3">
                  <div className="w-8 h-8 rounded bg-surface-elevated border border-primary-accent/20 flex items-center justify-center text-primary-accent">
                    <svc.TitleIcon size={16} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary tracking-wide group-hover:text-primary-accent transition-colors pr-12">
                    {svc.title}
                  </h3>
                </div>
                
                <p className="text-[13px] text-text-secondary leading-relaxed mb-4">
                  {svc.desc}
                </p>

                {/* Bullets */}
                <ul className="flex flex-col gap-1.5 mb-6">
                  {svc.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px] text-text-secondary">
                      <span className="text-primary-accent mt-[4px] text-[8px]">●</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="service-footer relative z-10 px-6 py-4 border-t border-border/50 mt-auto flex items-center justify-between bg-surface/90 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="text-primary-accent">
                    <svc.FooterIcon size={20} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[15px] font-bold text-text-primary leading-tight">
                      {svc.metricValue}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {svc.metricLabel}
                    </span>
                  </div>
                </div>
                
                {/* CTA */}
                <span className="text-[12px] font-medium text-primary-accent flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  Learn More <ArrowRight size={14} />
                </span>
              </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
