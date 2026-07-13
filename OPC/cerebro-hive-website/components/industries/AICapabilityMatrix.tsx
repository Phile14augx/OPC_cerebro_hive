"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { CheckCircle2, ChevronRight } from 'lucide-react';

const coreCapabilities = [
  { id: 'agents', name: 'Domain AI Agents' },
  { id: 'knowledge', name: 'Knowledge AI' },
  { id: 'document', name: 'Document Intelligence' },
  { id: 'predictive', name: 'Predictive Analytics' },
  { id: 'automation', name: 'Workflow Automation' }
];

const targetIndustries = [
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'finance', name: 'Finance' },
  { id: 'retail', name: 'Retail' },
  { id: 'government', name: 'Government' },
  { id: 'manufacturing', name: 'Manufacturing' }
];

// Matrix mapping capability ID + industry ID to specific use cases
const capabilityMatrix: Record<string, Record<string, string[]>> = {
  agents: {
    healthcare: ['Diagnosis Agent', 'Treatment Planner', 'Patient Triage'],
    finance: ['Fraud Investigator', 'Risk Analyst', 'Compliance Auditor'],
    retail: ['Personal Shopper', 'Inventory Forecaster', 'Pricing Engine'],
    government: ['Citizen Assistant', 'Policy Analyzer', 'Procurement Agent'],
    manufacturing: ['Maintenance Scheduler', 'Supply Chain Optimizer', 'Quality Inspector']
  },
  knowledge: {
    healthcare: ['Medical Knowledge Graph', 'Clinical Search', 'Research Synthesizer'],
    finance: ['Market Intelligence', 'Regulatory Graph', 'Investment Thesis Gen'],
    retail: ['Product Ontology', 'Customer 360', 'Trend Analysis'],
    government: ['Legislation Graph', 'Historical Archive Search', 'Inter-agency Data'],
    manufacturing: ['Part Lineage', 'Engineering Docs', 'Supplier Network']
  },
  document: {
    healthcare: ['EMR Extraction', 'Claims Processing', 'Lab Report Parsing'],
    finance: ['Contract Analysis', 'Loan Origination', 'Kyc/AML Extraction'],
    retail: ['Invoice Processing', 'Receipt OCR', 'Supplier Contracts'],
    government: ['Form Digitization', 'FOIA Request Processing', 'Identity Verification'],
    manufacturing: ['Bill of Materials', 'Safety Manuals', 'Compliance Certificates']
  },
  predictive: {
    healthcare: ['Disease Progression', 'Readmission Risk', 'No-show Prediction'],
    finance: ['Market Volatility', 'Credit Default Risk', 'Liquidity Forecasting'],
    retail: ['Demand Forecasting', 'Churn Prediction', 'Lifetime Value'],
    government: ['Infrastructure Wear', 'Resource Allocation', 'Tax Revenue Forecast'],
    manufacturing: ['Predictive Maintenance', 'Yield Optimization', 'Energy Consumption']
  },
  automation: {
    healthcare: ['Appointment Scheduling', 'Billing Workflows', 'Referral Routing'],
    finance: ['Trade Settlement', 'Report Generation', 'Account Onboarding'],
    retail: ['Order Fulfillment', 'Returns Processing', 'Marketing Campaigns'],
    government: ['Permit Approvals', 'Benefit Distribution', 'Public Notices'],
    manufacturing: ['Work Order Generation', 'Inventory Reordering', 'Shift Scheduling']
  }
};

export function AICapabilityMatrix() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

  // Default to showing agents + healthcare if nothing hovered
  const activeCap = hoveredRow || 'agents';
  const activeInd = hoveredCol || 'healthcare';
  const activeDetails = capabilityMatrix[activeCap]?.[activeInd] || [];

  return (
    <div className="w-full">
      <SectionHeading label="Platform" title="Cross-Industry Capabilities" description="How our core AI engines adapt to specific vertical requirements." />
      
      <div className="mt-12 flex flex-col lg:flex-row gap-8">
        
        {/* Left/Center: The Matrix */}
        <div className="flex-1 overflow-x-auto hide-scrollbar">
          <div className="min-w-[600px]">
            {/* Header Row */}
            <div className="grid grid-cols-6 gap-2 mb-4">
              <div className="col-span-1" />
              {targetIndustries.map((ind) => (
                <div 
                  key={ind.id} 
                  className={`text-center text-xs font-bold uppercase tracking-widest transition-colors ${hoveredCol === ind.id ? 'text-primary-accent' : 'text-text-muted'}`}
                  onMouseEnter={() => setHoveredCol(ind.id)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  {ind.name}
                </div>
              ))}
            </div>

            {/* Matrix Rows */}
            <div className="flex flex-col gap-2">
              {coreCapabilities.map((cap) => (
                <div 
                  key={cap.id} 
                  className={`grid grid-cols-6 gap-2 p-2 rounded-xl border transition-colors cursor-default
                    ${hoveredRow === cap.id ? 'bg-surface-elevated border-primary-accent/30' : 'bg-transparent border-transparent hover:bg-surface'}`}
                  onMouseEnter={() => setHoveredRow(cap.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div className={`col-span-1 flex items-center font-bold text-sm ${hoveredRow === cap.id ? 'text-primary-accent' : 'text-text-primary'}`}>
                    {cap.name}
                  </div>
                  {targetIndustries.map((ind) => {
                    const isCellHovered = hoveredRow === cap.id && hoveredCol === ind.id;
                    const hasData = capabilityMatrix[cap.id]?.[ind.id]?.length > 0;
                    
                    return (
                      <div 
                        key={`${cap.id}-${ind.id}`}
                        className={`flex items-center justify-center h-12 rounded-lg transition-colors
                          ${isCellHovered ? 'bg-primary-accent/10 border border-primary-accent/50' : 'bg-surface border border-border'}
                        `}
                        onMouseEnter={() => {
                          setHoveredRow(cap.id);
                          setHoveredCol(ind.id);
                        }}
                      >
                        {hasData ? (
                          <CheckCircle2 size={20} className={isCellHovered ? 'text-primary-accent' : 'text-text-muted'} />
                        ) : (
                          <span className="text-border">-</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Dynamic Details Panel */}
        <div className="w-full lg:w-[350px] shrink-0">
          <div className="h-full p-6 rounded-2xl bg-surface-elevated border border-border flex flex-col relative overflow-hidden">
            {/* Soft background glow based on interaction */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-accent/10 blur-3xl rounded-full" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeCap}-${activeInd}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 flex flex-col h-full"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-primary-accent mb-2">
                  {targetIndustries.find(i => i.id === activeInd)?.name}
                </div>
                <h4 className="text-xl font-bold text-text-primary mb-6">
                  {coreCapabilities.find(c => c.id === activeCap)?.name}
                </h4>
                
                <div className="flex flex-col gap-4">
                  {activeDetails.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <ChevronRight size={16} className="text-primary-accent shrink-0 mt-0.5" />
                      <span className="text-sm text-text-secondary">{detail}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
