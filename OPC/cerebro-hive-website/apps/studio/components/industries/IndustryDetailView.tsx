"use client";

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIndustryExplorer } from './IndustryExplorerContext';
import { industriesData, getIndustryBySlug } from '@/lib/data/industries';
import { SectionHeading } from '../ui/SectionHeading';
import { ArrowRight, BrainCircuit, Activity, Database, Server, User, Box, ArrowDownRight, Layers, FileText, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { AnimatedButton as Button } from '../ui/AnimatedButton';
import { EnterpriseDigitalTwin } from './engine/EnterpriseDigitalTwin';
import { IndustryMaturity } from './engine/IndustryMaturity';
import { AIOpportunityMap } from './engine/AIOpportunityMap';
import { ComplianceEngine } from './engine/ComplianceEngine';

// Icon mapping for architecture nodes
const nodeIconMap: Record<string, any> = {
  client: User,
  gateway: Server,
  database: Database,
  ai: BrainCircuit,
  agent: Activity,
  system: Box
};

const getMaturityStars = (slug: string) => {
  switch (slug) {
    case 'healthcare':
    case 'finance': return '★★★★★ Complete';
    case 'manufacturing':
    case 'retail': return '★★★★☆ Advanced';
    case 'government': return '★★★☆☆ Intermediate';
    default: return '★★☆☆☆ Emerging';
  }
};

const ArchitectureFlow = ({ architecture, color }: { architecture: any, color: string }) => {
  if (!architecture || !architecture.nodes || architecture.nodes.length === 0) return null;
  
  // Create a simplified horizontal mini-flow from the nodes data
  // For the sake of this component, we'll render a simple sequence based on x-position
  const sortedNodes = [...architecture.nodes].sort((a, b) => a.position.x - b.position.x);
  
  return (
    <div className="w-full overflow-x-auto pb-8 hide-scrollbar">
      <div className="flex items-center min-w-max gap-4 px-4 py-8 relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-border -translate-y-1/2 z-0" />
        
        {/* Animated Data Packet */}
        <motion.div 
          className="absolute top-1/2 left-10 h-1.5 w-16 rounded-full z-0"
          style={{ backgroundColor: color, y: '-50%' }}
          animate={{ left: ['2.5rem', 'calc(100% - 4rem)'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {sortedNodes.map((node, i) => {
          const Icon = nodeIconMap[node.data.type || 'system'] || Box;
          return (
            <div key={node.id} className="relative z-10 flex flex-col items-center gap-3">
              <motion.div 
                initial={{ opacity: 0.4, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="w-16 h-16 rounded-2xl bg-surface border border-border shadow-sm flex items-center justify-center relative group"
              >
                <Icon className="text-text-secondary group-hover:text-primary-accent transition-colors" size={24} />
                {node.data.status === 'Active' && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary-accent animate-pulse shadow-[0_0_10px_rgba(0,230,118,0.5)]" />
                )}
              </motion.div>
              <div className="text-center">
                <p className="text-xs font-bold text-text-primary whitespace-nowrap">{node.data.label}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">{node.data.type}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export function IndustryDetailView() {
  const { activeIndustry } = useIndustryExplorer();
  
  const industry = useMemo(() => {
    return activeIndustry ? getIndustryBySlug(activeIndustry) : null;
  }, [activeIndustry]);

  if (!industry) return null;

  const isComplete = ['healthcare', 'finance'].includes(industry.slug);
  const maturityText = getMaturityStars(industry.slug);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={industry.slug}
        initial={{ opacity: 0.4, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl mx-auto flex flex-col gap-16 md:gap-24 relative z-10"
      >
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-surface border border-border text-text-secondary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: industry.color }} />
                {maturityText}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-space font-bold text-text-primary">
              Transforming <span style={{ color: industry.color }}>{industry.name}</span>
            </h2>
            <p className="text-text-secondary mt-4 max-w-2xl text-lg">
              {industry.overview?.opportunitySummary || industry.hero.description}
            </p>
          </div>
        </div>

        {/* 1. Business Challenges & Strategy */}
        {industry.challenges && industry.challenges.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <SectionHeading label="The Challenge" title="Industry Pain Points" />
              <div className="flex flex-col gap-6 mt-8">
                {industry.challenges.map((challenge, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0.4, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl bg-surface border border-border border-l-4"
                    style={{ borderLeftColor: industry.color }}
                  >
                    <h4 className="text-lg font-bold text-text-primary mb-2">{challenge.title}</h4>
                    <p className="text-text-secondary text-sm mb-4">{challenge.pain}</p>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-text-muted">Cost: <span className="text-text-primary">{challenge.cost}</span></span>
                      <span className="text-primary-accent">{challenge.businessImpact}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <SectionHeading label="The Strategy" title="AI Transformation" />
              <div className="grid grid-cols-1 gap-6 mt-8">
                {industry.aiOpportunities && (
                  <AIOpportunityMap opportunities={industry.aiOpportunities} color={industry.color} />
                )}
                {industry.maturity && (
                  <IndustryMaturity maturity={industry.maturity} color={industry.color} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Enterprise Digital Twin Simulator */}
        {industry.digitalTwin && (
          <div className="w-full">
            <EnterpriseDigitalTwin config={industry.digitalTwin} />
          </div>
        )}

        {/* 3. AI Agents & Solutions */}
        {industry.agents && industry.agents.length > 0 && (
          <div className="w-full">
            <SectionHeading label="Capabilities" title="Domain AI Agents" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {industry.agents.map((agent, i) => (
                <div key={i} className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-4 group">
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center border border-border group-hover:border-primary-accent/50 transition-colors">
                    <BrainCircuit size={20} style={{ color: industry.color }} />
                  </div>
                  <h4 className="text-lg font-bold text-text-primary">{agent.name}</h4>
                  <p className="text-sm text-text-secondary">{agent.description}</p>
                  <ul className="mt-4 flex flex-col gap-2">
                    {agent.capabilities.slice(0, 3).map((cap, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-text-muted">
                        <CheckCircle2 size={14} className="text-primary-accent shrink-0 mt-0.5" />
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Compliance Engine */}
        {industry.compliance && industry.compliance.length > 0 && (
          <div className="w-full">
            <SectionHeading label="Governance" title="Enterprise Compliance" />
            <ComplianceEngine compliance={industry.compliance} color={industry.color} />
          </div>
        )}

        {/* 5. Products & Research Interlinks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-[2rem] bg-surface-elevated border border-border flex flex-col items-start">
            <Layers className="text-text-muted mb-4" size={24} />
            <h3 className="text-xl font-space font-bold text-text-primary mb-2">Recommended Products</h3>
            <p className="text-sm text-text-secondary mb-8">Platform configurations tailored for {industry.name} workflows.</p>
            <div className="flex flex-col gap-3 w-full">
              {['CerebroSphere™', 'HiveMatrix™', 'AgentForge™'].map((prod, i) => (
                <Link key={i} href="/products" className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border hover:border-primary-accent/50 transition-colors group">
                  <span className="font-bold text-sm text-text-primary group-hover:text-primary-accent">{prod}</span>
                  <ArrowRight size={16} className="text-text-muted group-hover:-rotate-45 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-surface-elevated border border-border flex flex-col items-start">
            <FileText className="text-text-muted mb-4" size={24} />
            <h3 className="text-xl font-space font-bold text-text-primary mb-2">Industry Research</h3>
            <p className="text-sm text-text-secondary mb-8">Latest whitepapers and reference architectures.</p>
            <div className="flex flex-col gap-3 w-full">
              {(industry.resources || [
                { title: `AI in ${industry.name} Report 2026`, type: 'Whitepaper', link: '/research' },
                { title: `${industry.name} Knowledge Graph Guide`, type: 'Implementation', link: '/research' }
              ]).slice(0, 3).map((res, i) => (
                <Link key={i} href={res.link} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border hover:border-primary-accent/50 transition-colors group">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-sm text-text-primary group-hover:text-primary-accent line-clamp-1">{res.title}</span>
                    <span className="text-[10px] uppercase tracking-wider text-text-muted">{res.type}</span>
                  </div>
                  <ArrowRight size={16} className="text-text-muted group-hover:-rotate-45 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Related Industries */}
        {industry.relatedIndustries && industry.relatedIndustries.length > 0 && (
          <div className="w-full">
            <SectionHeading label="Cross-Domain" title="Related Industries" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-16">
              {industry.relatedIndustries.map((rel, i) => {
                const relInd = getIndustryBySlug(rel);
                if (!relInd) return null;
                return (
                  <Link key={rel} href={`/industries/${rel}`} className="p-6 rounded-2xl bg-surface border border-border hover:border-primary-accent/50 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: relInd.color }} />
                      <span className="font-bold text-sm text-text-primary group-hover:text-primary-accent">{relInd.name}</span>
                    </div>
                    <ArrowRight size={14} className="text-text-muted group-hover:text-primary-accent" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. Business Outcomes & CTA */}
        {industry.outcomes && industry.outcomes.length > 0 && (
          <div>
            <SectionHeading label="Outcomes" title="Measurable Impact" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-16">
              {industry.outcomes.map((outcome, i) => (
                <div key={i} className="p-6 rounded-2xl bg-surface border border-border text-center flex flex-col items-center justify-center">
                  <span className="text-3xl font-space font-bold text-text-primary mb-2">{outcome.metric}</span>
                  <span className="text-xs uppercase tracking-widest text-text-muted">{outcome.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center text-center p-12 rounded-[2.5rem] bg-surface-elevated border border-border relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('/noise.png')] mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent pointer-events-none" />
          
          <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-4 relative z-10">
            Transform Your {industry.name} Organization
          </h2>
          <p className="text-text-secondary max-w-2xl mb-8 relative z-10">
            Schedule an industry workshop to map your AI transformation journey with our enterprise architects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto px-4 sm:px-0">
            <Button variant="primary" className="w-full sm:w-auto">Book Industry Workshop</Button>
            <Button variant="outline" className="w-full sm:w-auto">Download Blueprint</Button>
          </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
