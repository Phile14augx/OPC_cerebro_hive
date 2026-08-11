'use client';

import { FaqSection } from '@/components/discovery';

const HOME_FAQS = [
  {
    q: 'What is CerebroHive?',
    a: 'CerebroHive is an enterprise AI systems company that architects, builds, and deploys production-grade AI solutions for large organizations. We combine AI strategy, platform engineering, knowledge management, autonomous agent systems, and AI education under one roof — helping enterprises move from AI pilots to full-scale AI transformation.',
  },
  {
    q: 'What is enterprise AI and how does CerebroHive help organizations adopt it?',
    a: 'Enterprise AI refers to the application of artificial intelligence at organizational scale — including LLMs, AI agents, RAG systems, MLOps, and AI governance. CerebroHive helps organizations adopt enterprise AI through end-to-end services: defining an AI strategy, engineering the technical platform, deploying production agents, governing AI risk, and upskilling teams through CerebroHive Academy.',
  },
  {
    q: 'What is HivePulse?',
    a: 'HivePulse is CerebroHive\'s Enterprise AI Operating System — the operational layer that orchestrates AI agents, manages multi-model routing, enforces governance policies, and integrates AI into enterprise workflows. It acts as the intelligent nervous system connecting all AI capabilities across an organization.',
  },
  {
    q: 'What is Cerebro X?',
    a: 'Cerebro X is CerebroHive\'s Enterprise AI Intelligence Platform — the intelligence layer that provides knowledge management, semantic search, RAG pipelines, and reasoning capabilities. Where HivePulse handles operations and orchestration, Cerebro X handles knowledge, context, and intelligence retrieval.',
  },
  {
    q: 'What industries does CerebroHive serve?',
    a: 'CerebroHive serves 16+ industries including Healthcare, Financial Services, Manufacturing, Legal & Compliance, Retail, Logistics, Technology, Government, Education, Energy, Real Estate, Media, Telecom, Pharmaceuticals, Hospitality, and Agriculture. Each engagement is tailored to the regulatory, data, and workflow constraints of the specific industry.',
  },
  {
    q: 'What is Retrieval-Augmented Generation (RAG) and why does it matter for enterprises?',
    a: 'RAG (Retrieval-Augmented Generation) is a technique that connects large language models to enterprise knowledge bases, allowing AI to answer questions using real organizational data rather than just training knowledge. For enterprises, RAG is critical because it grounds AI responses in verified internal documents, reduces hallucinations, and ensures answers reflect current business context.',
  },
  {
    q: 'How do AI agents work in an enterprise context?',
    a: 'Enterprise AI agents are autonomous software systems that perceive their environment, reason about goals, take actions, and learn from outcomes — all without constant human direction. In an enterprise, agents can handle tasks like contract review, customer support, data extraction, workflow routing, and report generation. CerebroHive builds multi-agent systems using frameworks like LangGraph, AutoGen, and the Model Context Protocol (MCP).',
  },
  {
    q: 'What is the Model Context Protocol (MCP) and how does CerebroHive use it?',
    a: 'The Model Context Protocol (MCP) is an open standard for connecting AI models to external tools, data sources, and services in a secure, standardized way. CerebroHive uses MCP to build interoperable AI systems where agents can access enterprise databases, APIs, and workflows through a consistent interface — enabling portable, vendor-agnostic AI architectures.',
  },
  {
    q: 'What services does CerebroHive offer?',
    a: 'CerebroHive offers 10 enterprise AI services: AI Strategy, AI Platform Engineering, Autonomous Transformation (AI Agents), Knowledge Engineering (RAG & Knowledge Graphs), AI Governance & Risk, AI Factory (production AI systems at scale), AI Center of Excellence (CoE) setup, AIOps, Intelligence Modernization, and Industry Accelerator programs for vertical-specific AI deployment.',
  },
  {
    q: 'How does CerebroHive Academy help enterprise teams build AI skills?',
    a: 'CerebroHive Academy offers professional AI certifications designed for enterprise practitioners — not just developers. Programs cover Prompt Engineering, RAG Architecture, Multi-Agent Systems, Fine-Tuning, MLOps, AI Governance, Vector Databases, Data Engineering, and AI Strategy. Courses are delivered online with real-world enterprise case studies and project-based assessments.',
  },
  {
    q: 'How long does an enterprise AI transformation take with CerebroHive?',
    a: 'A typical enterprise AI engagement with CerebroHive spans 3–18 months depending on scope. An AI strategy and roadmap can be completed in 4–8 weeks. A production AI pilot typically takes 8–12 weeks. Full-scale platform deployment and autonomous transformation programs run 6–18 months. CerebroHive uses a phased approach: assess, architect, build, deploy, and scale.',
  },
  {
    q: 'What makes CerebroHive different from traditional IT consulting firms?',
    a: 'Unlike traditional IT consultants, CerebroHive is AI-native — every service, product, and methodology is built specifically for the AI era. We combine deep technical engineering (building production AI systems, not just advising) with proprietary platforms (HivePulse, Cerebro X), a certified education arm (Academy), and cross-industry AI expertise. We don\'t adapt old frameworks to AI — we build AI-first from the ground up.',
  },
];

export function HomeFaq() {
  return (
    <section className="py-24 px-4 max-w-4xl mx-auto">
      <FaqSection
        faqs={HOME_FAQS}
        title="Enterprise AI — Frequently Asked Questions"
        className=""
      />
    </section>
  );
}
