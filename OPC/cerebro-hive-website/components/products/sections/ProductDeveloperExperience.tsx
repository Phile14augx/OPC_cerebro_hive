"use client";

import React from "react";
import { motion } from "framer-motion";
import { PackagedProduct } from "@/lib/data/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Terminal, Code2, ShieldCheck, Box } from "lucide-react";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export const ProductDeveloperExperience = ({ product }: { product: PackagedProduct }) => {
  const hasSdk = product.sdkLanguages && product.sdkLanguages.length > 0;
  
  if (!product.apiReference && !hasSdk && (!product.deploymentModels || product.deploymentModels.length === 0)) return null;

  return (
    <section className="section-pad bg-background border-b border-border">
      <div className="container-wide grid lg:grid-cols-2 gap-16 items-center">
        
        <div>
          <SectionHeading 
            label="Developer Experience" 
            title="Built for Engineers" 
            description="First-class APIs, SDKs, and infrastructure options designed to fit seamlessly into your existing CI/CD pipelines."
            align="left"
          />
          
          <div className="mt-10 grid gap-6">
            {hasSdk && (
              <div className="flex gap-4 items-start">
                <Code2 className="text-secondary-accent shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="font-space font-bold text-text-primary mb-2">Native SDKs</h4>
                  <div className="flex gap-2 flex-wrap">
                    {product.sdkLanguages!.map(lang => (
                      <span key={lang} className="px-3 py-1 bg-surface border border-border rounded-md text-xs font-mono text-text-secondary">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {product.deploymentModels && product.deploymentModels.length > 0 && (
              <div className="flex gap-4 items-start">
                <Box className="text-secondary-accent shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="font-space font-bold text-text-primary mb-2">Flexible Deployment</h4>
                  <p className="text-sm text-text-secondary font-inter">
                    {product.deploymentModels.join(" • ")}
                  </p>
                </div>
              </div>
            )}

            {product.securityFeatures && product.securityFeatures.length > 0 && (
              <div className="flex gap-4 items-start">
                <ShieldCheck className="text-secondary-accent shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="font-space font-bold text-text-primary mb-2">Enterprise Security</h4>
                  <p className="text-sm text-text-secondary font-inter">
                    {product.securityFeatures.join(" • ")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {product.apiReference && (
            <div className="mt-12">
              <TrackedLink href={product.apiReference} analyticsEvent="api_docs_click" analyticsCategory="dev_xp">
                <AnimatedButton variant="outline">
                  Read API Documentation
                </AnimatedButton>
              </TrackedLink>
            </div>
          )}
        </div>

        {/* Mock Terminal/Code Snippet Window */}
        <div className="relative rounded-xl overflow-hidden bg-[#0A0A0A] border border-border shadow-2xl">
          <div className="h-10 bg-[#1A1A1A] border-b border-border flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
            <span className="ml-4 text-xs font-mono text-text-muted">{product.slug}-init.sh</span>
          </div>
          <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
            <div className="text-text-muted mb-4"># 1. Initialize the SDK</div>
            <div className="text-text-primary"><span className="text-[#00E5FF]">npm</span> install @cerebrohive/{product.slug}-sdk</div>
            <br />
            <div className="text-text-muted mb-4"># 2. Authenticate and Connect</div>
            <div className="text-[#FF8A00]">import</div> <div className="text-text-primary inline">{"{ Client }"}</div> <div className="text-[#FF8A00]">from</div> <div className="text-[#00F57A]">'@cerebrohive/{product.slug}-sdk'</div>;
            <br /><br />
            <div className="text-[#FF8A00]">const</div> <div className="text-text-primary inline">client = </div><div className="text-[#FF8A00]">new</div> <div className="text-[#00E5FF]">Client</div>{"({"}
            <br />
            <div className="text-text-primary ml-4">apiKey: process.env.<span className="text-text-primary">CEREBRO_API_KEY</span>,</div>
            <br />
            <div className="text-text-primary inline">{"});"}</div>
            <br /><br />
            <div className="text-text-muted mb-4"># 3. Execute Core Capability</div>
            <div className="text-[#FF8A00]">await</div> <div className="text-text-primary inline">client.connect();</div>
            <div className="text-text-muted mt-4">{"// Ready for production scale."}</div>
          </div>
        </div>

      </div>
    </section>
  );
};
