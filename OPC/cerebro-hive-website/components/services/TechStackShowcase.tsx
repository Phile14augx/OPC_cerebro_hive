"use client";

import React from "react";
import { motion } from "framer-motion";
import { Brain, Settings2, Database, Cloud, ShieldCheck, Box } from "lucide-react";

const stackCategories = [
  {
    category: "Foundation Models",
    icon: Brain,
    technologies: ["OpenAI GPT-4", "Anthropic Claude 3.5", "Google Gemini", "Meta Llama 3", "Mistral"]
  },
  {
    category: "Agent Frameworks",
    icon: Settings2,
    technologies: ["LangGraph", "CrewAI", "Microsoft AutoGen", "Haystack", "LlamaIndex"]
  },
  {
    category: "Data Platforms",
    icon: Database,
    technologies: ["Snowflake", "Databricks", "Pinecone", "pgvector", "Neo4j"]
  },
  {
    category: "Cloud Infrastructure",
    icon: Cloud,
    technologies: ["Microsoft Azure AI", "AWS Bedrock", "Google Cloud Vertex AI", "Vercel"]
  },
  {
    category: "MLOps & Engineering",
    icon: Box,
    technologies: ["Docker", "Kubernetes", "vLLM", "Hugging Face", "Weights & Biases"]
  },
  {
    category: "Security & Governance",
    icon: ShieldCheck,
    technologies: ["Langfuse", "Lakera Guard", "Azure Content Safety", "RBAC/IAM Systems"]
  }
];

export function TechStackShowcase() {
  return (
    <section className="section-pad bg-background">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-space font-bold text-text-primary mb-6">
            Enterprise Technology Stack
          </h2>
          <p className="text-lg text-text-secondary font-inter max-w-2xl mx-auto">
            We are vendor-agnostic and engineering-led. We select the optimal models, frameworks, and infrastructure for your specific security and performance requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stackCategories.map((cat, i) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 rounded-2xl bg-surface-elevated border border-border"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary-accent/10 text-primary-accent">
                  <cat.icon size={20} />
                </div>
                <h3 className="text-lg font-space font-bold text-text-primary">
                  {cat.category}
                </h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {cat.technologies.map(tech => (
                  <span 
                    key={tech}
                    className="px-3 py-1.5 rounded-full bg-background border border-border text-xs font-medium text-text-secondary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
