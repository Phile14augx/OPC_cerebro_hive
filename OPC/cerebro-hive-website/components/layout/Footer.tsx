"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import { CheckCircle2, ChevronDown, ChevronRight, Globe, BookOpen, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom Icon Components for Socials
const XIcon = ({ size = 20, className = "" }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733-16z"/><path d="M4 20l6.768-6.768m2.46-2.46l6.772-6.772"/></svg>
);
const MediumIcon = ({ size = 20, className = "" }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 9v6"/><path d="M12 9v6"/><path d="M16 9v6"/></svg>
);
const LinkedinIcon = ({ size = 20, className = "" }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);
const GithubIcon = ({ size = 20, className = "" }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4m-3-2c-3 1-3-2-3-2"/></svg>
);
const YoutubeIcon = ({ size = 20, className = "" }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
);

const footerLinks: Record<string, { label: string; href: string }[]> = {
  "ABOUT": [
    { label: "Leadership Team", href: "/company#leadership" },
    { label: "Board of Directors", href: "/company#leadership" },
    { label: "Partners", href: "/company#ecosystem" },
  ],
  "SERVICES": [
    { label: "AI Consulting", href: "/services/ai-consulting" },
    { label: "AI Automation & Agents", href: "/services/ai-automation" },
    { label: "Data Engineering", href: "/services/data-engineering" },
    { label: "AI Development", href: "/services/ai-development" },
    { label: "Corporate Training", href: "/services/corporate-training" },
    { label: "Advisory & Consulting", href: "/services/ai-consulting" },
  ],
  "INDUSTRIES": [
    { label: "Technology", href: "/industries/technology" },
    { label: "Financial Services", href: "/industries/financial-services" },
    { label: "Healthcare & Life Sciences", href: "/industries/healthcare" },
    { label: "Retail & Consumer Goods", href: "/industries/retail" },
    { label: "Manufacturing", href: "/industries/manufacturing" },
    { label: "Government & Public Sector", href: "/industries/government" },
  ],
  "RESEARCH": [
    { label: "Research Papers", href: "/research" },
    { label: "Architecture Guides", href: "/resources" },
    { label: "Insights & Analysis", href: "/insights" },
    { label: "Case Studies", href: "/case-studies" },
  ],
  "COMPANY": [
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "News & Insights", href: "/insights" },
    { label: "Community", href: "/community" },
  ],
};

const socialLinks = [
  { icon: LinkedinIcon, name: "LinkedIn", stat: "10k+", label: "Followers", href: "https://linkedin.com/company/cerebro-hive" },
  { icon: GithubIcon, name: "GitHub", stat: "120+", label: "Repositories", href: "https://github.com/Phile14augx" },
  { icon: YoutubeIcon, name: "YouTube", stat: "Research", label: "Videos", href: "https://youtube.com/@cerebro-hive" },
  { icon: XIcon, name: "X (Twitter)", stat: "Live", label: "Updates", href: "https://x.com/cerebro_hive" },
  { icon: MediumIcon, name: "Medium", stat: "Technical", label: "Articles", href: "https://medium.com/@cerebro-hive" },
];



const capabilities = ["AI Consulting", "Software Engineering", "Cloud", "Data Engineering", "Cybersecurity", "Quantiva ERP", "AI Agents", "Research"];
const regions = ["India", "North America", "Europe", "Middle East", "APAC"];

const mottos: Array<{ text: string; author?: string; title?: string; featured?: boolean }> = [
  { text: "Engineering Intelligent Enterprises" },
  {
    text: "Artificial Intelligence should not simply automate work—it should elevate human potential. At CerebroHive, we don't just build software; we architect intelligent enterprises that learn, reason, and evolve with the people they serve. The future belongs to organizations that can transform knowledge into action, and we are here to engineer that future.",
    author: "Philemon V. Nath",
    title: "Founder & CEO, CerebroHive OPC Pvt. Ltd.",
    featured: true,
  },
  { text: "Building Enterprise AI Systems" },
  { text: "Transforming Business Through Intelligence" },
  { text: "The Future Is Autonomous" },
];

