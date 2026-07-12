import React from "react";
import { cn } from "@/lib/utils";

const techRows = [
  // Row 1: AI & Data
  [
    { name: "OpenAI", icon: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg" },
    { name: "NVIDIA", icon: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg" },
    { name: "PyTorch", icon: "https://upload.wikimedia.org/wikipedia/commons/1/10/PyTorch_logo_icon.svg" },
    { name: "TensorFlow", icon: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Tensorflow_logo.svg" },
    { name: "Databricks", icon: "https://upload.wikimedia.org/wikipedia/commons/6/63/Databricks_Logo.png" },
    { name: "Snowflake", icon: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Snowflake_Logo.svg" }
  ],
  // Row 2: Cloud Infrastructure
  [
    { name: "AWS", icon: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" },
    { name: "Google Cloud", icon: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg" },
    { name: "Azure", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Microsoft_Azure_Logo.svg" },
    { name: "Docker", icon: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_%28container_engine%29_logo.svg" },
    { name: "Kubernetes", icon: "https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg" },
    { name: "Cloudflare", icon: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Cloudflare_Logo.svg" }
  ],
  // Row 3: Engineering & Frontend
  [
    { name: "React", icon: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" },
    { name: "Next.js", icon: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg" },
    { name: "Tailwind CSS", icon: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" },
    { name: "TypeScript", icon: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" },
    { name: "GitHub", icon: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" },
    { name: "GitLab", icon: "https://upload.wikimedia.org/wikipedia/commons/e/e1/GitLab_logo.svg" }
  ],
  // Row 4: Databases & Systems
  [
    { name: "PostgreSQL", icon: "https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg" },
    { name: "MongoDB", icon: "https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg" },
    { name: "Redis", icon: "https://upload.wikimedia.org/wikipedia/commons/6/64/Icon-redis.svg" },
    { name: "Apache Kafka", icon: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Apache_kafka-icon.svg" },
    { name: "Elasticsearch", icon: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Elasticsearch_logo.svg" },
    { name: "Linux", icon: "https://upload.wikimedia.org/wikipedia/commons/3/35/Tux.svg" }
  ]
];

export default function TrustBar() {
  return (
    <div className="w-full border-y border-white/5 bg-primary overflow-hidden py-16">
      <div className="container-wide flex flex-col md:flex-row gap-12">
        <div className="md:w-1/4 shrink-0 flex items-center md:items-start pt-4">
          <span className="text-xs font-space font-semibold uppercase tracking-[0.2em] text-text-muted">
            Trusted Technologies
          </span>
        </div>
        
        {/* Infinite Scroll Carousel Rows */}
        <div className="md:w-3/4 flex flex-col gap-12 relative mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)">
          {techRows.map((row, rowIndex) => (
            <div 
              key={rowIndex} 
              className="flex overflow-hidden w-full relative"
            >
              <div 
                className={cn(
                  "flex items-center w-max gap-32 pr-32",
                  // Alternate directions or speeds for visual interest
                  rowIndex % 2 === 0 
                    ? "animate-[scrollLeft_40s_linear_infinite]" 
                    : "animate-[scrollRight_40s_linear_infinite]"
                )}
              >
                {/* Render the row items twice for seamless loop */}
                {[...row, ...row].map((tech, index) => (
                  <div 
                    key={`${rowIndex}-${index}`}
                    className="flex items-center gap-3 text-lg font-space font-medium text-text-muted/60 hover:text-white transition-colors cursor-default whitespace-nowrap opacity-70 hover:opacity-100 grayscale hover:grayscale-0"
                  >
                    <img 
                      src={tech.icon} 
                      alt={tech.name} 
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                    />
                    <span>{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
