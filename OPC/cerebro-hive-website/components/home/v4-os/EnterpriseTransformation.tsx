"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { transformations } from "@/lib/config/transformation";

export function EnterpriseTransformation() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTransform = transformations[activeIndex];

  return (
    <section className="py-24 relative overflow-hidden bg-black text-white">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Enterprise Transformation
          </h2>
          <p className="text-xl text-gray-400">
            Driving measurable business outcomes through industry-specific AI architectures.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Industry Sidebar */}
          <div className="w-full lg:w-1/3 flex flex-col gap-2">
            {transformations.map((transform, idx) => (
              <button
                key={transform.id}
                onClick={() => setActiveIndex(idx)}
                className={`text-left px-6 py-4 rounded-xl transition-all duration-300 ${
                  activeIndex === idx
                    ? "bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    : "hover:bg-white/5 border border-transparent text-gray-400 hover:text-white"
                }`}
              >
                <h3 className="text-lg font-semibold">{transform.industry}</h3>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="w-full lg:w-2/3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTransform.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md h-full"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm uppercase tracking-widest text-blue-400 mb-2">The Challenge</h4>
                    <p className="text-gray-300 leading-relaxed mb-8">{activeTransform.challenge}</p>

                    <h4 className="text-sm uppercase tracking-widest text-emerald-400 mb-2">The Outcome</h4>
                    <p className="text-gray-300 leading-relaxed">{activeTransform.outcome}</p>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-sm uppercase tracking-widest text-purple-400 mb-4">Reference Architecture</h4>
                      <ul className="space-y-3">
                        {activeTransform.architecture.map((arch, i) => (
                          <li key={i} className="flex items-center gap-3 text-gray-300 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            {arch}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm uppercase tracking-widest text-amber-400 mb-4">Representative Use Cases</h4>
                      <ul className="space-y-2">
                        {activeTransform.useCases.map((useCase, i) => (
                          <li key={i} className="flex items-center gap-2 text-gray-400">
                            <span className="text-amber-500">→</span>
                            {useCase}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
