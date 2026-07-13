"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ServicesHeroBg } from "@/components/services/ServicesHeroBg";
import { 
  Brain, Bot, Database, GraduationCap, Code2, 
  CheckCircle2, ArrowRight, Activity, Search, LayoutDashboard,
  ChevronDown, Target, TrendingUp, ShieldCheck, Clock, Users, Building, Cpu, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceAnimationProvider, useServiceAnimation } from "@/components/services/ServiceAnimationContext";
import { ServiceMorphBackground } from "@/components/services/ServiceMorphBackground";

// 1. Data Structure with 10/10 Enterprise Depth
const servicesData = [
  {
    id: "ai-consulting",
    title: "AI Consulting & Strategy",
    color: "#00E5FF",
    icon: Brain,
    description: "We align executive boards, audit operational bottlenecks, and design a 90-day execution roadmap for secure model deployments. This is a strategy-first engagement before a single line of code is written.",
    outcomes: [
      "Align executive vision with technical reality",
      "Identify high-ROI automation opportunities",
      "Mitigate AI adoption risks and ensure compliance",
      "Accelerate enterprise time-to-market for AI"
    ],
    deliverables: [
      "AI Readiness Score Report",
      "90-Day Prioritised Roadmap",
      "ROI Forecast per Initiative",
      "Model Risk Register & Policy",
      "Vendor & Stack Recommendation"
    ],
    process: [
      { step: "Discovery", detail: "Stakeholder interviews, workflow audit, and data landscape mapping." },
      { step: "Assessment", detail: "Readiness scoring, risk profiling, and tech-stack analysis." },
      { step: "Strategy", detail: "Prioritised initiative backlog with success KPIs and cost-benefit models." },
      { step: "Execution Plan", detail: "Executive board presentation with ROI justification and risk mitigation." }
    ],
    engagement: {
      model: "Retainer or Fixed-fee",
      team: "Principal Strategist, Solutions Architect",
      price: "From $8,000",
      bestFor: "Organizations seeking a clear AI strategy and risk mitigation before investing in engineering."
    },
    caseStudy: {
      industry: "Global Logistics",
      timeline: "4 Weeks",
      team: "2 Strategists",
      tech: "OpenAI, Governance Frameworks",
      challenge: "Struggled to identify viable generative AI use cases amidst vendor hype and fragmented data.",
      solution: "Conducted a workflow audit and delivered a 90-day roadmap prioritizing 3 specific agentic workflows.",
      outcome: "$1.2M projected annual savings identified with a clear, board-approved path to production.",
      metric: "$1.2M Savings"
    },
    technologies: ["OpenAI", "Anthropic", "Azure AI", "Governance Frameworks", "ROI Modeling"],
    faqs: [
      { q: "How long does a typical strategy engagement last?", a: "Most strategy engagements span 4 to 8 weeks depending on the organization's size and operational complexity." },
      { q: "Do you assess technical readiness?", a: "Yes. Our audit covers data infrastructure, talent, security posture, and current software stacks to ensure feasible execution." }
    ]
  },
  {
    id: "ai-automation",
    title: "AI Automation & Agents",
    color: "#FF8A00",
    icon: Bot,
    description: "Build recursive LLM orchestration pipelines using LangGraph and n8n to automate complex support, CRM enrichment, and outreach workflows. We replace manual, rule-based processes with adaptive, reasoning agents.",
    outcomes: [
      "Reduce operational costs by 40-60%",
      "Eliminate manual data entry and enrichment",
      "Scale customer support without linear headcount growth",
      "Execute complex workflows autonomously 24/7"
    ],
    deliverables: [
      "Multi-agent Pipeline Architecture",
      "Deployed LangGraph/n8n Workflow",
      "Human-in-the-loop Escalation",
      "CRM/ERP Integration Layer",
      "30-day Post-launch Tuning SLA"
    ],
    process: [
      { step: "Process Mining", detail: "Identify bottlenecks in support, sales, or operations workflows." },
      { step: "Agent Design", detail: "Architect multi-agent systems with specialized personas and tool access." },
      { step: "Orchestration", detail: "Build LangGraph/n8n pipelines connecting LLMs to internal APIs." },
      { step: "Deployment", detail: "Deploy with human-in-the-loop escalation paths for safety." }
    ],
    engagement: {
      model: "Project-based or Managed Automation",
      team: "AI Engineer, Automation Specialist",
      price: "From $12,000",
      bestFor: "Operations and support teams overwhelmed by repetitive, manual knowledge-work tasks."
    },
    caseStudy: {
      industry: "B2B SaaS",
      timeline: "6 Weeks",
      team: "3 Engineers",
      tech: "LangGraph, Zendesk, Claude 3.5",
      challenge: "The tier-1 technical support team was overwhelmed by repetitive queries, leading to slow response times.",
      solution: "Deployed a RAG-enabled support agent integrated with Zendesk and internal engineering documentation.",
      outcome: "Deflected 45% of incoming tickets, reducing average resolution time from 12 hours to 3 minutes.",
      metric: "45% Ticket Deflection"
    },
    technologies: ["LangGraph", "n8n", "OpenAI", "Claude 3.5", "Zapier", "Python"],
    faqs: [
      { q: "Are the agents autonomous?", a: "They can be, but we always implement 'human-in-the-loop' escalation for edge cases or sensitive actions." },
      { q: "Can you integrate with our legacy ERP?", a: "Yes, we build custom API wrappers and integration layers to connect modern AI agents to legacy systems." }
    ]
  },
  {
    id: "data-engineering",
    title: "Data & ETL Engineering",
    color: "#7B61FF",
    icon: Database,
    description: "Structure scattered business records and construct modern data lakes that securely feed LLMs, vector indexes, and BI tools. Clean data is the absolute prerequisite for every enterprise AI initiative.",
    outcomes: [
      "Break down organizational data silos",
      "Enable real-time analytics and decision making",
      "Construct a single source of truth",
      "Prepare proprietary data for secure RAG/LLM ingestion"
    ],
    deliverables: [
      "Data Audit & Gap Analysis Report",
      "ETL Pipeline Architecture Design",
      "Deployed Data Lake / Warehouse",
      "Vector Embedding Pipeline",
      "Data Governance & Schema Policy"
    ],
    process: [
      { step: "Audit", detail: "Evaluate data sources, quality, structure, and accessibility." },
      { step: "Architecture", detail: "Design scalable lakehouse and vector database infrastructure." },
      { step: "Ingestion", detail: "Build robust ETL pipelines extracting from SaaS, ERPs, and APIs." },
      { step: "Transformation", detail: "Clean, normalize, and embed data for BI and AI consumption." }
    ],
    engagement: {
      model: "Scoped ETL Build or Ongoing DataOps",
      team: "Data Engineer, Cloud Architect",
      price: "From $15,000",
      bestFor: "Enterprises with fragmented data silos seeking to prepare their infrastructure for AI adoption."
    },
    caseStudy: {
      industry: "Financial Services",
      timeline: "12 Weeks",
      team: "4 Engineers",
      tech: "Snowflake, dbt, Fivetran, pgvector",
      challenge: "Customer data was scattered across 5 disconnected legacy systems, making real-time compliance checking impossible.",
      solution: "Engineered a central Snowflake data warehouse with real-time Fivetran ingestion and vector embeddings.",
      outcome: "Enabled comprehensive customer 360 views and powered a new internal AI compliance checker.",
      metric: "Real-time Compliance"
    },
    technologies: ["Snowflake", "dbt", "Airbyte", "Fivetran", "Pinecone", "pgvector", "Apache Airflow"],
    faqs: [
      { q: "How do you handle PII and sensitive data?", a: "We implement robust masking, encryption-at-rest, and strict RBAC governance policies before data ever reaches a vector index or LLM." },
      { q: "Do you support real-time streaming?", a: "Yes, we design Kafka or cloud-native event streaming architectures for low-latency use cases." }
    ]
  },
  {
    id: "corporate-education",
    title: "Corporate AI Education",
    color: "#FF2ED1",
    icon: GraduationCap,
    description: "Empower technical and business teams with structured cohort training, live workshops, and digital certification sharing. We close the AI skills gap inside your organisation safely and securely.",
    outcomes: [
      "Upskill workforce for the AI era",
      "Standardize prompt engineering best practices",
      "Accelerate internal AI adoption and ideation",
      "Reduce shadow IT by teaching secure tool usage"
    ],
    deliverables: [
      "Custom Industry Curriculum",
      "Actual Workflow Case Studies",
      "Proctored Assessments",
      "Digital Certification & Badges",
      "Post-programme Support SLA"
    ],
    process: [
      { step: "Curriculum", detail: "Tailor content to your specific industry and corporate tools." },
      { step: "Workshops", detail: "Live, interactive sessions (virtual or on-site) with hands-on labs." },
      { step: "Assessment", detail: "Proctored exams and practical workflow assignments." },
      { step: "Certification", detail: "Issue verifiable digital badges via CerebroLearn LMS." }
    ],
    engagement: {
      model: "Workshops or 8-Week Cohorts",
      team: "AI Educator, Technical Lead",
      price: "From $5,000",
      bestFor: "Organizations experiencing inconsistent, insecure, or 'shadow IT' usage of generative AI."
    },
    caseStudy: {
      industry: "Creative Agency",
      timeline: "3 Days",
      team: "1 AI Educator",
      tech: "Prompt Engineering, Copilot",
      challenge: "200+ staff wanted to leverage GenAI, but usage was inconsistent, insecure, and producing low-quality outputs.",
      solution: "Delivered a customized 3-day Prompt Engineering Bootcamp focused on their specific CRM and design workflows.",
      outcome: "Standardized AI usage policies and reported a 30% reduction in initial campaign drafting time across the agency.",
      metric: "30% Time Reduction"
    },
    technologies: ["CerebroLearn LMS", "Prompt Engineering", "Copilot Training", "AI Ethics", "Custom GPTs"],
    faqs: [
      { q: "Are these generic video courses?", a: "No. Our training is live, highly interactive, and customized to use your actual corporate data and workflows as case studies." },
      { q: "Do you offer 'Train-the-Trainer' licenses?", a: "Yes, for enterprise clients we can license our curriculum and train your internal L&D teams to deliver it." }
    ]
  },
  {
    id: "ai-development",
    title: "Custom AI Development",
    color: "#00F57A",
    icon: Code2,
    description: "Train domain-specific private models, build high-performance vector retrieval architectures, and deploy secure inference API microservices. This is true engineering-led product delivery — not prototyping.",
    outcomes: [
      "Launch proprietary AI products",
      "Maintain complete IP ownership and data privacy",
      "Deploy scalable, production-grade microservices",
      "Outperform generic models with fine-tuned accuracy"
    ],
    deliverables: [
      "Fine-tuned LLMs (PEFT/LoRA)",
      "Enterprise RAG Systems",
      "Secure Inference APIs",
      "Agent Frameworks (LangGraph)",
      "Dockerised AI Microservices"
    ],
    process: [
      { step: "Scoping", detail: "Architecture design, data requirements, and feasibility review." },
      { step: "Data Prep", detail: "Dataset curation, preprocessing, and expert annotation." },
      { step: "Engineering", detail: "Model training, RAG pipeline construction, and rigorous evaluation." },
      { step: "Deployment", detail: "Kubernetes/Docker deployment, API wrapping, and 90-day SLA." }
    ],
    engagement: {
      model: "Scoped Build or Enterprise Retainer",
      team: "Full-Stack AI Team",
      price: "From $30,000",
      bestFor: "Product companies needing proprietary AI features or enterprises requiring absolute data privacy."
    },
    caseStudy: {
      industry: "Healthcare Provider",
      timeline: "16 Weeks",
      team: "5 Engineers",
      tech: "Llama 3, vLLM, Kubernetes, Pinecone",
      challenge: "Needed a secure way to query patient histories without exposing Protected Health Information (PHI) to public LLM APIs.",
      solution: "Engineered a private, HIPAA-compliant on-premise RAG system using Llama 3 and a local vector database.",
      outcome: "Reduced chart review time by 60% while maintaining absolute data privacy and retaining 100% IP ownership.",
      metric: "60% Faster Reviews"
    },
    technologies: ["Llama 3", "FastAPI", "Docker", "Kubernetes", "vLLM", "Hugging Face", "Pinecone"],
    faqs: [
      { q: "Who owns the Intellectual Property?", a: "You do. All code, model weights, and data pipelines built during the engagement are transferred fully to the client." },
      { q: "Do you provide post-launch support?", a: "Yes, every custom build includes a 90-day SLA for monitoring, tuning, and bug fixes, with optional long-term maintenance." }
    ]
  }
];

