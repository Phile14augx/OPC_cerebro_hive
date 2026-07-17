"use client";

import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Logo } from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { TrackedLink } from "@/components/ui/TrackedLink";
import { Menu, X } from "lucide-react";

import { mainNavigation } from "@/lib/data/navigation";

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 80) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  return (
    <>
      <motion.nav 
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 h-20 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm z-50 transition-colors duration-500"
      >
        <div className="container-wide h-full flex items-center justify-between">
          <div className="flex items-center gap-12">
            <TrackedLink href="/" analyticsEvent="nav_logo_click" analyticsCategory="navigation" analyticsLabel="CerebroHive Logo" className="flex items-center gap-3 group">
              <div className="w-10 h-12 flex items-center justify-center text-text-primary group-hover:text-primary-accent transition-colors">
                <Logo className="w-full h-full" />
              </div>
              <span className="font-space font-bold text-xl tracking-tight text-text-primary">
                Cerebro<span className="text-primary-accent">Hive</span>
              </span>
            </TrackedLink>
            
            <div className="hidden lg:flex items-center gap-8">
              {mainNavigation.map((link) => (
                <TrackedLink
                  key={link.label}
                  href={link.href}
                  analyticsEvent="nav_link_click"
                  analyticsCategory="navigation"
                  analyticsLabel={link.label}
                  className="text-sm font-space font-medium text-text-muted hover:text-text-primary transition-colors"
                >
                  {link.label}
                </TrackedLink>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-border pr-6">
              <ThemeToggle />
            </div>
            <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Book Strategy Session — Navbar">
              <AnimatedButton variant="primary" size="sm">
                Book Strategy Session
              </AnimatedButton>
            </TrackedLink>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-text-primary hover:text-primary-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-surface border-l border-border z-[70] lg:hidden flex flex-col"
            >
              <div className="h-20 flex items-center justify-end px-6 border-b border-border">
                <button 
                  className="p-2 text-text-primary hover:text-primary-accent transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-6">
                {mainNavigation.map((link) => (
                  <TrackedLink
                    key={link.label}
                    href={link.href}
                    analyticsEvent="nav_mobile_link_click"
                    analyticsCategory="navigation"
                    analyticsLabel={link.label}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-space font-bold text-text-primary hover:text-primary-accent transition-colors"
                  >
                    {link.label}
                  </TrackedLink>
                ))}
                
                <div className="mt-8 pt-8 border-t border-border flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-muted">Theme</span>
                    <ThemeToggle />
                  </div>
                  <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Book Strategy Session — Mobile Nav">
                    <AnimatedButton variant="primary" size="sm" className="w-full justify-center">
                      Book Strategy Session
                    </AnimatedButton>
                  </TrackedLink>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
