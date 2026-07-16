"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, ArrowRight, ShieldAlert, Zap, Server } from "lucide-react";
import { cn } from "@/lib/utils";

const questions = [
  {
    question: "How is data currently managed across your enterprise?",
    options: [
      { text: "Highly siloed across different departments", score: 1 },
      { text: "Centralized data warehouse but limited access", score: 3 },
      { text: "Unified data fabric with real-time access", score: 5 },
    ]
  },
  {
    question: "What is your current AI governance structure?",
    options: [
      { text: "No formal structure, shadow AI exists", score: 1 },
      { text: "Basic guidelines and IT approval process", score: 3 },
      { text: "Dedicated AI ethics board and automated compliance", score: 5 },
    ]
  },
  {
    question: "How are internal workflows executed?",
    options: [
      { text: "Highly manual with heavy email dependency", score: 1 },
      { text: "RPA (Robotic Process Automation) for basic tasks", score: 3 },
      { text: "Autonomous, AI-orchestrated workflows", score: 5 },
    ]
  },
  {
    question: "How do executives make strategic decisions?",
    options: [
      { text: "Static spreadsheets and weekly reports", score: 1 },
      { text: "Interactive BI dashboards (Tableau/PowerBI)", score: 3 },
      { text: "Predictive AI models and scenario forecasting", score: 5 },
    ]
  }
];

export function ReadinessAssessment() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = (score: number) => {
    const newAnswers = [...answers, score];
    setAnswers(newAnswers);
    
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setIsFinished(true);
    }
  };

  const totalScore = answers.reduce((a, b) => a + b, 0);
  const maxScore = questions.length * 5;
  const percentage = Math.round((totalScore / maxScore) * 100);

  let maturityLevel = "Nascent";
  let color = "text-red-500";
  let recommendation = "Focus on data unification and identifying high-ROI pilot programs.";
  
  if (percentage >= 40 && percentage < 75) {
    maturityLevel = "Developing";
    color = "text-orange-500";
    recommendation = "Establish an AI Center of Excellence and upgrade from RPA to Generative AI agents.";
  } else if (percentage >= 75) {
    maturityLevel = "Advanced";
    color = "text-primary-accent";
    recommendation = "Scale autonomous operations and implement predictive decision intelligence.";
  }

  return (
    <section className="py-24 border-b border-border bg-surface-elevated">
      <div className="container-wide">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          
          {/* Left: Copy */}
          <div>
            <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold mb-3 block">Evaluate Your Baseline</span>
            <h2 className="text-3xl md:text-5xl font-space font-bold text-text-primary mb-6">Enterprise AI Readiness Assessment</h2>
            <p className="text-text-secondary text-lg mb-8">
              Take this 2-minute diagnostic to determine your organization's AI maturity level. Receive instant, actionable recommendations for your next phase of transformation.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-text-primary font-medium">
                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-primary-accent"><Server size={14} /></div>
                Data Infrastructure Evaluation
              </li>
              <li className="flex items-center gap-3 text-sm text-text-primary font-medium">
                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-primary-accent"><ShieldAlert size={14} /></div>
                Governance & Risk Posture
              </li>
              <li className="flex items-center gap-3 text-sm text-text-primary font-medium">
                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-primary-accent"><Zap size={14} /></div>
                Operational Automation Score
              </li>
            </ul>
          </div>

          {/* Right: Interactive Quiz */}
          <div className="bg-background border border-border rounded-2xl shadow-elevated overflow-hidden min-h-[400px] flex flex-col relative">
            
            {!isFinished ? (
              <div className="p-8 flex-1 flex flex-col justify-center relative">
                
                {/* Progress */}
                <div className="absolute top-0 left-0 w-full h-1 bg-surface">
                  <div 
                    className="h-full bg-primary-accent transition-all duration-300"
                    style={{ width: `${(currentQ / questions.length) * 100}%` }}
                  />
                </div>
                
                <div className="mb-6 flex justify-between items-center text-xs font-bold text-text-muted">
                  <span>Question {currentQ + 1} of {questions.length}</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQ}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-xl font-space font-bold text-text-primary mb-6 leading-relaxed">
                      {questions[currentQ].question}
                    </h3>
                    <div className="space-y-3">
                      {questions[currentQ].options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(opt.score)}
                          className="w-full p-4 text-left rounded-xl border border-border bg-surface hover:border-primary-accent hover:bg-surface-elevated transition-all text-sm text-text-secondary font-medium"
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 flex-1 flex flex-col justify-center items-center text-center relative overflow-hidden"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-accent/10 rounded-full blur-[80px]" />
                
                <ClipboardCheck size={48} className="text-primary-accent mb-6" />
                
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-2">Your AI Maturity Score</span>
                <div className="text-5xl font-space font-bold text-text-primary mb-2">
                  {percentage}%
                </div>
                <div className={cn("text-lg font-bold mb-6", color)}>
                  {maturityLevel}
                </div>
                
                <div className="bg-surface border border-border p-4 rounded-xl text-sm text-text-secondary mb-8">
                  <span className="font-bold text-text-primary block mb-1">Architect Recommendation:</span>
                  {recommendation}
                </div>

                <div className="flex flex-col w-full gap-3">
                  <button className="w-full py-3 bg-primary-accent text-text-primary font-space font-bold text-xs uppercase tracking-widest rounded-xl hover:shadow-elevated transition-all">
                    Download Detailed Report
                  </button>
                  <button onClick={() => { setCurrentQ(0); setAnswers([]); setIsFinished(false); }} className="text-xs text-text-muted hover:text-text-primary underline">
                    Retake Assessment
                  </button>
                </div>
              </motion.div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}