function AnimatedCounter({ from = 0, to, duration = 2, suffix = "", delay = 0 }: any) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(from);

  useEffect(() => {
    if (inView) {
      const controls = animate(from, to, {
        duration: duration,
        delay: delay,
        ease: "easeOut",
        onUpdate(value) {
          setDisplayValue(Math.round(Number(value)));
        }
      });
      return () => controls.stop();
    }
  }, [inView, from, to, duration, delay]);

  return <span ref={ref} className="tabular-nums">{displayValue}{suffix}</span>;
}

export default function Footer() {
  const [mottoIdx, setMottoIdx] = useState(0);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [logoPulse, setLogoPulse] = useState(false);
  const footerRef = useRef(null);

  // Motto Cycler
  useEffect(() => {
    const int = setInterval(() => setMottoIdx(prev => (prev + 1) % mottos.length), 6000);
    return () => clearInterval(int);
  }, []);

  // Neural Network Packet Simulation (Easter Egg)
  useEffect(() => {
    const int = setInterval(() => {
      // Trigger a pulse on the logo every 8 seconds
      setLogoPulse(true);
      setTimeout(() => setLogoPulse(false), 1000);
    }, 8000);
    return () => clearInterval(int);
  }, []);

  return (
    <footer ref={footerRef} className="bg-background border-t border-border pt-24 pb-12 font-inter relative overflow-hidden transition-colors duration-500">
      
      {/* Background Neural Network SVG */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="neural-grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="#fff" />
              <circle cx="80" cy="80" r="2" fill="#fff" />
              <circle cx="20" cy="80" r="2" fill="#fff" />
              <circle cx="80" cy="20" r="2" fill="#fff" />
              <line x1="20" y1="20" x2="80" y2="20" stroke="currentColor" strokeWidth="0.5" className="text-text-muted opacity-20 dark:opacity-100 dark:text-white" />
              <line x1="20" y1="80" x2="80" y2="80" stroke="currentColor" strokeWidth="0.5" className="text-text-muted opacity-20 dark:opacity-100 dark:text-white" />
              <line x1="20" y1="20" x2="20" y2="80" stroke="currentColor" strokeWidth="0.5" className="text-text-muted opacity-20 dark:opacity-100 dark:text-white" />
              <line x1="80" y1="20" x2="80" y2="80" stroke="currentColor" strokeWidth="0.5" className="text-text-muted opacity-20 dark:opacity-100 dark:text-white" />
              <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" strokeWidth="0.2" className="text-text-muted opacity-20 dark:opacity-100 dark:text-white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#neural-grid)" />
          
          {/* Animated Traveling Packet */}
          <motion.circle 
            r="3" fill="#00F57A"
            initial={{ cx: "0%", cy: "100%", opacity: 0 }}
            animate={{ 
              cx: ["0%", "50%", "100%", "50%", "0%"], 
              cy: ["100%", "50%", "0%", "100%", "100%"],
              opacity: [0, 1, 0.5, 1, 0]
            }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            style={{ filter: "drop-shadow(0 0 8px #00F57A)" }}
          />
        </svg>
      </div>

      <div className="container-wide relative z-10">
        
        {/* Header Message */}
        <div className="text-center mb-16 border-b border-border pb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-primary-accent font-bold mb-4 block">Thank You For Exploring CerebroHive</span>
          <h2 className="text-lg md:text-2xl font-space font-bold text-text-primary text-center whitespace-nowrap">
            Engineering Intelligent Enterprises Through AI-Native Innovation
          </h2>
        </div>

        {/* Live Status Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-surface-elevated border border-border rounded-2xl p-6 mb-16 shadow-elevated">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-primary-accent rounded-full z-10" />
              <div className="w-2.5 h-2.5 bg-primary-accent rounded-full absolute animate-ping" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-primary-accent font-bold block mb-0.5">Live Status</span>
              <span className="text-sm font-medium text-text-primary">All Systems Operational</span>
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
             <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Research Published</span>
             <span className="text-lg font-mono font-bold text-text-primary">35<motion.span animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, repeatDelay: 2 }}>2</motion.span></span>
          </div>
        </div>

        {/* Main Grid Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Left Column: Metrics & Presence */}
          <div className="lg:col-span-4 flex flex-col gap-12">
            
            {/* Live Metrics */}
            <div>
              <h4 className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-6">Live Enterprise Metrics</h4>
              <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                <div className="group cursor-help relative">
                  <div className="text-3xl font-mono font-bold text-text-primary mb-1 group-hover:text-primary-accent transition-colors"><AnimatedCounter to={42} suffix="+" duration={1.5} /></div>
                  <div className="text-xs text-text-muted">Enterprise Projects</div>
                  {/* Tooltip */}
                  <div className="absolute top-full left-0 mt-2 w-48 p-3 rounded-lg bg-surface border border-border text-xs text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-elevated">
                    Across Finance, Healthcare, Retail, & Manufacturing.
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-mono font-bold text-text-primary mb-1"><AnimatedCounter to={2184} suffix="+" duration={2} /></div>
                  <div className="text-xs text-text-muted">AI Agents Deployed</div>
                </div>
                <div>
                  <div className="text-3xl font-mono font-bold text-text-primary mb-1"><AnimatedCounter to={14} duration={1} /></div>
                  <div className="text-xs text-text-muted">Countries Served</div>
                </div>
                <div>
                  <div className="text-3xl font-mono font-bold text-text-primary mb-1"><AnimatedCounter to={120} suffix="+" duration={1.5} /></div>
                  <div className="text-xs text-text-muted">Enterprise Integrations</div>
                </div>
              </div>
            </div>

            {/* Global Presence */}
            <div>
              <h4 className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-6 flex items-center gap-2">
                <Globe size={14} /> Global Delivery
              </h4>
              <ul className="space-y-3">
                {regions.map(region => (
                  <li 
                    key={region}
                    onMouseEnter={() => setActiveRegion(region)}
                    onMouseLeave={() => setActiveRegion(null)}
                    className="flex items-center gap-3 cursor-default"
                  >
                    <div className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", activeRegion === region ? "bg-primary-accent scale-150" : "bg-border")} />
                    <span className={cn("text-sm transition-colors duration-300 font-medium", activeRegion === region ? "text-text-primary" : "text-text-muted")}>{region}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Middle Column: Nav Links (Desktop) & Capabilities */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Nav Links (Desktop Grid / Mobile Accordion) */}
            <div className="hidden md:grid grid-cols-3 gap-8">
              {Object.entries(footerLinks).slice(0, 3).map(([category, links]) => (
                <div key={category}>
                  <h4 className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-6">{category}</h4>
                  <ul className="flex flex-col gap-3">
                    {links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className="text-xs text-text-muted hover:text-text-primary transition-colors">{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Mobile Accordion */}
            <div className="md:hidden flex flex-col gap-2 border-y border-border py-4">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category} className="border-b border-border last:border-0">
                  <button 
                    onClick={() => setOpenAccordion(openAccordion === category ? null : category)}
                    className="w-full flex items-center justify-between py-3 text-left text-xs font-bold tracking-widest uppercase text-text-muted hover:text-text-primary transition-colors"
                  >
                    {category}
                    <ChevronDown size={14} className={cn("transition-transform", openAccordion === category && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {openAccordion === category && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <ul className="flex flex-col gap-3 pb-4 pt-1">
                          {links.map((link) => (
                            <li key={link.label}><Link href={link.href} className="text-xs text-text-muted hover:text-text-primary">{link.label}</Link></li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Enterprise Capabilities — compact single row */}
            <div>
              <h4 className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-3 flex items-center gap-2">
                <CheckCircle2 size={12} /> Enterprise Ready
              </h4>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {capabilities.map(cap => (
                  <span key={cap} className="text-[10px] px-2.5 py-1 rounded-full bg-surface border border-border text-text-muted whitespace-nowrap hover:border-primary-accent/40 hover:text-text-primary transition-all cursor-default shrink-0">
                    {cap}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Social Dashboard */}
          <div className="lg:col-span-3">
             <h4 className="text-[10px] font-bold tracking-widest uppercase text-text-muted mb-6">Ecosystem</h4>
             
             <div className="flex flex-col gap-3">
               {socialLinks.map(social => (
                 <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between p-3 rounded-xl bg-surface border border-border hover:border-primary-accent/30 hover:-translate-y-1 transition-all shadow-sm hover:shadow-elevated">
                   <div className="flex items-center gap-3">
                     <social.icon size={16} className="text-text-muted group-hover:text-text-primary transition-colors" />
                     <span className="text-xs font-bold text-text-secondary group-hover:text-text-primary transition-colors">{social.name}</span>
                   </div>
                   <div className="text-right">
                     <span className="block text-xs font-mono font-bold text-text-primary">{social.stat}</span>
                     <span className="block text-[9px] uppercase tracking-widest text-text-muted">{social.label}</span>
                   </div>
                 </a>
               ))}
             </div>
          </div>

        </div>

        {/* Motto Carousel & Interactive Quote */}
        <div className="py-10 px-6 md:px-12 border-y border-border mb-8 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {mottos[mottoIdx].featured ? (
              /* CEO Featured Quote — Rich Blockquote */
              <motion.div
                key={mottoIdx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto relative"
                style={{ padding: '8px 0 8px 32px', borderLeft: '2px solid rgba(0,245,122,0.4)' }}
              >
                {/* Opening quote — top-left, mirrored to look like opening quote */}
                <Quote size={20} className="text-primary-accent/60 absolute -top-2 -left-2.5 scale-x-[-1]" />

                <p className="text-base md:text-lg font-inter text-text-secondary leading-relaxed italic mb-6">
                  {mottos[mottoIdx].text}
                </p>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-accent to-secondary-accent flex items-center justify-center shrink-0">
                    <span className="text-background dark:text-black text-xs font-black">P</span>
                  </div>
                  <div>
                    <span className="block text-sm font-bold font-space text-text-primary">{mottos[mottoIdx].author}</span>
                    <span className="block text-[10px] uppercase tracking-widest text-text-muted font-bold">{mottos[mottoIdx].title}</span>
                  </div>
                </div>

                {/* Closing quote — bottom-right */}
                <Quote size={20} className="text-primary-accent/60 absolute -bottom-2 right-0" />
              </motion.div>
            ) : (
              /* Short Motto — Inline Quote Style */
              <motion.div
                key={mottoIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="relative inline-flex items-center justify-center"
                style={{ padding: '12px 40px' }}
              >
                {/* Opening quote — top-left, mirrored to look like opening quote */}
                <Quote size={22} className="text-primary-accent/50 absolute top-0 left-0 scale-x-[-1]" />
                
                <h3 className="text-xl md:text-2xl font-space font-bold text-text-secondary text-center">
                  {mottos[mottoIdx].text}
                </h3>
                
                {/* Closing quote — bottom-right */}
                <Quote size={22} className="text-primary-accent/50 absolute bottom-0 right-0" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col items-center gap-5">
          
          {/* Logo — centered */}
          <Link href="/" className="flex items-center gap-3 group relative cursor-pointer">
            <div className="absolute inset-0 bg-primary-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <motion.div 
              animate={logoPulse ? { scale: [1, 1.2, 1], boxShadow: ["0px 0px 0px rgba(0,245,122,0)", "0px 0px 20px rgba(0,245,122,0.8)", "0px 0px 0px rgba(0,245,122,0)"] } : {}}
              transition={{ duration: 0.8 }}
              className={cn("w-9 h-9 rounded-lg flex items-center justify-center relative z-10 transition-colors", logoPulse ? "bg-primary-accent" : "bg-gradient-to-br from-primary-accent to-secondary-accent")}
            >
              <div className="w-4 h-4 bg-background rounded-sm transition-colors duration-500" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-space font-bold text-lg tracking-tight text-text-primary leading-none relative z-10">
                Cerebro<span className="text-primary-accent">Hive</span>
              </span>
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">OPC Pvt Ltd</span>
            </div>
          </Link>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold tracking-widest uppercase text-gray-500">
            <Link href="/legal/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
            <Link href="/legal/security" className="hover:text-text-primary transition-colors">Security</Link>
            <Link href="/legal/terms" className="hover:text-text-primary transition-colors">Terms</Link>
            <Link href="/legal/ai-ethics" className="hover:text-text-primary transition-colors">AI Ethics</Link>
            <Link href="/sitemap.xml" className="hover:text-text-primary transition-colors">Sitemap</Link>
          </div>


          {/* Copyright */}
          <p className="text-[11px] text-gray-600 text-center">
            © {new Date().getFullYear()} CerebroHive OPC Pvt. Ltd. · Engineering the Future of Intelligent Enterprises.
          </p>

        </div>

      </div>
    </footer>
  );
}
