"use client";

import Link from "next/link";
import { knowledgeHub } from "@/lib/config/knowledge";

export function KnowledgePlatform() {
  return (
    <section className="py-24 relative bg-black text-white border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Knowledge Platform
            </h2>
            <p className="text-xl text-gray-400">
              Architectural patterns, engineering playbooks, and research from the CerebroHive labs.
            </p>
          </div>
          <Link href="/research" className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors whitespace-nowrap">
            Explore All Research
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {knowledgeHub.map((item) => (
            <Link
              href="/research"
              key={item.id}
              className="group flex flex-col justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    {item.type}
                  </span>
                  <span className="text-xs text-gray-500">{item.date}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
              
              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-sm text-gray-300 group-hover:text-white transition-colors">
                <span>Read Document</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
