import React from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

const tech = [
  "React 19", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js",
  "Spring Boot", "PostgreSQL", "Redis", "Elasticsearch", "MinIO", "Keycloak",
  "Docker", "Kubernetes", "Cloudflare", "GitHub Actions", "Vercel",
  "OpenAI", "Anthropic", "LangChain", "LlamaIndex", "Hugging Face"
];

export default function TechStack() {
  return (
    <section className="section-pad bg-secondary overflow-hidden border-y border-white/5">
      <div className="container-wide mb-16">
        <SectionHeading 
          label="Ecosystem"
          title="Enterprise Tech Stack"
          description="We leverage the most advanced and reliable technologies to build scalable intelligent systems."
        />
      </div>

      <div className="flex overflow-hidden w-full relative mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)">
        <div className="flex animate-[shimmer_40s_linear_infinite] items-center w-max min-w-full gap-4">
          {tech.map((t, idx) => (
            <div key={idx} className="px-6 py-3 rounded-xl bg-card border border-white/5 text-white/70 font-space whitespace-nowrap">
              {t}
            </div>
          ))}
          {tech.map((t, idx) => (
            <div key={`dup-${idx}`} className="px-6 py-3 rounded-xl bg-card border border-white/5 text-white/70 font-space whitespace-nowrap">
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
