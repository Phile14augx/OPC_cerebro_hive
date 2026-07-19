"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Cpu, BrainCircuit, Users, Globe2, Sparkles, Code2, GraduationCap, Heart, Zap, Shield, Coffee, Briefcase, Send, ChevronRight, X, BarChart, Layers, Terminal, Search } from "lucide-react";

// Existing Data
const cultureValues = [
  { icon: BrainCircuit, title: "Research-First", desc: "We publish, benchmark, and contribute to the discipline. Every engineer is expected to think, not just build." },
  { icon: Cpu, title: "Production-Grade", desc: "We ship. Every internal project has real accountability, real SLAs, and real consequences." },
  { icon: Globe2, title: "Enterprise Ambition", desc: "We work at the scale and complexity that fewer than 1% of engineers ever encounter." },
  { icon: Users, title: "No-Politics Culture", desc: "Ideas win on merit. Hierarchy exists for accountability, not gatekeeping." },
  { icon: Shield, title: "High Trust, High Ownership", desc: "You own your domain end-to-end. No hand-holding, no micromanagement." },
  { icon: Sparkles, title: "Craft Excellence", desc: "We are obsessed with quality. Bad architecture, poor naming, or missing tests are rejected in code review." },
];

const competencyLevels = [
  { level: "L0", title: "Intern / Trainee", desc: "Learning core skills and internal processes." },
  { level: "L1", title: "Associate Engineer", desc: "Executes well-defined tasks under guidance." },
  { level: "L2", title: "Software / AI Engineer", desc: "Independent contributor owning complex features." },
  { level: "L3", title: "Senior Engineer", desc: "System-level ownership, mentors L1/L2, drives architecture." },
  { level: "L4", title: "Lead / Principal", desc: "Cross-team impact, sets technical direction and standards." },
  { level: "L5", title: "Architect / Staff", desc: "Strategic technical leadership, high business impact." },
  { level: "L6", title: "Director / Practice Head", desc: "Owns practice strategy, P&L, and enterprise growth." },
];

const agenticCompetencies = [
  { title: "AI Collaboration", desc: "Uses AI effectively without over-relying on it." },
  { title: "Prompt Engineering", desc: "Writes structured prompts that produce useful outputs." },
  { title: "Critical Thinking", desc: "Challenges and verifies AI-generated content." },
  { title: "Planning", desc: "Breaks complex work into manageable tasks." },
  { title: "Tool Proficiency", desc: "Uses role-specific tools efficiently." },
  { title: "Technical Execution", desc: "Delivers a working solution." },
  { title: "Validation", desc: "Tests, measures, and improves results." },
  { title: "Documentation", desc: "Produces clear technical and business documentation." },
  { title: "Communication", desc: "Explains reasoning and decisions to technical and non-technical audiences." },
  { title: "Continuous Learning", desc: "Demonstrates the ability to adapt to new AI capabilities and incorporate feedback." },
];

const hiringPipeline = [
  "Application", "Resume Screening", "Written Assessment", "Technical Assessment", "Coding / Practical", "System Design", "AI Case Study", "Behavioral Interview", "Leadership Interview", "Culture & Values", "Final Interview", "Offer"
];

