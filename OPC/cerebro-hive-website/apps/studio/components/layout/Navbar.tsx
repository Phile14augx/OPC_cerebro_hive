"use client";

import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { AnimatedButton } from "@/components/cerebro/AnimatedButton";
import { Logo } from "@/components/cerebro/Logo";
import ThemeToggle from "@/components/cerebro/ThemeToggle";
import { TrackedLink } from "@/components/cerebro/TrackedLink";
import { TrackedButton } from "@/components/cerebro/TrackedButton";
import { analytics } from "@/lib/analytics/AnalyticsAdapter";
import { Menu, X, ChevronDown, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

import { mainNavigation } from "@/lib/data/navigation";

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 80) {
      setHidden(true);
      setOpenMenu(null);
    } else {
      setHidden(false);
    }
  });

  return (
    <>
      <div className="h-[72px] w-full shrink-0" />
      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        onMouseLeave={() => setOpenMenu(null)}
        className="fixed top-0 left-0 right-0 h-[72px] bg-background/95 backdrop-blur-sm border-b border-border/60 shadow-sm z-50 transition-colors duration-500"
      >
        <div className="container-wide h-full flex items-center justify-between">
          <div className="flex items-center gap-14">
            <TrackedLink href="/" analyticsEvent="nav_logo_click" analyticsCategory="navigation" analyticsLabel="CerebroHive Logo" className="flex items-center gap-3 group">
              <div className="w-10 h-12 flex items-center justify-center text-text-primary group-hover:text-primary-accent transition-colors -translate-y-px">
                <Logo className="w-full h-full" />
              </div>
              <span className="font-space font-bold text-xl tracking-tight text-text-primary">
                Cerebro<span className="text-primary-accent">Hive</span>
              </span>
            </TrackedLink>

            <div className="hidden lg:flex items-center gap-10">
              {mainNavigation.map((entry) => (
                <div
                  key={entry.label}
                  onMouseEnter={() => setOpenMenu(entry.label)}
                  className="relative"
                >
                  <TrackedLink
                    href={entry.href}
                    analyticsEvent="nav_link_click"
                    analyticsCategory="navigation"
                    analyticsLabel={entry.label}
                    className={cn(
                      "flex items-center gap-1.5 text-sm font-space font-medium transition-colors py-2",
                      openMenu === entry.label ? "text-text-primary" : "text-text-muted hover:text-text-primary"
                    )}
                  >
                    {entry.label}
                    <ChevronDown
                      size={14}
                      className={cn("transition-transform duration-200", openMenu === entry.label && "rotate-180")}
                    />
                  </TrackedLink>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <ThemeToggle />
            <TrackedLink
              href="/app"
              analyticsEvent="nav_dashboard_click"
              analyticsCategory="navigation"
              analyticsLabel="Dashboard"
              className="flex items-center gap-2 text-sm font-space font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </TrackedLink>
            <TrackedLink href="/contact" analyticsEvent="cta_click" analyticsCategory="conversion" analyticsLabel="Book Strategy Session — Navbar">
              <AnimatedButton
                variant="outline"
                size="sm"
                className="!w-[220px] bg-primary-accent/[0.08] hover:bg-primary-accent/[0.15] shadow-[0_0_20px_rgba(0,255,136,0.08)]"
              >
                Book Strategy Session
              </AnimatedButton>
            </TrackedLink>
          </div>

          {/* Mobile Menu Toggle */}
          <TrackedButton
            eventCategory="navbar"
            eventLabel="Open Navigation Menu"
            className="lg:hidden p-2 text-text-primary hover:text-primary-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </TrackedButton>
        </div>

        {/* Mega Menu Panel */}
        <AnimatePresence>
          {openMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 bg-background/98 backdrop-blur-md border-b border-border/60 shadow-xl"
            >
              <div className="container-wide py-10">
                <div className="flex gap-16">
                  {mainNavigation
                    .find((entry) => entry.label === openMenu)
                    ?.columns.map((column, i) => (
                      <div key={i} className="flex-1 min-w-[200px] max-w-[280px]">
                        {column.heading && (
                          <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-4">
                            {column.heading}
                          </div>
                        )}
                        <div className="flex flex-col gap-3">
                          {column.items.map((item) => (
                            <TrackedLink
                              key={item.href}
                              href={item.href}
                              analyticsEvent="nav_megamenu_click"
                              analyticsCategory="navigation"
                              analyticsLabel={item.label}
                              onClick={() => setOpenMenu(null)}
                              className="text-sm text-text-secondary hover:text-primary-accent transition-colors leading-snug"
                            >
                              {item.label}
                            </TrackedLink>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                analytics.track({ eventName: "click", category: "navbar", label: "Mobile Menu Backdrop" });
                setIsMobileMenuOpen(false);
              }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-3/4 max-w-sm bg-surface border-l border-border z-[70] lg:hidden flex flex-col"
            >
              <div className="h-[72px] flex items-center justify-end px-6 border-b border-border/60">
                <TrackedButton
                  eventCategory="navbar"
                  eventLabel="Close Navigation Menu"
                  className="p-2 text-text-primary hover:text-primary-accent transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <X size={24} />
                </TrackedButton>
              </div>

              <div className="flex-1 overflow-y-auto py-8 px-6 flex flex-col gap-2">
                {mainNavigation.map((entry) => {
                  const isOpen = openMobileSection === entry.label;
                  return (
                    <div key={entry.label} className="border-b border-border/40 pb-2">
                      <TrackedButton
                        eventCategory="navbar"
                        eventLabel={entry.label}
                        className="w-full flex items-center justify-between py-2 text-lg font-space font-bold text-text-primary hover:text-primary-accent transition-colors"
                        onClick={() => setOpenMobileSection(isOpen ? null : entry.label)}
                      >
                        {entry.label}
                        <ChevronDown size={18} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
                      </TrackedButton>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-3 pl-3 pt-2 pb-3">
                              {entry.columns.flatMap((column) => column.items).map((item) => (
                                <TrackedLink
                                  key={item.href}
                                  href={item.href}
                                  analyticsEvent="nav_mobile_link_click"
                                  analyticsCategory="navigation"
                                  analyticsLabel={item.label}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="text-sm text-text-secondary hover:text-primary-accent transition-colors"
                                >
                                  {item.label}
                                </TrackedLink>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}

                <TrackedLink
                  href="/app"
                  analyticsEvent="nav_dashboard_click"
                  analyticsCategory="navigation"
                  analyticsLabel="Dashboard — Mobile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-3 text-lg font-space font-bold text-text-primary hover:text-primary-accent transition-colors"
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </TrackedLink>

                <div className="mt-4 pt-6 border-t border-border flex flex-col gap-6">
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
