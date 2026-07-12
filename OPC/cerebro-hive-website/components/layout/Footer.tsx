import React from "react";
import Link from "next/link";

const footerLinks = {
  Solutions: [
    { name: "Enterprise AI", href: "/solutions/enterprise-ai" },
    { name: "Agentic Workflows", href: "/solutions/agentic" },
    { name: "Lakehouse Architecture", href: "/solutions/data" },
    { name: "Intelligent Cyber Defense", href: "/solutions/security" },
  ],
  Industries: [
    { name: "Finance", href: "/industries/finance" },
    { name: "Healthcare", href: "/industries/healthcare" },
    { name: "Manufacturing", href: "/industries/manufacturing" },
    { name: "Retail", href: "/industries/retail" },
  ],
  Company: [
    { name: "About Us", href: "/company" },
    { name: "Careers", href: "/careers" },
    { name: "Case Studies", href: "/case-studies" },
    { name: "Contact", href: "/contact" },
  ],
  Research: [
    { name: "Papers", href: "/research/papers" },
    { name: "Benchmarks", href: "/research/benchmarks" },
    { name: "Architecture Guides", href: "/research/architecture" },
    { name: "Insights", href: "/insights" },
  ]
};

export default function Footer() {
  return (
    <footer className="bg-[#040508] border-t border-white/5 pt-20 pb-10">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 group mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-accent to-secondary-accent flex items-center justify-center">
                <div className="w-4 h-4 bg-[#040508] rounded-sm" />
              </div>
              <span className="font-space font-bold text-xl tracking-tight text-white">
                Cerebro<span className="text-primary-accent">Hive</span>
              </span>
            </Link>
            <p className="text-text-muted font-inter mb-8 max-w-sm">
              Engineering the next generation of intelligent enterprises. We build production AI systems that scale.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="flex flex-col gap-4">
              <h4 className="font-space font-semibold text-white">{category}</h4>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-text-muted hover:text-primary-accent transition-colors font-inter">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
          <div className="text-sm text-text-muted font-inter">
            © {new Date().getFullYear()} CerebroHive. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-text-muted font-inter">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