const orgStructure = [
  {
    department: "Executive Leadership",
    icon: Briefcase,
    roles: [
      { title: "Founder & CEO", desc: "Responsible for company vision, strategy, partnerships, and growth." },
      { title: "Chief Technology Officer (CTO)", desc: "Owns the overall technology strategy, engineering standards, and platform architecture." },
      { title: "Chief AI Officer (CAIO)", desc: "Leads AI strategy, model governance, research direction, and responsible AI initiatives." },
      { title: "Chief Operating Officer (COO)", desc: "Manages operations, delivery, resource planning, and organizational efficiency." },
      { title: "Chief Information Security Officer (CISO)", desc: "Leads cybersecurity, compliance, governance, and enterprise trust." }
    ]
  },
  {
    department: "AI Consulting & Strategy",
    icon: Globe2,
    roles: [
      { 
        title: "AI Strategy Consultant", 
        desc: "AI maturity assessments, roadmaps, executive workshops, ROI analysis, and transformation.",
        details: {
          mission: "Drive enterprise transformation through strategic AI adoption and clear ROI mapping.",
          responsibilities: ["AI Strategy", "AI Readiness", "Workshops", "Business Transformation", "ROI Analysis"],
          skills: ["AI Foundations", "Business Strategy", "Enterprise Architecture", "Process Improvement"],
          kpis: ["Client Adoption Rate", "Strategic Value Delivered", "Workshop Satisfaction"],
          agenticScenario: {
            scenario: "Advise a bank on enterprise AI adoption.",
            tasks: ["Assess AI readiness.", "Identify business opportunities.", "Estimate ROI.", "Build a phased roadmap.", "Address governance, security, and change management.", "Use AI to accelerate analysis while validating recommendations."]
          }
        }
      },
      { title: "Enterprise Architect", desc: "Enterprise architecture, solution architecture, and technology modernization." },
      { title: "Business Transformation Consultant", desc: "Business process analysis, automation opportunities, and change management." }
    ]
  },
  {
    department: "AI Engineering",
    icon: BrainCircuit,
    roles: [
      { 
        title: "AI Solutions Architect", 
        desc: "Designs enterprise AI solutions and reference architectures.",
        details: {
          mission: "Transform business problems into enterprise-grade AI solutions that deliver measurable business value.",
          responsibilities: ["Design AI solution architectures", "Conduct discovery workshops", "Define AI reference architectures", "Select AI models", "Design RAG architecture", "Design multi-agent workflows", "Review engineering deliverables", "Define governance standards", "Support pre-sales activities"],
          technicalSkills: ["LLMs", "Prompt Engineering", "RAG", "Agentic AI", "AI Evaluation", "AI Safety", "Azure", "AWS", "GCP", "Microservices", "Event Driven Architecture", "Domain Driven Design", "API Design", "SQL", "PostgreSQL", "Vector Databases", "Data Lakes"],
          programming: ["Python", "TypeScript", "Java", "REST APIs"],
          tools: ["LangChain", "LangGraph", "Semantic Kernel", "OpenAI", "Claude", "Gemini", "Docker", "Kubernetes", "Terraform", "GitHub"],
          certifications: ["Azure AI Engineer", "Azure Solutions Architect", "AWS Solutions Architect", "Kubernetes CKA"],
          kpis: ["AI solution success rate", "Customer satisfaction", "AI accuracy", "Time to deployment", "Cost optimization", "Architecture review score"],
          deliverables: ["Solution Architecture", "HLD", "LLD", "API Design", "Infrastructure Design", "Security Design"],
          agenticScenario: {
            scenario: "A manufacturing company wants to deploy an enterprise AI platform across 25 countries.",
            tasks: ["Interview the simulated client to gather requirements.", "Break the problem into architectural domains.", "Use an AI assistant to compare architectural options.", "Produce Business, Application, Data, AI, and Security architectures.", "Identify risks in AI-generated recommendations.", "Present the final architecture and justify trade-offs."]
          }
        }
      },
      { 
        title: "AI Engineer", 
        desc: "Builds production AI applications and intelligent workflows.",
        details: {
          agenticScenario: {
            scenario: "Build an enterprise document intelligence assistant.",
            tasks: ["Plan the implementation.", "Use AI to generate an initial design.", "Critique the generated design.", "Build RAG pipeline, Embedding workflow, Evaluation pipeline, and Safety checks.", "Measure accuracy and latency.", "Document improvements made after reviewing AI suggestions."]
          }
        } 
      },
      { 
        title: "LLM Engineer", 
        desc: "Develops prompt engineering, RAG, evaluation pipelines, and LLM integrations.",
        details: {
          responsibilities: ["Prompt Engineering", "AI Evaluation", "RAG", "Tool Calling", "Function Calling", "Fine Tuning", "Context Optimization", "Token Optimization"],
          skills: ["Python", "LangChain", "LangGraph", "OpenAI", "Claude", "Gemini", "Vector Databases", "Embeddings"],
          kpis: ["AI Accuracy", "Hallucination Rate", "Latency", "Token Cost", "Customer Satisfaction"],
          agenticScenario: {
            scenario: "An enterprise chatbot hallucinates and produces inconsistent answers.",
            tasks: ["Diagnose the issue.", "Evaluate prompt design.", "Improve retrieval quality.", "Introduce guardrails.", "Reduce token consumption.", "Build an evaluation framework.", "Show how AI tools were used and outputs verified."]
          }
        }
      },
      { 
        title: "Agentic AI Engineer", 
        desc: "Builds autonomous, multi-agent systems with orchestration, planning, memory, and tool integration.",
        details: {
          responsibilities: ["Build AI Agents", "Multi-Agent Systems", "Memory", "Planning", "Reflection", "Orchestration"],
          skills: ["LangGraph", "CrewAI", "AutoGen", "MCP", "OpenAI Agents SDK", "Semantic Kernel"],
          kpis: ["Agent Success Rate", "Task Completion Rate", "Response Time", "Tool Accuracy"],
          agenticScenario: {
            scenario: "Create a multi-agent workflow for customer support.",
            tasks: ["Design and implement agents for: Planner, Research, Retrieval, Reasoning, Validator, Summarizer.", "Demonstrate memory strategy, orchestration, failure recovery, and human-in-the-loop escalation."]
          }
        }
      },
      { title: "Prompt Engineer", desc: "Designs, tests, and optimizes prompts and AI interaction patterns." },
      { title: "AI Integration Engineer", desc: "Connects AI systems with ERP, CRM, databases, APIs, and enterprise platforms." }
    ]
  },
  {
    department: "Machine Learning",
    icon: Cpu,
    roles: [
      { 
        title: "Machine Learning Engineer", 
        desc: "Develops predictive models and production ML systems.",
        details: {
          agenticScenario: {
            scenario: "Predict customer churn.",
            tasks: ["Prepare data.", "Engineer features.", "Train models.", "Compare approaches.", "Evaluate fairness.", "Deploy the best model.", "Explain AI-assisted decisions throughout the workflow."]
          }
        } 
      },
      { title: "Deep Learning Engineer", desc: "Specializes in neural networks, computer vision, speech, and advanced AI." },
      { title: "NLP Engineer", desc: "Focuses on language models, search, and conversational AI." },
      { title: "MLOps Engineer", desc: "Builds model deployment, versioning, monitoring, and retraining pipelines." }
    ]
  },
  {
    department: "Data Engineering",
    icon: Code2,
    roles: [
      { title: "Data Architect", desc: "Designs enterprise data platforms and governance." },
      { 
        title: "Data Engineer", 
        desc: "Builds ETL/ELT pipelines, data lakes, and streaming solutions.",
        details: {
          responsibilities: ["ETL", "ELT", "Data Warehouse", "Streaming", "Data Lake", "Data Quality"],
          skills: ["SQL", "Python", "Spark", "Kafka", "Airflow", "dbt", "Snowflake", "Azure Data Factory"],
          kpis: ["Pipeline Reliability", "Data Freshness", "Pipeline Runtime", "Data Quality Score"],
          agenticScenario: {
            scenario: "A retailer needs a near real-time analytics platform.",
            tasks: ["Design ingestion pipelines.", "Build transformation workflows.", "Create a semantic data model.", "Monitor data quality.", "Use AI to generate SQL, then optimize and validate it."]
          }
        }
      },
      { title: "Analytics Engineer", desc: "Creates semantic models and business-ready datasets." },
      { title: "BI Developer", desc: "Develops dashboards, KPIs, and executive reporting." },
      { title: "Database Engineer", desc: "Manages PostgreSQL, SQL Server, MySQL, and NoSQL systems." },
      { title: "Vector Database Engineer", desc: "Implements vector search, embeddings, and semantic retrieval." }
    ]
  },
  {
    department: "Platform Engineering",
    icon: Code2,
    roles: [
      { title: "Platform Architect", desc: "Defines cloud platform standards and internal developer platforms." },
      { 
        title: "Platform Engineer", 
        desc: "Builds reusable infrastructure and developer tooling.",
        details: {
          responsibilities: ["Internal Developer Platform", "Golden Paths", "Self-Service Infrastructure", "Developer Experience"],
          skills: ["Kubernetes", "Terraform", "GitHub", "Helm", "Crossplane"],
          agenticScenario: {
            scenario: "Develop a self-service Internal Developer Platform.",
            tasks: ["Define platform capabilities.", "Design reusable templates.", "Build deployment automation.", "Implement developer self-service.", "Use AI to generate documentation and then refine it."]
          }
        }
      },
      { title: "Kubernetes Engineer", desc: "Manages clusters, networking, autoscaling, and workload reliability." },
      { 
        title: "DevOps Engineer", 
        desc: "Owns CI/CD, Infrastructure as Code, automation, and deployment pipelines.",
        details: {
          mission: "Automate infrastructure, deployments, monitoring, and platform operations.",
          responsibilities: ["Build CI/CD", "Terraform", "Kubernetes", "Monitoring", "Logging", "GitOps", "Security Automation", "Backup", "Disaster Recovery"],
          skills: ["Docker", "Kubernetes", "Helm", "Terraform", "Linux", "Networking", "Azure", "AWS", "GCP", "GitHub Actions", "Jenkins", "ArgoCD", "Prometheus", "Grafana", "Loki", "ELK", "OpenTelemetry", "Vault", "Trivy", "SonarQube"],
          kpis: ["Deployment Frequency", "MTTR", "Infrastructure Availability", "Deployment Success Rate", "Incident Count", "Infrastructure Cost"],
          agenticScenario: {
            scenario: "A Kubernetes cluster experiences intermittent outages during production traffic.",
            tasks: ["Use AI to analyze logs.", "Validate AI findings independently.", "Identify the root cause.", "Repair the deployment.", "Update Terraform & GitHub Actions.", "Add monitoring and alerts.", "Produce a post-incident report."]
          }
        }
      },
      { title: "Site Reliability Engineer (SRE)", desc: "Improves reliability, observability, incident response, and performance." }
    ]
  },
  {
    department: "Cloud Engineering",
    icon: Globe2,
    roles: [
      { title: "Cloud Solutions Architect", desc: "Designs Azure, AWS, and GCP architectures." },
      { title: "Cloud Engineer", desc: "Implements cloud networking, compute, storage, and managed services." },
      { title: "FinOps Engineer", desc: "Optimizes cloud spend, budgeting, and cost governance." }
    ]
  },
  {
    department: "Software Engineering",
    icon: Code2,
    roles: [
      { 
        title: "Full Stack Engineer", 
        desc: "Builds end-to-end enterprise applications.",
        details: {
          skills: ["React", "Next.js", "TypeScript", "Tailwind", "Spring Boot", "FastAPI", "Node.js", "PostgreSQL", "Redis", "Docker", "Kubernetes"]
        }
      },
      { 
        title: "Frontend Engineer", 
        desc: "Develops modern React/Next.js interfaces.",
        details: {
          agenticScenario: {
            scenario: "Create an enterprise dashboard.",
            tasks: ["Generate a component hierarchy with AI.", "Build the interface.", "Improve accessibility.", "Optimize performance.", "Explain UX decisions that differed from AI recommendations."]
          }
        } 
      },
      { 
        title: "Backend Engineer", 
        desc: "Builds APIs, microservices, and distributed systems.",
        details: {
          agenticScenario: {
            scenario: "Design an Order Management microservice.",
            tasks: ["Generate an initial API specification using AI.", "Review and improve the design.", "Implement authentication and caching.", "Optimize database queries.", "Explain where AI recommendations were accepted or rejected."]
          }
        }
      },
      { title: "Integration Engineer", desc: "Develops middleware and enterprise integrations." },
      { title: "Mobile Engineer", desc: "Creates Android and iOS enterprise applications." }
    ]
  },
  {
    department: "Product Engineering",
    icon: Sparkles,
    roles: [
      { 
        title: "Product Manager", 
        desc: "Defines product vision and roadmap.",
        details: {
          agenticScenario: {
            scenario: "Launch an AI Knowledge Platform.",
            tasks: ["Conduct requirement discovery.", "Use AI to draft user stories.", "Prioritize features.", "Define KPIs and roadmap.", "Justify changes made to AI-generated plans."]
          }
        } 
      },
      { title: "Technical Product Manager", desc: "Bridges business strategy with engineering execution." },
      { title: "Product Designer", desc: "Owns user journeys and product experience." }
    ]
  },
  {
    department: "UI/UX Design",
    icon: Sparkles,
    roles: [
      { title: "UX Researcher", desc: "Conducts user research and usability studies." },
      { 
        title: "UI Designer", 
        desc: "Creates enterprise interfaces and design systems.",
        details: {
          responsibilities: ["Enterprise UI", "Design Systems", "Accessibility", "Responsive Design"],
          skills: ["React", "Next.js", "Tailwind CSS", "Framer Motion", "Figma"],
          agenticScenario: {
            scenario: "Design the next generation of CerebroHive Chat.",
            tasks: ["Generate interface ideas with AI.", "Create wireframes and mockups.", "Improve accessibility.", "Validate usability through heuristic review.", "Explain where human judgment improved AI suggestions."]
          }
        }
      },
      { title: "Design System Engineer", desc: "Maintains reusable UI components and standards." }
    ]
  },
  {
    department: "Cybersecurity & Trust",
    icon: Shield,
    roles: [
      { title: "Security Architect", desc: "Designs secure enterprise architectures." },
      { title: "DevSecOps Engineer", desc: "Integrates security into CI/CD and cloud platforms." },
      { title: "Identity Engineer", desc: "Implements IAM, SSO, OAuth, and RBAC." },
      { 
        title: "Compliance Engineer", 
        desc: "Supports ISO 27001, SOC 2, GDPR, HIPAA, and related frameworks.",
        details: {
          agenticScenario: {
            scenario: "Investigate a suspected cloud compromise.",
            tasks: ["Review IAM policies.", "Analyze logs.", "Assess AI-generated remediation plans.", "Perform threat modeling.", "Produce an incident response report."]
          }
        } 
      }
    ]
  },
  {
    department: "QA & Testing",
    icon: CheckCircle2,
    roles: [
      { title: "QA Engineer", desc: "Executes functional and regression testing." },
      { 
        title: "Automation Test Engineer", 
        desc: "Builds automated testing frameworks.",
        details: {
          agenticScenario: {
            scenario: "An enterprise application is preparing for release.",
            tasks: ["Use AI to propose a test strategy.", "Expand it with missing edge cases.", "Automate API tests.", "Build UI tests.", "Run performance tests.", "Analyze failures."]
          }
        }
      },
      { title: "Performance Engineer", desc: "Conducts load, stress, and resilience testing." }
    ]
  },
  {
    department: "CerebroHive Labs (R&D)",
    icon: BrainCircuit,
    roles: [
      { 
        title: "Research Scientist", 
        desc: "Explores new AI techniques and publishes research.",
        details: {
          responsibilities: ["Research Papers", "Benchmarking", "Prototypes", "Experiments", "Publications"],
          skills: ["Python", "PyTorch", "TensorFlow", "Hugging Face"],
          agenticScenario: {
            scenario: "Evaluate three new agentic AI research papers.",
            tasks: ["Summarize each paper.", "Compare methodologies.", "Identify practical implications.", "Design experiments and build a proof of concept.", "Critically assess AI-generated literature summaries."]
          }
        }
      },
      { title: "Applied AI Research Engineer", desc: "Converts research into production-ready solutions." },
      { title: "AI Benchmark Engineer", desc: "Measures model performance, latency, cost, and quality." },
      { title: "Knowledge Engineer", desc: "Builds ontologies, knowledge graphs, and semantic systems." }
    ]
  },
  {
    department: "PMO & Delivery",
    icon: Briefcase,
    roles: [
      { title: "Program Manager", desc: "Oversees enterprise programs." },
      { title: "Project Manager", desc: "Coordinates project delivery." },
      { title: "Scrum Master", desc: "Facilitates Agile practices and sprint execution." },
      { title: "Business Analyst", desc: "Captures requirements and aligns stakeholders." }
    ]
  },
  {
    department: "Sales & Success",
    icon: Heart,
    roles: [
      { title: "AI Solutions Consultant", desc: "Supports pre-sales and solution demonstrations." },
      { title: "Account Executive", desc: "Manages customer acquisition." },
      { title: "Customer Success Manager", desc: "Ensures customer adoption and satisfaction." },
      { title: "Partnerships Manager", desc: "Develops strategic alliances with technology partners." }
    ]
  },
  {
    department: "Marketing & Brand",
    icon: Sparkles,
    roles: [
      { title: "Marketing Manager", desc: "Leads campaigns and market positioning." },
      { title: "Technical Content Strategist", desc: "Produces blogs, whitepapers, and case studies." },
      { title: "Developer Advocate", desc: "Engages the developer community through technical content and events." }
    ]
  },
  {
    department: "Operations & Admin",
    icon: Users,
    roles: [
      { title: "HR Manager", desc: "Oversees talent acquisition and employee development." },
      { title: "Finance Manager", desc: "Manages budgeting, accounting, and financial planning." },
      { title: "Legal & Compliance Officer", desc: "Handles contracts, governance, and regulatory matters." },
      { title: "Executive Assistant", desc: "Supports executive leadership and operations." }
    ]
  }
];

