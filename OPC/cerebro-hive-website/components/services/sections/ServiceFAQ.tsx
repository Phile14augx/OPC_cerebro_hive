"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EnterpriseService } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ChevronDown } from "lucide-react";

export const ServiceFAQ = ({ service }: { service: EnterpriseService }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!service.faqs || service.faqs.length === 0) return null;

  return (
    <section className="section-pad bg-surface border-b border-border">
      <div className="container-narrow">
        <SectionHeading 
          label="FAQ" 
          title="Common Questions" 
        />

        <div className="mt-16 flex flex-col gap-4">
          {service.faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-xl bg-background overflow-hidden">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-elevated transition-colors"
              >
                <span className="text-base font-bold text-text-primary pr-8">{faq.question}</span>
                <ChevronDown 
                  size={20} 
                  className={`text-text-muted transition-transform duration-300 shrink-0 ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-text-secondary leading-relaxed font-inter">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