// 2. Interactive Timeline Component
const InteractiveTimeline = ({ process, color }: { process: {step: string, detail: string}[], color: string }) => {
  const [activeStep, setActiveStep] = useState(0);
  const cols = process.length;

  return (
    <div className="flex flex-col gap-8">
      {/* Steps row — equal-width grid so labels never overflow */}
      <div
        className="relative"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {/* Track background */}
        <div className="absolute top-[14px] left-0 w-full h-[2px] bg-white/5 rounded-full" />
        {/* Animated fill */}
        <motion.div 
          className="absolute top-[14px] left-0 h-[2px] rounded-full transition-all duration-500 ease-out"
          style={{ backgroundColor: color, width: `${(activeStep / (cols - 1)) * 100}%` }}
        />

        {process.map((p, i) => (
          <button 
            key={i}
            onMouseEnter={() => setActiveStep(i)}
            onClick={() => setActiveStep(i)}
            className="relative z-10 flex flex-col items-center gap-3 group py-1"
          >
            <div 
              className={cn(
                "w-7 h-7 rounded-full border-[2.5px] flex items-center justify-center transition-all duration-300 bg-surface",
                activeStep === i 
                  ? "scale-110 shadow-lg" 
                  : "scale-100"
              )}
              style={{ 
                borderColor: activeStep >= i ? color : 'rgba(255,255,255,0.15)',
                boxShadow: activeStep === i ? `0 0 16px ${color}40` : 'none'
              }}
            >
              {activeStep === i && (
                <motion.div 
                  layoutId={`active-dot-${color}`}
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: color }} 
                />
              )}
              {activeStep > i && (
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              )}
            </div>
            <span className={cn(
              "text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-center leading-tight transition-colors duration-300 px-1 w-full",
              activeStep === i ? "text-text-primary" : "text-text-muted group-hover:text-text-secondary"
            )}>
              {p.step}
            </span>
          </button>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="p-5 md:p-6 rounded-xl bg-surface border border-border min-h-[90px] flex items-center"
        >
          <p className="text-sm text-text-secondary leading-relaxed">
            <strong className="text-text-primary font-space mr-2">{process[activeStep].step}:</strong>
            {process[activeStep].detail}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// 3. Reusable FAQ Accordion Component (Muted, Tertiary weight)
const FAQAccordion = ({ faqs, color }: { faqs: {q: string, a: string}[], color: string }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="mt-4">
      <div className="flex flex-col gap-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-border dark:border-white/5 last:border-0 overflow-hidden">
            <button 
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full text-left py-5 flex items-center justify-between text-sm font-bold text-text-secondary hover:text-text-primary transition-colors"
            >
              {faq.q}
              <ChevronDown 
                size={16} 
                className={cn("transition-transform duration-300", openIdx === i ? "rotate-180" : "")} 
                style={{ color: openIdx === i ? color : undefined }}
              />
            </button>
            <AnimatePresence>
              {openIdx === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="pb-6 text-sm text-text-muted leading-relaxed pr-8">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Case Study Block
const CaseStudyBlock = ({ study, color }: { study: typeof servicesData[0]['caseStudy'], color: string }) => {
  return (
    <div className="p-8 md:p-10 rounded-2xl bg-surface-elevated dark:bg-gradient-to-br dark:from-white/5 dark:to-transparent border border-border dark:border-white/10 backdrop-blur-md shadow-elevated relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] -z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" style={{ backgroundColor: `${color}15` }} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-7 pb-7 border-b border-border dark:border-white/5">
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-[11px] font-bold tracking-widest uppercase text-text-muted mb-2 flex items-center gap-2">
            <Building size={13} /> {study.industry} Case Study
          </h4>
          <span className="text-xl md:text-2xl font-space font-bold text-text-primary block">{study.metric}</span>
        </div>
        
        <div className="flex flex-col gap-2 text-[10px] font-bold tracking-widest uppercase text-gray-500 shrink-0">
          <span className="flex items-center gap-2"><Clock size={11} /> {study.timeline}</span>
          <span className="flex items-center gap-2"><Users size={11} /> {study.team}</span>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <h5 className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">The Challenge</h5>
          <p className="text-sm text-text-secondary leading-relaxed">{study.challenge}</p>
        </div>
        <div>
          <h5 className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-2">The Solution</h5>
          <p className="text-sm text-text-secondary leading-relaxed">{study.solution}</p>
        </div>
        <div className="p-4 rounded-lg bg-surface border border-border">
          <h5 className="text-[10px] font-bold tracking-widest uppercase mb-1.5" style={{ color: color }}>Measurable Outcome</h5>
          <p className="text-sm text-text-primary font-medium leading-relaxed">{study.outcome}</p>
        </div>
      </div>
    </div>
  );
};

// 5. Engagement Profile Block
const EngagementProfile = ({ engagement, color }: { engagement: typeof servicesData[0]['engagement'], color: string }) => {
  return (
    <div className="p-8 md:p-10 rounded-2xl bg-surface-elevated border border-border shadow-elevated relative overflow-hidden group">
      {/* Decorative star — positioned safely inside the padding */}
      <div className="absolute top-7 right-7">
        <Star size={20} className="opacity-30 group-hover:opacity-80 transition-all duration-300" style={{ color: color }} />
      </div>
      
      <h4 className="text-[11px] font-bold tracking-widest uppercase text-text-muted mb-5 flex items-center gap-2 pr-10">
        <Target size={13} /> Engagement Profile
      </h4>
      
      <div className="mb-6">
        <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted block mb-2">Typical Investment</span>
        <span className="text-3xl md:text-4xl font-mono font-bold block" style={{ color: color }}>{engagement.price}</span>
        <span className="text-sm text-text-secondary mt-2 block">{engagement.model}</span>
      </div>

      <div className="space-y-4 pt-5 border-t border-border">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted block mb-1.5">Team Composition</span>
          <span className="text-sm text-text-secondary">{engagement.team}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-text-muted block mb-1.5">Best For</span>
          <span className="text-sm text-text-secondary leading-relaxed block pr-2">{engagement.bestFor}</span>
        </div>
      </div>
    </div>
  );
};


// Single comet pulse running around the card border
const ElectricalBorder = ({ color, id }: { color: string; id: string }) => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
    xmlns="http://www.w3.org/2000/svg"
    style={{ overflow: 'visible' }}
  >
    <defs>
      <filter id={`comet-blur-${id}`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    {/* Glow tail — wide, blurred, low opacity */}
    <rect
      x="2" y="2" rx="38" ry="38" fill="none"
      stroke={color}
      strokeWidth="8"
      strokeDasharray="90 3400"
      strokeLinecap="round"
      strokeOpacity="0.25"
      filter={`url(#comet-blur-${id})`}
      className="animate-comet-tail"
      style={{ width: 'calc(100% - 4px)', height: 'calc(100% - 4px)' }}
    />
    {/* Sharp comet head — small bright dot leading the tail */}
    <rect
      x="2" y="2" rx="38" ry="38" fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeDasharray="6 3474"
      strokeLinecap="round"
      strokeOpacity="1"
      className="animate-comet-head"
      style={{ width: 'calc(100% - 4px)', height: 'calc(100% - 4px)' }}
    />
  </svg>
);

// Main Service Block Component
const ServiceBlock = ({ service, index }: { service: typeof servicesData[0], index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const isEven = index % 2 === 0;
  
  const { setHoveredService, setActiveService } = useServiceAnimation();

  return (
    <motion.div 
      id={service.id}
      ref={ref}
      onMouseEnter={() => setHoveredService(service.id)}
      onMouseLeave={() => setHoveredService(null)}
      onClick={() => setActiveService(service.id)}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.9, ease: "easeOut", delay: index * 0.05 }}
      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-10 lg:gap-16 xl:gap-20 p-6 md:p-10 lg:p-14 xl:p-16 glass rounded-[2.5rem] shadow-sm hover:shadow-elevated scroll-mt-40 relative group cursor-pointer transition-shadow duration-300`}
    >
      {/* Electrical comet border */}
      <ElectricalBorder color={service.color} id={service.id} />
      {/* Glow orb — own overflow-hidden container so it never clips card content */}
      <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none z-0">
        <div 
          className={`absolute top-0 ${isEven ? 'left-0' : 'right-0'} w-[30rem] h-[30rem] blur-[120px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700`}
          style={{ backgroundColor: service.color }}
        />
      </div>
      {/* Left/Content Column */}
      <div className={`flex-1 flex flex-col gap-8 relative z-10 p-2 md:p-4 ${isEven ? 'lg:pl-6 lg:pr-2' : 'lg:pr-6 lg:pl-2'}`}>
        
        {/* Header — vertical stack so title never competes with icon for width */}
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div 
              className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center backdrop-blur-md border"
              style={{ backgroundColor: `${service.color}15`, borderColor: `${service.color}30`, color: service.color }}
            >
              <service.icon size={24} strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase block text-text-muted">Service Line 0{index + 1}</span>
          </div>
          <h2 className="text-3xl md:text-4xl xl:text-5xl font-space font-bold text-text-primary leading-tight mb-5">{service.title}</h2>
          <p className="text-base md:text-lg text-text-secondary leading-relaxed font-inter">{service.description}</p>
        </div>

        {/* Business Outcomes */}
        <div>
          <h4 className="text-[11px] font-bold tracking-widest uppercase text-text-muted mb-5 flex items-center gap-2">
            <Target size={13} /> Business Outcomes
          </h4>
          <div className="flex flex-col gap-3.5 pl-1">
            {service.outcomes.map((outcome, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" style={{ color: service.color }} />
                <span className="text-text-primary font-medium text-sm leading-relaxed">{outcome}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key Deliverables */}
        <div className="pt-6 border-t border-border">
          <h4 className="text-[11px] font-bold tracking-widest uppercase text-text-muted mb-5 flex items-center gap-2">
            <ShieldCheck size={13} /> Key Deliverables
          </h4>
          <div className="flex flex-col gap-2.5 pl-1">
            {service.deliverables.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: service.color }} />
                <span className="text-sm text-text-secondary font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Core Technologies */}
        <div className="pt-6 border-t border-border">
          <h4 className="text-[11px] font-bold tracking-widest uppercase text-text-muted mb-4 flex items-center gap-2">
            <Cpu size={13} /> Core Technologies
          </h4>
          <div className="flex flex-wrap gap-2 pl-1">
            {service.technologies.map((tech, i) => (
              <span key={i} className="px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wide uppercase bg-surface-elevated border border-border text-text-secondary">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="pt-6 border-t border-border">
          <h4 className="text-[11px] font-bold tracking-widest uppercase text-text-muted mb-1 flex items-center gap-2">
            <Search size={13} /> Common Questions
          </h4>
          <FAQAccordion faqs={service.faqs} color={service.color} />
        </div>

      </div>

      {/* Right/Visual Column */}
      <div className={`flex-1 flex flex-col gap-6 p-2 md:p-4 ${isEven ? 'lg:pr-6 lg:pl-2' : 'lg:pl-6 lg:pr-2'}`}>
        
        {/* Varying Visual Rhythm based on Even/Odd */}
        {isEven ? (
          <>
            {/* Case Study prominent at top for Even */}
            <CaseStudyBlock study={service.caseStudy} color={service.color} />
            
            <div className="p-6 md:p-8 rounded-2xl bg-surface-elevated border border-border shadow-elevated overflow-hidden">
              <h4 className="text-[11px] font-bold tracking-widest uppercase text-text-muted mb-6 flex items-center gap-2">
                <Activity size={14} /> Methodology
              </h4>
              <InteractiveTimeline process={service.process} color={service.color} />
            </div>

            <EngagementProfile engagement={service.engagement} color={service.color} />
          </>
        ) : (
          <>
            {/* Methodology prominent at top for Odd */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface-elevated border border-border shadow-elevated overflow-hidden">
              <h4 className="text-[11px] font-bold tracking-widest uppercase text-text-muted mb-6 flex items-center gap-2">
                <Activity size={14} /> Methodology
              </h4>
              <InteractiveTimeline process={service.process} color={service.color} />
            </div>

            <EngagementProfile engagement={service.engagement} color={service.color} />

            <CaseStudyBlock study={service.caseStudy} color={service.color} />
          </>
        )}

      </div>
    </motion.div>
  );
};

// ScrollSpy Sticky Navigation
const StickyNav = () => {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      // Offset by ~250px so it highlights when the section is nicely in view
      const scrollPosition = window.scrollY + 250; 
      
      let current = "";
      for (const service of servicesData) {
        const element = document.getElementById(service.id);
        if (element && element.offsetTop <= scrollPosition) {
          current = service.id;
        }
      }
      setActiveId(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative z-[100] hidden lg:block">
      <div className="backdrop-blur-xl bg-white/80 dark:bg-black/80 border-b border-gray-200 dark:border-white/10 shadow-sm py-5">
        <div className="container-wide flex justify-center gap-12">
          {servicesData.map(s => {
            const isActive = activeId === s.id;
            return (
              <a 
                key={s.id} 
                href={`#${s.id}`} 
                className={cn(
                  "text-xs font-bold tracking-widest uppercase transition-all duration-300 relative py-1.5 whitespace-nowrap",
                  isActive 
                    ? "text-gray-900 dark:text-white" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100"
                )}
              >
                {s.title}
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className="absolute -bottom-[22px] left-0 w-full h-[2.5px] rounded-t-full"
                    style={{ backgroundColor: s.color }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function ServicesPage() {
  const scrollContainerRef = useRef<HTMLElement>(null);
  
  return (
    <ServiceAnimationProvider>
      <div className="bg-transparent min-h-screen selection:bg-primary-accent/30 transition-colors duration-500">
        
        {/* Premium Hero Section */}
        <section ref={scrollContainerRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
          <ServiceMorphBackground scrollContainerRef={scrollContainerRef} />
          
          <div className="container-wide relative z-10 flex flex-col items-center text-center mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl flex flex-col items-center w-full"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 backdrop-blur-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Enterprise AI Capabilities</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6">
              World-Class <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00F57A]">Consulting & Delivery</span>
            </h1>
            
            <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10">
              We partner with ambitious organizations to design AI-powered systems, enterprise software, and scalable digital platforms that drive measurable impact.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
              <Link href="/contact" className="group relative">
                <div className="absolute inset-0 bg-primary-accent blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300 rounded-lg" />
                <button className="relative px-8 py-4 bg-primary-accent text-black font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center gap-3 transition-transform duration-300 group-hover:-translate-y-1">
                  Schedule a Strategy Consultation
                </button>
              </Link>
              <a href="#ai-consulting" className="px-8 py-4 bg-transparent border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:border-primary-accent/50 hover:bg-surface-elevated transition-all duration-300">
                Explore Our Services
              </a>
            </div>

            {/* Proof Metrics Row */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-24 pt-12 mt-4 border-t border-border w-full max-w-3xl opacity-80">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-space font-bold text-text-primary mb-2">50+</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">AI Projects Delivered</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-space font-bold text-text-primary mb-2">E2E</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Strategy to Production</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-space font-bold text-text-primary mb-2">100%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Enterprise Ready</span>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Sticky Service Navigation */}
      <StickyNav />

      {/* Services List */}
      <section className="section-pad-sm relative z-0">
        <div className="container-wide max-w-7xl mx-auto">
          <div className="flex flex-col gap-8 lg:gap-10 xl:gap-12">
            {servicesData.map((service, index) => (
              <ServiceBlock key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Final Premium CTA Section */}
      <section className="section-pad relative overflow-hidden bg-surface-elevated border-t border-border">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(128,128,128,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(128,128,128,0.05)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-transparent to-surface-elevated" />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary-accent/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container-wide relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center flex flex-col items-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-space font-bold text-text-primary leading-tight mb-8">
              Ready to Build Intelligent Systems <br className="hidden lg:block"/>
              That Deliver <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">Business Value?</span>
            </h2>
            
            <p className="text-lg text-text-secondary font-inter max-w-[700px] mx-auto leading-relaxed mb-12">
              From executive AI strategy to production-grade AI systems, CerebroHive partners with organizations to deliver measurable outcomes.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-16">
              <Link href="/contact" className="group relative">
                <div className="absolute inset-0 bg-primary-accent blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300 rounded-lg" />
                <button className="relative px-8 py-4 bg-primary-accent text-black font-space font-bold text-sm uppercase tracking-widest rounded-lg flex items-center gap-3 transition-transform duration-300 group-hover:-translate-y-1">
                  Schedule a Strategy Consultation
                  <ArrowRight size={16} />
                </button>
              </Link>

              <Link href="/contact">
                <button className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-lg hover:border-primary-accent/50 hover:bg-surface-elevated transition-all duration-300 shadow-sm">
                  Contact Our Team
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
    </ServiceAnimationProvider>
  );
}
