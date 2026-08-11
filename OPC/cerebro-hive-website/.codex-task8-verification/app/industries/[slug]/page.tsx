import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle, TrendingUp } from "lucide-react";

const INDUSTRIES = [
  {
    slug: "finance",
    name: "Financial Services",
    icon: "🏦",
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    tagline: "AI-powered banking, insurance, and capital markets.",
    overview:
      "Financial services firms face relentless pressure to reduce risk, cut costs, and improve client experience — all under strict regulatory scrutiny. CerebroHive delivers AI programs purpose-built for FSI: fraud-resistant, explainable, audit-ready, and NIST/SOC 2/FedRAMP aligned.",
    compliance: ["SOC 2 Type II", "NIST AI RMF", "FINRA", "BSA/AML", "GDPR", "CCPA"],
    useCases: [
      {
        name: "Fraud Detection",
        description: "Real-time transaction scoring with <50ms latency and >97% precision on confirmed fraud.",
        products: ["HiveModels™", "HiveObservatory™", "CerebroCompliance™"],
        roi: ">$5M annual fraud loss reduction per $1M deployed",
      },
      {
        name: "Credit Risk Modeling",
        description: "ML-powered underwriting with SHAP explainability satisfying model risk management requirements.",
        products: ["HiveModels™", "HiveData™", "HiveEvaluation™"],
        roi: "15–25% improvement in approval accuracy",
      },
      {
        name: "KYC / AML Automation",
        description: "Document AI + entity resolution for onboarding — reducing KYC cycle time from days to hours.",
        products: ["CerebroArchive™", "HiveKnowledge™", "CerebroCompliance™"],
        roi: "60–70% reduction in manual review cost",
      },
      {
        name: "Algorithmic Trading Intelligence",
        description: "Market signal extraction, portfolio optimization models, and trade execution analytics.",
        products: ["HiveModels™", "HiveData™", "CerebroInsight™"],
        roi: "Alpha generation + reduced operational risk",
      },
    ],
    metrics: ["<50ms fraud scoring latency", "97%+ fraud detection precision", "70% KYC cost reduction", "SOC 2 + NIST compliant"],
    services: [
      { name: "AI Strategy", href: "/services/strategy" },
      { name: "Security & Governance", href: "/services/security" },
      { name: "AI Engineering", href: "/services/engineering" },
    ],
    caseStudy: "Regional bank reduced fraud losses by $8M in Year 1 with HiveModels™ real-time scoring integrated into their core banking platform.",
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    icon: "🏥",
    color: "text-rose-400",
    border: "border-rose-500/30",
    bg: "bg-rose-500/5",
    tagline: "Clinical AI and operational excellence within HIPAA.",
    overview:
      "Healthcare organizations must balance clinical excellence, operational efficiency, and strict compliance. CerebroHive builds AI systems that improve care quality and reduce administrative burden — all within a HIPAA-compliant, BAA-backed architecture.",
    compliance: ["HIPAA / HITECH", "SOC 2 Type II", "HITRUST", "ONC 21st Century Cures", "HL7 FHIR"],
    useCases: [
      {
        name: "Clinical Documentation AI",
        description: "Ambient AI that drafts SOAP notes, discharge summaries, and prior auth letters from physician conversations.",
        products: ["CerebroAgent™", "CerebroArchive™", "HiveVector™"],
        roi: "2+ hours saved per clinician per day",
      },
      {
        name: "Prior Authorization Automation",
        description: "End-to-end prior auth workflow — extraction, payer rule matching, submission, and follow-up.",
        products: ["CerebroFlow™", "CerebroArchive™", "HiveAPI™"],
        roi: "85% of prior auths processed without human touch",
      },
      {
        name: "Revenue Cycle Optimization",
        description: "Predictive denial management, coding accuracy AI, and claim scrubbing to maximize clean claim rate.",
        products: ["HiveModels™", "CerebroArchive™", "CerebroInsight™"],
        roi: "3–5% net revenue increase, denial rate cut by 40%",
      },
      {
        name: "Care Coordination AI",
        description: "Risk stratification, readmission prediction, and care gap identification for population health programs.",
        products: ["HiveModels™", "HiveData™", "CerebroInsight™"],
        roi: "20% reduction in 30-day readmissions",
      },
    ],
    metrics: ["HIPAA + BAA covered", "2hr/clinician/day saved", "85% touchless prior auth", "40% denial reduction"],
    services: [
      { name: "Industry Solutions", href: "/services/industry" },
      { name: "AI Engineering", href: "/services/engineering" },
      { name: "Security & Governance", href: "/services/security" },
    ],
    caseStudy: "Health system with 1,200 physicians reduced clinical documentation time by 2.3 hours/day per provider after deploying CerebroAgent™ ambient AI.",
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    icon: "🏭",
    color: "text-orange-400",
    border: "border-orange-500/30",
    bg: "bg-orange-500/5",
    tagline: "Industry 4.0 — predictive, autonomous, optimized.",
    overview:
      "Manufacturing's digital transformation requires AI that speaks the language of OEE, MTBF, and throughput. CerebroHive builds predictive maintenance, visual quality inspection, and production optimization systems that integrate directly into SCADA, MES, and ERP platforms.",
    compliance: ["ISO 9001", "ISO 27001", "IEC 62443", "OSHA Safety Standards"],
    useCases: [
      {
        name: "Predictive Maintenance",
        description: "IoT sensor data + ML models predict equipment failures 7–14 days in advance, enabling planned maintenance.",
        products: ["HiveModels™", "HiveData™", "HiveObservatory™"],
        roi: "35% reduction in unplanned downtime, 20% maintenance cost reduction",
      },
      {
        name: "Visual Quality Inspection",
        description: "Computer vision models on production lines detect defects with >99% accuracy at production speed.",
        products: ["HiveModels™", "HiveObservatory™", "CerebroInsight™"],
        roi: "90% defect capture rate vs. 70% manual inspection baseline",
      },
      {
        name: "Production Scheduling AI",
        description: "Constraint-aware production scheduling that maximizes throughput given machine capacity, labor, and demand.",
        products: ["CerebroFlow™", "HiveModels™", "HiveData™"],
        roi: "8–15% throughput improvement, WIP reduction",
      },
      {
        name: "OEE Improvement",
        description: "Real-time OEE dashboards with AI root cause analysis identifying the top 20% of losses driving 80% of downtime.",
        products: ["CerebroInsight™", "HiveObservatory™", "HiveData™"],
        roi: "5–12 OEE percentage point improvement",
      },
    ],
    metrics: ["35% downtime reduction", "99%+ visual defect detection", "15% throughput gain", "5–12pt OEE improvement"],
    services: [
      { name: "AI Engineering", href: "/services/engineering" },
      { name: "AI Operations", href: "/services/operations" },
      { name: "Industry Solutions", href: "/services/industry" },
    ],
    caseStudy: "Tier-1 automotive supplier reduced unplanned downtime by 38% in 6 months using HiveModels™ predictive maintenance on 400+ CNC machines.",
  },
  {
    slug: "retail",
    name: "Retail & eCommerce",
    icon: "🛍️",
    color: "text-pink-400",
    border: "border-pink-500/30",
    bg: "bg-pink-500/5",
    tagline: "Demand intelligence, personalization, and inventory AI.",
    overview:
      "Retail success hinges on being in stock on what customers want, personalizing every touchpoint, and reducing cost-to-serve. CerebroHive's retail AI programs address the full value chain from supply planning through post-purchase customer experience.",
    compliance: ["PCI DSS", "GDPR", "CCPA", "CPRA"],
    useCases: [
      {
        name: "Demand Forecasting",
        description: "SKU-level demand forecasting incorporating promotions, weather, events, and external signals for 1–52 week horizons.",
        products: ["HiveModels™", "HiveData™", "CerebroInsight™"],
        roi: "30% reduction in stockouts, 20% reduction in overstock",
      },
      {
        name: "Personalization Engine",
        description: "Real-time product recommendations, dynamic pricing, and personalized email/push across every channel.",
        products: ["CerebroCustomer360™", "HiveModels™", "CerebroAgent™"],
        roi: "15–25% increase in conversion, +8% AOV",
      },
      {
        name: "Inventory Optimization",
        description: "Safety stock optimization, replenishment automation, and DC-to-store allocation with ML-driven reorder points.",
        products: ["HiveModels™", "HiveData™", "CerebroFlow™"],
        roi: "18% inventory reduction while maintaining fill rate",
      },
      {
        name: "Customer Service AI",
        description: "AI agent handling returns, order status, exchanges, and product questions with >70% containment.",
        products: ["CerebroAgent™", "CerebroFlow™", "CerebroCustomer360™"],
        roi: "40% cost-to-serve reduction, CSAT maintained",
      },
    ],
    metrics: ["30% stockout reduction", "25% conversion lift", "18% inventory reduction", "40% service cost reduction"],
    services: [
      { name: "AI Engineering", href: "/services/engineering" },
      { name: "Industry Solutions", href: "/services/industry" },
      { name: "AI Operations", href: "/services/operations" },
    ],
    caseStudy: "Specialty retailer (450 stores + eCommerce) reduced inventory by $42M while improving in-stock rate by 6 points using demand forecasting AI.",
  },
  {
    slug: "government",
    name: "Government",
    icon: "🏛️",
    color: "text-slate-400",
    border: "border-slate-500/30",
    bg: "bg-slate-500/5",
    tagline: "Secure, compliant AI for public sector transformation.",
    overview:
      "Government agencies require AI that meets the highest security and compliance bars — FedRAMP, FISMA, and NIST SP 800-53 — while genuinely improving citizen outcomes and operational efficiency. CerebroHive delivers government-grade AI programs with full ATO support.",
    compliance: ["FedRAMP Moderate/High", "FISMA", "NIST SP 800-53", "Section 508", "ITAR (where applicable)", "NIST AI RMF"],
    useCases: [
      {
        name: "Citizen Service AI",
        description: "AI-powered service desk handling benefits inquiries, permit applications, and case status across voice and web.",
        products: ["CerebroAgent™", "CerebroFlow™", "HiveVector™"],
        roi: "65% citizen inquiry containment, 40% cost-per-transaction reduction",
      },
      {
        name: "Document Processing Automation",
        description: "Intelligent extraction from government forms, applications, and records — with audit trail and exception workflow.",
        products: ["CerebroArchive™", "HiveData™", "CerebroFlow™"],
        roi: "75% straight-through processing rate for standard forms",
      },
      {
        name: "Procurement Intelligence",
        description: "AI-assisted acquisition — vendor risk scoring, contract analysis, spend analytics, and compliance checking.",
        products: ["HiveKnowledge™", "CerebroArchive™", "HiveModels™"],
        roi: "12–18% procurement cost reduction",
      },
      {
        name: "Compliance Reporting Automation",
        description: "Automated generation and submission of regulatory and oversight reporting with 100% on-time delivery.",
        products: ["CerebroFlow™", "CerebroCompliance™", "CerebroArchive™"],
        roi: "90% reduction in manual reporting effort",
      },
    ],
    metrics: ["FedRAMP Moderate aligned", "65% citizen inquiry containment", "75% touchless form processing", "90% reporting automation"],
    services: [
      { name: "Security & Governance", href: "/services/security" },
      { name: "AI Strategy", href: "/services/strategy" },
      { name: "Industry Solutions", href: "/services/industry" },
    ],
    caseStudy: "Federal agency achieved FedRAMP authorization for AI document processing platform in 11 months, processing 2M+ documents annually.",
  },
  {
    slug: "insurance",
    name: "Insurance",
    icon: "🛡️",
    color: "text-indigo-400",
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/5",
    tagline: "Underwriting AI, claims automation, and fraud detection.",
    overview:
      "Insurance carriers and MGAs face mounting loss ratios, claims complexity, and fraud sophistication. CerebroHive builds actuarially sound AI programs for underwriting, claims, and fraud — with full model risk management documentation for state regulatory filing.",
    compliance: ["NAIC Model Laws", "State Insurance Regulations", "SOC 2 Type II", "CCPA", "GDPR (EU lines)"],
    useCases: [
      {
        name: "Underwriting AI",
        description: "Predictive underwriting models incorporating third-party data, loss history, and risk signals for P&C, life, and specialty lines.",
        products: ["HiveModels™", "HiveData™", "HiveEvaluation™"],
        roi: "8–15% loss ratio improvement, 40% underwriting cycle time reduction",
      },
      {
        name: "Claims Triage & Automation",
        description: "AI-driven FNOL intake, damage estimation, coverage determination, and payment automation for fast-track claims.",
        products: ["CerebroFlow™", "CerebroArchive™", "HiveModels™"],
        roi: "70% of simple claims closed within 24 hours",
      },
      {
        name: "Fraud Detection",
        description: "Multi-signal fraud scoring on new business and claims — network analysis, behavioral signals, and anomaly detection.",
        products: ["HiveModels™", "HiveKnowledge™", "HiveObservatory™"],
        roi: "$3–8M annual fraud savings per $1B GWP",
      },
      {
        name: "FNOL Automation",
        description: "AI-powered first notice of loss — multi-channel intake, data extraction, assignment, and acknowledgment in minutes.",
        products: ["CerebroAgent™", "CerebroFlow™", "CerebroArchive™"],
        roi: "FNOL cycle time from days to under 1 hour",
      },
    ],
    metrics: ["8–15pt loss ratio improvement", "70% claims closed <24h", "$3–8M fraud savings per $1B GWP", "60% FNOL automation"],
    services: [
      { name: "Industry Solutions", href: "/services/industry" },
      { name: "AI Engineering", href: "/services/engineering" },
      { name: "Security & Governance", href: "/services/security" },
    ],
    caseStudy: "Regional P&C carrier reduced combined ratio by 4.2 points in 18 months using underwriting AI and claims triage automation across personal lines.",
  },
  {
    slug: "energy",
    name: "Energy & Utilities",
    icon: "⚡",
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    tagline: "Grid intelligence, asset health, and demand optimization.",
    overview:
      "Energy and utility companies manage aging infrastructure, renewable integration complexity, and regulatory demands — all while keeping the lights on. CerebroHive builds AI programs for grid operations, asset management, and demand optimization that integrate with SCADA, EMS, and OT systems.",
    compliance: ["NERC CIP", "ISO 27001", "NIST CSF", "FERC Regulations", "IEC 62443 (OT)"],
    useCases: [
      {
        name: "Asset Health Monitoring",
        description: "Continuous monitoring of transformers, turbines, substations, and distribution assets with failure probability scoring.",
        products: ["HiveModels™", "HiveData™", "HiveObservatory™"],
        roi: "30% reduction in asset failures, 25% maintenance capex optimization",
      },
      {
        name: "Demand Forecasting",
        description: "Hour-ahead to year-ahead demand forecasting incorporating weather, economic, and behavioral signals for grid planning.",
        products: ["HiveModels™", "HiveData™", "CerebroInsight™"],
        roi: "40% reduction in forecast error vs. statistical baseline",
      },
      {
        name: "Outage Prediction & Prevention",
        description: "Distribution circuit-level outage risk scoring enabling proactive vegetation management and circuit hardening prioritization.",
        products: ["HiveModels™", "HiveObservatory™", "CerebroInsight™"],
        roi: "20% reduction in outage frequency, improved SAIDI/SAIFI",
      },
      {
        name: "Renewable Integration",
        description: "Wind and solar generation forecasting, battery dispatch optimization, and grid stability monitoring for high-renewable grids.",
        products: ["HiveModels™", "HiveData™", "CerebroFlow™"],
        roi: "15% improvement in renewable utilization, curtailment reduction",
      },
    ],
    metrics: ["30% asset failure reduction", "40% forecast error reduction", "20% outage reduction", "NERC CIP compliant architecture"],
    services: [
      { name: "AI Engineering", href: "/services/engineering" },
      { name: "AI Operations", href: "/services/operations" },
      { name: "Security & Governance", href: "/services/security" },
    ],
    caseStudy: "Investor-owned utility reduced transformer failure rate by 31% and avoided $12M in emergency capital spend using asset health AI across 8,000+ transformers.",
  },
  {
    slug: "construction",
    name: "Construction",
    icon: "🏗️",
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    tagline: "Project intelligence, safety, and supply chain AI.",
    overview:
      "Construction projects routinely run over budget and behind schedule — not from lack of effort, but lack of intelligence. CerebroHive builds AI programs for project risk prediction, safety monitoring, and supply chain visibility that give GCs and owners the data advantage.",
    compliance: ["OSHA 1926", "ISO 45001", "ISO 27001", "Davis-Bacon (federal projects)"],
    useCases: [
      {
        name: "Project Risk AI",
        description: "Early warning system scoring schedule delay, cost overrun, and safety risk across projects using RFI patterns, weather, and progress data.",
        products: ["HiveModels™", "CerebroInsight™", "HiveData™"],
        roi: "15–20% reduction in project overrun rate, earlier intervention",
      },
      {
        name: "Jobsite Safety Monitoring",
        description: "Computer vision on jobsite cameras detecting PPE violations, unsafe proximity to equipment, and restricted zone breaches in real time.",
        products: ["HiveModels™", "HiveObservatory™", "CerebroAgent™"],
        roi: "40% reduction in recordable incidents, OSHA citation reduction",
      },
      {
        name: "Materials Forecasting",
        description: "ML-driven material quantity forecasting tied to schedule, enabling better procurement timing and waste reduction.",
        products: ["HiveModels™", "HiveData™", "CerebroFlow™"],
        roi: "10–15% materials waste reduction, improved purchase timing",
      },
      {
        name: "Subcontractor Management AI",
        description: "Subcontractor performance scoring, payment prediction, and risk flagging across the project portfolio.",
        products: ["HiveModels™", "HiveKnowledge™", "CerebroInsight™"],
        roi: "25% reduction in subcontractor-driven schedule delays",
      },
    ],
    metrics: ["20% project overrun reduction", "40% safety incident reduction", "15% materials waste reduction", "Real-time jobsite intelligence"],
    services: [
      { name: "Industry Solutions", href: "/services/industry" },
      { name: "AI Engineering", href: "/services/engineering" },
      { name: "AI Operations", href: "/services/operations" },
    ],
    caseStudy: "Top-10 GC deployed jobsite safety AI across 22 active projects, reducing recordable incidents by 43% and near-miss reports up 280% (improved reporting culture).",
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    icon: "🏢",
    color: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5",
    tagline: "Valuation AI, tenant intelligence, and property operations.",
    overview:
      "Real estate firms — from REITs to PropTech platforms to CRE operators — are sitting on enormous property and transaction datasets. CerebroHive builds AI programs that extract alpha from that data: better valuations, lower vacancy, optimized operations.",
    compliance: ["Fair Housing Act (AVM fairness)", "SOC 2 Type II", "GDPR / CCPA (tenant data)"],
    useCases: [
      {
        name: "Automated Valuation Models",
        description: "ML-powered AVMs producing accurate, defensible property valuations with confidence intervals and comparables.",
        products: ["HiveModels™", "HiveData™", "CerebroInsight™"],
        roi: "RMSE 40% better than traditional regression, 10× faster valuation",
      },
      {
        name: "Tenant Churn Prediction",
        description: "Predict lease renewal probability 6–12 months in advance for each tenant, enabling proactive retention programs.",
        products: ["HiveModels™", "CerebroCustomer360™", "CerebroInsight™"],
        roi: "15–20% improvement in retention rate, 8% NOI improvement",
      },
      {
        name: "Property Operations AI",
        description: "Maintenance request triage, vendor dispatch, preventive maintenance scheduling, and energy optimization for managed properties.",
        products: ["CerebroFlow™", "CerebroAgent™", "HiveModels™"],
        roi: "20% maintenance cost reduction, tenant satisfaction improvement",
      },
      {
        name: "Market Intelligence",
        description: "Real-time market data aggregation, rent trend forecasting, and supply/demand analysis for acquisition and leasing decisions.",
        products: ["HiveData™", "HiveModels™", "CerebroInsight™"],
        roi: "Better acquisition pricing, 10–15% higher rent capture at lease-up",
      },
    ],
    metrics: ["40% valuation accuracy improvement", "15–20% tenant retention gain", "20% maintenance cost reduction", "Real-time market intelligence"],
    services: [
      { name: "AI Engineering", href: "/services/engineering" },
      { name: "Industry Solutions", href: "/services/industry" },
      { name: "AI Operations", href: "/services/operations" },
    ],
    caseStudy: "Multifamily REIT with 25,000 units improved tenant retention by 18% and increased NOI by $4.2M annually using churn prediction and proactive renewal outreach AI.",
  },
  {
    slug: "logistics",
    name: "Logistics & Supply Chain",
    icon: "🚚",
    color: "text-cyan-400",
    border: "border-cyan-500/30",
    bg: "bg-cyan-500/5",
    tagline: "Supply chain optimization, route intelligence, and resilience.",
    overview:
      "Supply chains face compounding volatility — geopolitical disruption, demand shocks, and capacity constraints. CerebroHive builds AI programs that add sensing, prediction, and optimization capabilities across the full logistics network.",
    compliance: ["C-TPAT", "ISO 28000", "SOC 2 Type II", "TSA Security (air freight)"],
    useCases: [
      {
        name: "Route Optimization",
        description: "Dynamic route optimization incorporating real-time traffic, delivery constraints, vehicle capacity, and time windows.",
        products: ["HiveModels™", "CerebroFlow™", "HiveData™"],
        roi: "12–18% transportation cost reduction, 25% on-time delivery improvement",
      },
      {
        name: "Demand Sensing",
        description: "Short-horizon (1–4 week) demand sensing using POS data, order signals, and external indicators — faster than statistical forecasting.",
        products: ["HiveModels™", "HiveData™", "CerebroInsight™"],
        roi: "35% forecast error reduction at 2-week horizon",
      },
      {
        name: "Disruption Prediction",
        description: "Supply chain risk intelligence: supplier financial health, geopolitical risk, weather, and logistics capacity signals.",
        products: ["HiveKnowledge™", "HiveModels™", "HiveData™"],
        roi: "Early warning enabling 3–6 week disruption lead time vs. reactive response",
      },
      {
        name: "Supplier Risk Scoring",
        description: "Continuous supplier risk monitoring across financial, operational, and compliance dimensions with automated alerting.",
        products: ["HiveModels™", "HiveKnowledge™", "CerebroInsight™"],
        roi: "25% reduction in supplier-caused disruptions",
      },
    ],
    metrics: ["18% transport cost reduction", "35% forecast error reduction", "3–6 week disruption lead time", "25% supplier disruption reduction"],
    services: [
      { name: "AI Engineering", href: "/services/engineering" },
      { name: "AI Operations", href: "/services/operations" },
      { name: "Industry Solutions", href: "/services/industry" },
    ],
    caseStudy: "3PL with 50M annual shipments reduced fuel cost by $18M/year and improved on-time delivery by 6 points using dynamic route optimization AI.",
  },
  {
    slug: "education",
    name: "Education",
    icon: "🎓",
    color: "text-teal-400",
    border: "border-teal-500/30",
    bg: "bg-teal-500/5",
    tagline: "Adaptive learning, AI tutoring, and institutional analytics.",
    overview:
      "Education institutions need AI that improves learning outcomes and institutional efficiency — while protecting student data and maintaining FERPA compliance. CerebroHive builds AI programs for adaptive learning, AI tutoring, and institutional analytics.",
    compliance: ["FERPA", "COPPA (K-12)", "SOC 2 Type II", "WCAG 2.1 AA (Section 508)"],
    useCases: [
      {
        name: "Adaptive Learning",
        description: "Personalized learning paths that adapt content difficulty, pacing, and modality to each learner's mastery level and learning style.",
        products: ["HiveModels™", "HiveData™", "CerebroAgent™"],
        roi: "30% improvement in learning outcomes, 20% course completion rate increase",
      },
      {
        name: "AI Tutoring",
        description: "24/7 AI tutoring assistant answering subject matter questions, explaining concepts, and providing practice problems with feedback.",
        products: ["CerebroAgent™", "HiveVector™", "HiveKnowledge™"],
        roi: "40% reduction in office hours demand, student engagement +25%",
      },
      {
        name: "Curriculum Analytics",
        description: "Learning analytics identifying content gaps, assessment inefficiencies, and instructional improvement opportunities across courses.",
        products: ["CerebroInsight™", "HiveData™", "HiveModels™"],
        roi: "Data-driven curriculum improvement, assessment validity scoring",
      },
      {
        name: "Student Engagement & Retention",
        description: "Early alert system predicting at-risk students 6–8 weeks in advance, triggering proactive advisor outreach.",
        products: ["HiveModels™", "CerebroInsight™", "CerebroAgent™"],
        roi: "15% improvement in retention rate, 3–5% graduation rate improvement",
      },
    ],
    metrics: ["30% learning outcome improvement", "40% tutoring cost reduction", "15% retention improvement", "FERPA + COPPA compliant"],
    services: [
      { name: "Industry Solutions", href: "/services/industry" },
      { name: "AI Engineering", href: "/services/engineering" },
      { name: "AI Strategy", href: "/services/strategy" },
    ],
    caseStudy: "State university system with 85,000 students improved first-year retention by 16% using early alert AI — generating $12M in annual tuition retention value.",
  },
  {
    slug: "telecom",
    name: "Telecommunications",
    icon: "📡",
    color: "text-sky-400",
    border: "border-sky-500/30",
    bg: "bg-sky-500/5",
    tagline: "Network AI, churn prediction, and revenue assurance.",
    overview:
      "Telecoms manage the world's most complex networks while competing on customer experience and managing churn. CerebroHive builds AI programs for network operations, predictive churn, revenue assurance, and 5G optimization.",
    compliance: ["CPNI (FCC)", "GDPR / CCPA", "SOC 2 Type II", "ISO 27001", "CALEA"],
    useCases: [
      {
        name: "Network Anomaly Detection",
        description: "Real-time anomaly detection across network telemetry — identifying degradation, outages, and security events before customers report.",
        products: ["HiveModels™", "HiveObservatory™", "HiveData™"],
        roi: "MTTD reduced from 45 min to <5 min, 40% fewer customer-reported outages",
      },
      {
        name: "Predictive Churn",
        description: "30–60 day churn prediction at the subscriber level with personalized retention offer optimization.",
        products: ["HiveModels™", "CerebroCustomer360™", "CerebroInsight™"],
        roi: "25% reduction in voluntary churn, 3× ROI on retention spend",
      },
      {
        name: "Revenue Assurance AI",
        description: "Automated detection of billing leakage, usage anomalies, and provisioning errors across millions of accounts.",
        products: ["HiveModels™", "HiveObservatory™", "CerebroCompliance™"],
        roi: "0.5–1.5% revenue recovery (material for Tier-1 carriers)",
      },
      {
        name: "5G Network Optimization",
        description: "ML-driven radio resource management, beam optimization, and capacity planning for 5G RAN.",
        products: ["HiveModels™", "HiveData™", "CerebroInsight™"],
        roi: "15% capacity increase without additional spectrum spend",
      },
    ],
    metrics: ["MTTD <5 min (from 45 min)", "25% churn reduction", "1.5% revenue recovery", "15% 5G capacity improvement"],
    services: [
      { name: "AI Engineering", href: "/services/engineering" },
      { name: "AI Operations", href: "/services/operations" },
      { name: "Security & Governance", href: "/services/security" },
    ],
    caseStudy: "Tier-2 carrier reduced voluntary churn by 28% in 12 months using subscriber-level churn prediction and AI-optimized retention offers, saving $34M in annual revenue.",
  },
  {
    slug: "technology",
    name: "Technology",
    icon: "💻",
    color: "text-violet-400",
    border: "border-violet-500/30",
    bg: "bg-violet-500/5",
    tagline: "AI-native software development, DevOps, and GTM intelligence.",
    overview:
      "Technology companies are both AI adopters and AI-native builders. CerebroHive helps tech firms accelerate software delivery with AI, optimize their own operations, and build internal AI platforms — using CerebroStudio™ as the engineering environment.",
    compliance: ["SOC 2 Type II", "ISO 27001", "GDPR / CCPA", "FedRAMP (GovTech)"],
    useCases: [
      {
        name: "AI Code Review & Quality",
        description: "AI-powered code review catching security vulnerabilities, performance issues, and architectural anti-patterns at PR time.",
        products: ["CerebroStudio™", "HiveEvaluation™", "HiveObservatory™"],
        roi: "40% reduction in production bugs, 30% faster code review cycle",
      },
      {
        name: "Predictive DevOps",
        description: "Deployment risk scoring, incident prediction, and intelligent rollback triggers for CI/CD pipelines.",
        products: ["HiveModels™", "HiveOps™", "HiveDeploy™"],
        roi: "50% reduction in production incidents from deployments, MTTR reduction",
      },
      {
        name: "Customer Success AI",
        description: "Health scoring, churn risk, expansion opportunity identification, and automated playbook triggers for CS teams.",
        products: ["CerebroCustomer360™", "HiveModels™", "CerebroAgent™"],
        roi: "20% NRR improvement, 15% reduction in CS headcount growth",
      },
      {
        name: "GTM Intelligence",
        description: "AI-powered pipeline intelligence, win/loss analysis, ICP scoring, and competitive intelligence for sales and marketing.",
        products: ["HiveModels™", "HiveKnowledge™", "CerebroInsight™"],
        roi: "25% improvement in pipeline conversion, better ICP targeting",
      },
    ],
    metrics: ["40% production bug reduction", "50% deployment incident reduction", "20% NRR improvement", "25% pipeline conversion gain"],
    services: [
      { name: "AI Engineering", href: "/services/engineering" },
      { name: "AI Strategy", href: "/services/strategy" },
      { name: "AI Operations", href: "/services/operations" },
    ],
    caseStudy: "B2B SaaS company (500 engineers) deployed AI code review across all repos, reducing critical security vulnerabilities by 62% and cutting review turnaround by 35%.",
  },
  {
    slug: "media",
    name: "Media & Entertainment",
    icon: "🎬",
    color: "text-fuchsia-400",
    border: "border-fuchsia-500/30",
    bg: "bg-fuchsia-500/5",
    tagline: "Content intelligence, audience AI, and monetization.",
    overview:
      "Media companies compete on content, audience loyalty, and monetization efficiency. CerebroHive builds AI programs for content recommendation, audience segmentation, programmatic optimization, and rights management.",
    compliance: ["COPPA (kids content)", "GDPR / CCPA", "FTC Guidelines", "DMCA / IP Rights"],
    useCases: [
      {
        name: "Content Recommendation",
        description: "Deep learning recommendation engine maximizing engagement, session length, and content discovery across streaming, web, and mobile.",
        products: ["HiveModels™", "CerebroCustomer360™", "HiveData™"],
        roi: "20–30% increase in content consumption, 15% churn reduction",
      },
      {
        name: "Audience Segmentation",
        description: "ML-driven audience clustering and look-alike modeling enabling precision targeting for advertisers and content programming decisions.",
        products: ["HiveModels™", "CerebroCustomer360™", "CerebroInsight™"],
        roi: "35% improvement in ad relevance scores, better CPM performance",
      },
      {
        name: "Ad Targeting AI",
        description: "Contextual and behavioral ad targeting with privacy-preserving cohort modeling — GDPR/CCPA compliant, cookieless-ready.",
        products: ["HiveModels™", "HiveData™", "CerebroInsight™"],
        roi: "20–25% CPM improvement, 40% fill rate improvement in direct deals",
      },
      {
        name: "Rights Management AI",
        description: "Automated content identification, rights clearance workflow, and royalty calculation across complex content catalogs.",
        products: ["CerebroArchive™", "HiveKnowledge™", "CerebroFlow™"],
        roi: "90% of rights queries resolved automatically, 60% cost reduction",
      },
    ],
    metrics: ["30% content consumption increase", "15% churn reduction", "25% CPM improvement", "90% rights automation"],
    services: [
      { name: "AI Engineering", href: "/services/engineering" },
      { name: "Industry Solutions", href: "/services/industry" },
      { name: "AI Operations", href: "/services/operations" },
    ],
    caseStudy: "Streaming platform with 8M subscribers improved 30-day retention by 14% after deploying content recommendation AI, contributing $22M in annual subscription revenue.",
  },
  {
    slug: "services",
    name: "Professional Services",
    icon: "💼",
    color: "text-lime-400",
    border: "border-lime-500/30",
    bg: "bg-lime-500/5",
    tagline: "AI-augmented delivery, knowledge management, and client intelligence.",
    overview:
      "Professional services firms — consulting, legal, accounting, engineering — sell expertise and time. CerebroHive builds AI programs that amplify expertise: faster proposal generation, institutionalized knowledge, client health monitoring, and billing intelligence.",
    compliance: ["SOC 2 Type II", "GDPR / CCPA", "Client Confidentiality", "Attorney-Client Privilege (legal)", "AICPA (accounting)"],
    useCases: [
      {
        name: "Proposal Automation",
        description: "AI-generated RFP responses drawing from past proposals, methodologies, CVs, and case studies — reducing proposal time by 70%.",
        products: ["CerebroArchive™", "HiveVector™", "CerebroAgent™"],
        roi: "70% proposal time reduction, 15% win rate improvement from quality",
      },
      {
        name: "Knowledge Management",
        description: "Enterprise knowledge graph capturing engagement learnings, methodologies, and expertise — making firm knowledge findable and AI-queryable.",
        products: ["HiveKnowledge™", "HiveVector™", "CerebroArchive™"],
        roi: "40% reduction in 're-inventing the wheel', faster onboarding",
      },
      {
        name: "Client Health Scoring",
        description: "Continuous client relationship scoring — satisfaction signals, engagement risk, expansion opportunities — triggering proactive partner action.",
        products: ["CerebroCustomer360™", "HiveModels™", "CerebroInsight™"],
        roi: "20% improvement in client retention, 15% increase in expansion revenue",
      },
      {
        name: "Billing Intelligence",
        description: "AI-powered time entry analysis, billing rate optimization, write-off prediction, and realization improvement.",
        products: ["HiveModels™", "CerebroInsight™", "HiveData™"],
        roi: "3–5% realization rate improvement, 50% reduction in write-offs",
      },
    ],
    metrics: ["70% proposal time reduction", "20% client retention improvement", "5% realization improvement", "40% knowledge reuse increase"],
    services: [
      { name: "AI Strategy", href: "/services/strategy" },
      { name: "AI Engineering", href: "/services/engineering" },
      { name: "Industry Solutions", href: "/services/industry" },
    ],
    caseStudy: "Big-4 adjacent advisory firm reduced proposal production time by 68% and improved win rate by 12 points using proposal AI built on CerebroArchive™ and HiveVector™.",
  },
];