const benefits = [
  { icon: Globe2, label: "Remote-First", desc: "Work from anywhere. Results matter, not your timezone." },
  { icon: Heart, label: "Health Coverage", desc: "Comprehensive medical, dental, and vision for you and your family." },
  { icon: GraduationCap, label: "Learning Budget", desc: "₹1L+ annual budget for courses, conferences, and certifications." },
  { icon: Coffee, label: "Equipment Stipend", desc: "Best-in-class hardware. No compromises on your workstation." },
  { icon: Zap, label: "Fast Trajectory", desc: "Early-stage means rapid growth. Your career moves as fast as you do." },
  { icon: Sparkles, label: "Research Time", desc: "20% time protected for independent research and open-source." },
];

export default function CareersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "", portfolio: "", message: "" });
  const [activeDept, setActiveDept] = useState(orgStructure[0].department);
  const [selectedRole, setSelectedRole] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.portfolio || "Not provided",
          type: "career-application",
          inputs: { role: form.role, portfolio: form.portfolio, message: form.message },
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please email talent@cerebro-hive.com directly.");
    } finally {
      setIsLoading(false);
    }
  };

  const activeDepartmentData = orgStructure.find(d => d.department === activeDept) || orgStructure[0];

  return (
    <div className="bg-background min-h-screen">
      {/* Modal for Role Details */}
      <AnimatePresence>
        {selectedRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setSelectedRole(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-4xl max-h-full overflow-y-auto bg-background border border-border rounded-2xl shadow-elevated custom-scrollbar"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-background/90 backdrop-blur-md border-b border-border">
                <h2 className="text-2xl md:text-3xl font-space font-bold text-text-primary">{selectedRole.title}</h2>
                <button onClick={() => setSelectedRole(null)} className="p-2 bg-surface hover:bg-surface-elevated rounded-full transition-colors">
                  <X size={20} className="text-text-primary" />
                </button>
              </div>
              
              <div className="p-6 md:p-10 space-y-10">
                {!selectedRole.details ? (
                  <div className="text-center py-10">
                    <Briefcase size={48} className="mx-auto text-primary-accent mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-text-primary mb-2">Detailed Framework Coming Soon</h3>
                    <p className="text-text-secondary max-w-md mx-auto">This role is part of our strategic roadmap. We are currently finalizing the standard role definitions for this position.</p>
                  </div>
                ) : (
                  <>
                    {selectedRole.details.mission && (
                      <section>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary-accent mb-3 flex items-center gap-2"><Zap size={14} /> Mission</h4>
                        <p className="text-lg text-text-primary leading-relaxed">{selectedRole.details.mission}</p>
                      </section>
                    )}
                    
                    {selectedRole.details.agenticScenario && (
                      <section className="p-6 bg-primary-accent/5 border border-primary-accent/20 rounded-2xl">
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary-accent mb-4 flex items-center gap-2"><BrainCircuit size={14} /> Agentic Interview Scenario</h4>
                        <p className="text-sm text-text-primary font-bold mb-3">{selectedRole.details.agenticScenario.scenario}</p>
                        <ul className="space-y-2">
                          {selectedRole.details.agenticScenario.tasks.map((t: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                              <Terminal size={14} className="mt-1 shrink-0 text-primary-accent/70" />
                              {t}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    {selectedRole.details.responsibilities && (
                      <section>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary-accent mb-4 flex items-center gap-2"><Briefcase size={14} /> Core Responsibilities</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedRole.details.responsibilities.map((r: string, i: number) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle2 size={16} className="text-primary-accent mt-0.5 shrink-0" />
                              <span className="text-sm text-text-secondary">{r}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {selectedRole.details.skills && (
                        <section>
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary-accent mb-4 flex items-center gap-2"><Code2 size={14} /> Core Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedRole.details.skills.map((s: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 bg-surface border border-border text-xs rounded-lg text-text-primary">{s}</span>
                            ))}
                          </div>
                        </section>
                      )}

                      {selectedRole.details.technicalSkills && (
                        <section>
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary-accent mb-4 flex items-center gap-2"><Code2 size={14} /> Technical Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedRole.details.technicalSkills.map((s: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 bg-surface border border-border text-xs rounded-lg text-text-primary">{s}</span>
                            ))}
                          </div>
                        </section>
                      )}

                      {selectedRole.details.programming && (
                        <section>
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary-accent mb-4 flex items-center gap-2"><Code2 size={14} /> Programming</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedRole.details.programming.map((s: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 bg-surface border border-border text-xs rounded-lg text-text-primary">{s}</span>
                            ))}
                          </div>
                        </section>
                      )}

                      {selectedRole.details.tools && (
                        <section>
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary-accent mb-4 flex items-center gap-2"><Cpu size={14} /> Tools & Tech Stack</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedRole.details.tools.map((s: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 bg-surface border border-border text-xs rounded-lg text-text-primary">{s}</span>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {selectedRole.details.kpis && (
                        <section>
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary-accent mb-4 flex items-center gap-2"><BarChart size={14} /> Key Performance Indicators</h4>
                          <div className="flex flex-col gap-2">
                            {selectedRole.details.kpis.map((s: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary-accent" />
                                <span className="text-sm text-text-primary">{s}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {selectedRole.details.certifications && (
                        <section>
                          <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary-accent mb-4 flex items-center gap-2"><GraduationCap size={14} /> Preferred Certifications</h4>
                          <div className="flex flex-col gap-2">
                            {selectedRole.details.certifications.map((s: string, i: number) => (
                              <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl">
                                <Sparkles size={14} className="text-primary-accent" />
                                <span className="text-sm text-text-primary">{s}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>

                    {selectedRole.details.deliverables && (
                      <section>
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary-accent mb-4 flex items-center gap-2"><Layers size={14} /> Key Deliverables</h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedRole.details.deliverables.map((s: string, i: number) => (
                            <span key={i} className="px-4 py-2 bg-primary-accent/10 border border-primary-accent/30 text-sm font-bold rounded-xl text-primary-accent">{s}</span>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
                
                <div className="pt-6 border-t border-border flex justify-end">
                  <a href="#apply" onClick={() => { setSelectedRole(null); setForm(f => ({ ...f, role: selectedRole.title })); }} className="px-8 py-4 bg-primary-accent text-background font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-transform shadow-elevated">
                    Apply for this Role
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden border-b border-border pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(0,245,122,0.07),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] dark:block hidden" style={{ backgroundSize: "48px 48px" }} />
        <motion.div initial={{ opacity: 0.4, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="container-wide flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary-accent animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">Join the Team</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-space font-bold text-text-primary leading-[1.1] tracking-tight mb-6 max-w-4xl">
            Build the Future of<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-accent to-[#00E5FF]">Enterprise Intelligence</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary font-inter max-w-2xl leading-relaxed mb-10">
            We are assembling a team of exceptional engineers, researchers, architects, and consultants who are obsessed with building enterprise AI systems that actually work.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="#apply" className="px-8 py-4 bg-primary-accent text-background font-space font-bold text-sm uppercase tracking-widest rounded-xl flex items-center gap-3 hover:-translate-y-0.5 transition-transform shadow-elevated">
              Join Our Talent Network <ArrowRight size={16} />
            </a>
            <a href="#organization" className="px-8 py-4 bg-surface border border-border text-text-primary font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:border-primary-accent/40 hover:bg-surface-elevated transition-all">
              Explore Our Structure
            </a>
          </div>
        </motion.div>
      </section>

      {/* Agentic Interview Process */}
      <section className="section-pad border-b border-border bg-surface-elevated">
        <div className="container-wide">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Hiring Reimagined</span>
            <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">The Agentic Interview</h2>
            <p className="text-text-secondary max-w-3xl mx-auto">
              We don&apos;t just test knowledge—we evaluate whether you can reason, plan, collaborate with AI agents, validate outputs, and deliver business outcomes. You are expected to use AI assistants appropriately during the interview.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-space font-bold text-text-primary mb-6">Evaluation Dimensions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {agenticCompetencies.map((comp, idx) => (
                  <div key={idx} className="p-4 bg-background border border-border rounded-xl">
                    <h4 className="font-bold text-text-primary text-sm mb-1">{comp.title}</h4>
                    <p className="text-xs text-text-secondary">{comp.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-space font-bold text-text-primary mb-6">The Interview Pipeline</h3>
              <div className="relative">
                <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />
                <div className="flex flex-col gap-4">
                  {hiringPipeline.map((stage, idx) => (
                    <div key={idx} className="flex items-center gap-4 relative z-10">
                      <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-bold text-text-primary shrink-0 shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="px-4 py-2 bg-background border border-border rounded-lg text-sm text-text-primary w-full shadow-sm">
                        {stage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Organizational Structure & Roles */}
      <section id="organization" className="section-pad border-b border-border overflow-hidden">
        <div className="container-wide">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Scalable Organization</span>
            <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">Our Practices & Teams</h2>
            <p className="text-text-secondary max-w-3xl mx-auto">
              Our organization is structured around specialized practices rather than traditional IT departments, designed to support our growth as a global Enterprise AI Consulting and Engineering firm.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 min-h-[600px]">
            {/* Left sidebar - Departments List */}
            <div className="w-full lg:w-1/3 flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
              {orgStructure.map((dept) => {
                const isActive = activeDept === dept.department;
                return (
                  <button
                    key={dept.department}
                    onClick={() => setActiveDept(dept.department)}
                    className={`flex items-center justify-between p-4 rounded-xl text-left transition-all ${
                      isActive 
                        ? "bg-primary-accent border border-primary-accent text-background shadow-elevated" 
                        : "bg-surface border border-border hover:border-primary-accent/40 text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <dept.icon size={18} className={isActive ? "text-background" : "text-primary-accent"} />
                      <span className={`font-space font-bold text-sm ${isActive ? "text-background" : ""}`}>{dept.department}</span>
                    </div>
                    {isActive && <ChevronRight size={16} className="text-background" />}
                  </button>
                );
              })}
            </div>

            {/* Right content - Roles */}
            <div className="w-full lg:w-2/3 bg-surface border border-border rounded-2xl p-6 md:p-10 shadow-elevated relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-[radial-gradient(ellipse_at_top_right,rgba(0,245,122,0.1),transparent)] pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDepartmentData.department}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center shrink-0">
                      <activeDepartmentData.icon size={24} className="text-primary-accent" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-space font-bold text-text-primary">
                      {activeDepartmentData.department}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeDepartmentData.roles.map((role, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedRole(role)}
                        className="p-5 rounded-xl bg-background border border-border hover:border-primary-accent/50 hover:shadow-elevated transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <h4 className="font-space font-bold text-text-primary mb-2 text-sm md:text-base group-hover:text-primary-accent transition-colors">{role.title}</h4>
                          <p className="text-text-secondary text-xs md:text-sm leading-relaxed mb-4">{role.desc}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary-accent">
                          View Definition <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Competency Levels */}
      <section className="section-pad border-b border-border bg-surface-elevated">
        <div className="container-wide">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Career Framework</span>
            <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">Competency Levels</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">Every role operates on a transparent, standardized proficiency scale to ensure clear expectations, accountability, and a predictable growth trajectory.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {competencyLevels.map((c, i) => (
              <div key={c.level} className="p-6 rounded-2xl bg-background border border-border flex flex-col gap-3 hover:border-primary-accent/40 transition-colors">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary-accent/10 border border-primary-accent/20 text-primary-accent font-space font-bold">
                  {c.level}
                </div>
                <h3 className="font-space font-bold text-text-primary text-lg">{c.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="section-pad">
        <div className="container-wide max-w-3xl">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-3 block">Talent Network</span>
            <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">Submit Your Profile</h2>
            <p className="text-text-secondary max-w-xl mx-auto">We review every submission. If your background aligns with our roadmap, a senior team member will reach out personally.</p>
          </div>

          {submitted ? (
            <motion.div initial={{ opacity: 0.4, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-12 rounded-2xl bg-primary-accent/10 border border-primary-accent/30 flex flex-col items-center text-center gap-4">
              <CheckCircle2 size={48} className="text-primary-accent" />
              <h3 className="text-2xl font-space font-bold text-text-primary">Profile Received</h3>
              <p className="text-text-secondary max-w-sm">We&apos;ve added your profile to our talent network. We review submissions quarterly and will reach out if we see a strong match.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-8 md:p-10 rounded-2xl bg-surface border border-border shadow-elevated">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Full Name *</label>
                  <input required value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Alexandra Chen" className="px-4 py-3 bg-background border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="alex@acme.com" className="px-4 py-3 bg-background border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Domain / Role You&apos;re Interested In *</label>
                <select required value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))} className="px-4 py-3 bg-background border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors appearance-none cursor-pointer">
                  <option value="" disabled>Select a role...</option>
                  {orgStructure.flatMap(d => d.roles).map(role => (
                    <option key={role.title} value={role.title}>{role.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Portfolio / LinkedIn / GitHub</label>
                <input value={form.portfolio} onChange={(e) => setForm(f => ({ ...f, portfolio: e.target.value }))} placeholder="https://" className="px-4 py-3 bg-background border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Tell Us About Yourself *</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} placeholder="What are you working on? What kind of problems excite you? What are you looking for in your next role?" className="px-4 py-3 bg-background border border-border rounded-xl text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-primary-accent/50 transition-colors resize-none" />
              </div>
              <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-3 px-8 py-4 bg-primary-accent text-background font-space font-bold text-sm uppercase tracking-widest rounded-xl hover:-translate-y-0.5 transition-transform shadow-elevated mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
                <Send size={16} />
                {isLoading ? "Sending…" : "Submit Profile"}
              </button>
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
