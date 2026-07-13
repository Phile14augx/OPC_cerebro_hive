"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading } from '../ui/SectionHeading';
import { AnimatedButton } from '../ui/AnimatedButton';
import { Download, Mail, Calendar, Calculator, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ROICalculator = () => {
  const [docs, setDocs] = useState(50000);
  const [tickets, setTickets] = useState(10000);
  const [hourlyRate, setHourlyRate] = useState(35);
  const [employees, setEmployees] = useState(500);

  // Assumptions
  const manualDocTimeMinutes = 4;
  const aiDocTimeMinutes = 0.5; // 30 seconds
  const manualTicketTimeMinutes = 12;
  const aiTicketTimeMinutes = 2;
  
  // Logic
  const savings = useMemo(() => {
    // Documents
    const manualDocHours = (docs * manualDocTimeMinutes) / 60;
    const aiDocHours = (docs * aiDocTimeMinutes) / 60;
    const docHoursSaved = manualDocHours - aiDocHours;
    
    // Tickets
    const manualTicketHours = (tickets * manualTicketTimeMinutes) / 60;
    const aiTicketHours = (tickets * aiTicketTimeMinutes) / 60;
    const ticketHoursSaved = manualTicketHours - aiTicketHours;

    const totalHoursSaved = docHoursSaved + ticketHoursSaved;
    const monthlySavings = totalHoursSaved * hourlyRate;
    const annualSavings = monthlySavings * 12;

    const implementationCost = 150000; // rough baseline
    const roi = ((annualSavings - implementationCost) / implementationCost) * 100;
    const paybackMonths = (implementationCost / annualSavings) * 12;

    return {
      annual: annualSavings,
      conservative: annualSavings * 0.75,
      optimistic: annualSavings * 1.3,
      roi: roi,
      payback: paybackMonths,
      hours: totalHoursSaved * 12
    };
  }, [docs, tickets, hourlyRate]);

  return (
    <section className="py-24 border-b border-border bg-surface-elevated overflow-hidden">
      <div className="container-wide">
        <SectionHeading 
          label="Value" 
          title="Business Value Estimator" 
          description="Calculate your projected ROI based on operational assumptions." 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16">
          
          {/* Inputs */}
          <div className="col-span-1 lg:col-span-5 flex flex-col gap-8">
            <div className="p-8 rounded-2xl bg-surface border border-border shadow-sm">
              <h4 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <Calculator size={20} className="text-primary-accent" />
                Operational Inputs
              </h4>
              
              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block">Monthly Documents</label>
                  <input 
                    type="range" min="1000" max="500000" step="1000"
                    value={docs} onChange={(e) => setDocs(Number(e.target.value))}
                    className="w-full accent-primary-accent"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm font-space font-bold text-text-primary">{docs.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block">Monthly Support Tickets</label>
                  <input 
                    type="range" min="500" max="100000" step="500"
                    value={tickets} onChange={(e) => setTickets(Number(e.target.value))}
                    className="w-full accent-primary-accent"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm font-space font-bold text-text-primary">{tickets.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2 block">Avg. Employee Hourly Cost ($)</label>
                  <input 
                    type="range" min="15" max="150" step="5"
                    value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full accent-primary-accent"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-sm font-space font-bold text-text-primary">${hourlyRate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assumptions */}
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm">
              <h5 className="text-sm font-bold text-text-primary mb-4">Calculation Assumptions</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted">Manual Doc Processing</span>
                  <span className="text-sm font-mono text-text-primary">{manualDocTimeMinutes} mins</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted">AI Doc Processing</span>
                  <span className="text-sm font-mono text-primary-accent">{aiDocTimeMinutes} mins</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted">Manual Ticket</span>
                  <span className="text-sm font-mono text-text-primary">{manualTicketTimeMinutes} mins</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted">AI Ticket</span>
                  <span className="text-sm font-mono text-primary-accent">{aiTicketTimeMinutes} mins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Outputs */}
          <div className="col-span-1 lg:col-span-7">
            <div className="p-8 rounded-2xl bg-surface border border-border shadow-sm h-full flex flex-col justify-between relative overflow-hidden">
              
              {/* Decorative background glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-accent/10 rounded-full blur-[80px]" />

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted block mb-4">Estimated Annual Savings</span>
                <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-6xl lg:text-8xl font-space font-bold text-transparent bg-clip-text bg-gradient-to-br from-text-primary to-text-secondary tracking-tight">
                    ${(savings.annual / 1000000).toFixed(2)}M
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-12">
                   <div className="flex flex-col px-4 border-l-2 border-border">
                     <span className="text-[10px] uppercase tracking-widest text-text-muted">Conservative</span>
                     <span className="text-sm font-space font-bold text-text-secondary">${(savings.conservative / 1000).toFixed(0)}k</span>
                   </div>
                   <div className="flex flex-col px-4 border-l-2 border-primary-accent">
                     <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold">Expected</span>
                     <span className="text-sm font-space font-bold text-text-primary">${(savings.annual / 1000).toFixed(0)}k</span>
                   </div>
                   <div className="flex flex-col px-4 border-l-2 border-border">
                     <span className="text-[10px] uppercase tracking-widest text-text-muted">Optimistic</span>
                     <span className="text-sm font-space font-bold text-text-secondary">${(savings.optimistic / 1000).toFixed(0)}k</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-border">
                  <div className="flex flex-col">
                    <span className="text-2xl font-space font-bold text-text-primary mb-1">{savings.payback.toFixed(1)} Mo</span>
                    <span className="text-[10px] uppercase tracking-widest text-text-muted">Payback Period</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-space font-bold text-text-primary mb-1">{savings.roi.toFixed(0)}%</span>
                    <span className="text-[10px] uppercase tracking-widest text-text-muted">3-Year ROI</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-space font-bold text-text-primary mb-1">{(savings.hours / 1000).toFixed(1)}k</span>
                    <span className="text-[10px] uppercase tracking-widest text-text-muted">Hours Saved</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-space font-bold text-text-primary mb-1">12 Wk</span>
                    <span className="text-[10px] uppercase tracking-widest text-text-muted">Implementation</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex flex-wrap gap-4 pt-8 border-t border-border">
                <AnimatedButton variant="primary" className="flex items-center gap-2">
                  <Download size={16} />
                  Download Full Report
                </AnimatedButton>
                <button className="px-6 py-3 rounded-lg bg-surface border border-border text-sm font-bold text-text-primary flex items-center gap-2 hover:border-primary-accent transition-colors">
                  <Calendar size={16} />
                  Book Strategy Workshop
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