export async function generateStaticParams() {
  return INDUSTRIES.map((ind) => ({ slug: ind.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ind = INDUSTRIES.find((x) => x.slug === slug);
  if (!ind) return { title: "Industry Not Found" };
  return {
    title: `${ind.name} AI — Industry Solutions`,
    description: ind.overview.slice(0, 160),
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ind = INDUSTRIES.find((x) => x.slug === slug);
  if (!ind) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 pb-24 pt-8">
      <Link
        href="/industries"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"
      >
        <ArrowLeft size={14} /> Industries
      </Link>

      {/* Header */}
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{ind.icon}</span>
          <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${ind.color}`}>
            Industry Program
          </span>
        </div>
        <h1 className="text-3xl font-bold text-text-primary md:text-4xl">{ind.name}</h1>
        <p className="mt-2 text-lg text-text-secondary">{ind.tagline}</p>
      </div>

      {/* Overview card */}
      <div className={`mt-8 rounded-2xl border ${ind.border} ${ind.bg} p-6`}>
        <p className="text-sm text-text-primary leading-relaxed">{ind.overview}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {ind.compliance.map((c) => (
            <span
              key={c}
              className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${ind.border} ${ind.color}`}
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {ind.metrics.map((m) => (
          <div
            key={m}
            className={`rounded-xl border ${ind.border} ${ind.bg} px-4 py-3 text-center`}
          >
            <TrendingUp size={14} className={`${ind.color} mx-auto mb-1`} />
            <p className={`text-xs font-bold ${ind.color}`}>{m}</p>
          </div>
        ))}
      </div>

      {/* Use cases */}
      <div className="mt-10">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-5">
          AI Use Cases
        </p>
        <div className="space-y-4">
          {ind.useCases.map((uc) => (
            <div
              key={uc.name}
              className="rounded-2xl border border-border bg-surface/30 p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className={`text-sm font-bold ${ind.color}`}>{uc.name}</h3>
              </div>
              <p className="text-sm text-text-secondary mb-3">{uc.description}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {uc.products.map((p) => (
                    <span
                      key={p}
                      className="rounded-full border border-border px-2 py-0.5 text-[10px] text-text-secondary"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <div className="sm:ml-auto shrink-0">
                  <span className={`flex items-center gap-1 text-[10px] font-semibold ${ind.color}`}>
                    <CheckCircle size={11} /> {uc.roi}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case study */}
      <div className={`mt-8 rounded-2xl border ${ind.border} ${ind.bg} p-5`}>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary mb-2">
          Client Outcome
        </p>
        <p className="text-sm text-text-primary italic leading-relaxed">&quot;{ind.caseStudy}&quot;</p>
      </div>

      {/* Related services */}
      <div className="mt-10">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-4">
          Relevant Services
        </p>
        <div className="flex flex-wrap gap-3">
          {ind.services.map((svc) => (
            <Link
              key={svc.href}
              href={svc.href}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border ${ind.border} ${ind.color} hover:opacity-80 transition-opacity`}
            >
              {svc.name} <ArrowRight size={11} />
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 rounded-2xl border border-border bg-surface/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-bold text-text-primary">
            Ready to build your {ind.name} AI program?
          </p>
          <p className="text-sm text-text-secondary mt-0.5">
            Book a discovery call — we&apos;ll scope the engagement in 1 hour.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-accent text-background font-bold text-sm hover:opacity-90 transition-opacity shrink-0"
        >
          Book Discovery Call <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}
