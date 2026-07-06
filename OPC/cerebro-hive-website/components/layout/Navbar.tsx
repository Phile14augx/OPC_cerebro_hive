"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/layout/LanguageContext";
import { Locale } from "@/lib/translations";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    {
      label: t("nav.services"),
      href: "/services",
      dropdown: [
        { label: t("nav.services_dropdown.consulting"), href: "/services/ai-consulting" },
        { label: t("nav.services_dropdown.automation"), href: "/services/ai-automation" },
        { label: t("nav.services_dropdown.development"), href: "/services/ai-development" },
        { label: t("nav.services_dropdown.data"), href: "/services/data-engineering" },
        { label: t("nav.services_dropdown.training"), href: "/services/corporate-training" },
      ],
    },
    {
      label: t("nav.solutions"),
      href: "/solutions",
      dropdown: [
        { label: t("nav.solutions_dropdown.support"), href: "/solutions/customer-support-ai" },
        { label: t("nav.solutions_dropdown.sales"), href: "/solutions/sales-automation" },
        { label: t("nav.solutions_dropdown.knowledge"), href: "/solutions/knowledge-management" },
        { label: t("nav.solutions_dropdown.hr"), href: "/solutions/hr-automation" },
        { label: t("nav.solutions_dropdown.finance"), href: "/solutions/erp-automation" },
      ],
    },
    { label: t("nav.academy"), href: "/academy" },
    { label: t("nav.products"), href: "/products" },
    { label: t("nav.sandbox"), href: "/dashboard" },
    { label: t("nav.community"), href: "/community" },
    { label: t("nav.resources"), href: "/resources/blog" },
    { label: t("nav.about"), href: "/about" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      setActiveDropdown(null);
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleMouseEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveDropdown(null), 80);
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: "all 0.3s ease",
        background: scrolled
          ? "rgba(8, 11, 20, 0.92)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(0, 229, 255, 0.1)"
          : "1px solid transparent",
      }}
    >
      <div
        className="container-wide"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ position: "relative", width: 40, height: 40 }}>
            {/* Brain icon - simplified SVG */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Left half - circuit brain */}
              <path d="M20 4 C12 4, 6 10, 6 18 C6 24, 9 29, 14 32 L20 36 L20 4Z" fill="none" stroke="url(#blueGrad)" strokeWidth="1.5"/>
              <circle cx="11" cy="14" r="2" fill="#00E5FF" opacity="0.8"/>
              <circle cx="9" cy="20" r="1.5" fill="#00E5FF" opacity="0.6"/>
              <circle cx="14" cy="26" r="1.5" fill="#7B61FF" opacity="0.8"/>
              <line x1="11" y1="14" x2="9" y2="20" stroke="#00E5FF" strokeWidth="0.8" opacity="0.5"/>
              <line x1="9" y1="20" x2="14" y2="26" stroke="#7B61FF" strokeWidth="0.8" opacity="0.5"/>
              <line x1="11" y1="14" x2="16" y2="18" stroke="#00E5FF" strokeWidth="0.8" opacity="0.5"/>
              {/* Right half - honeycomb */}
              <path d="M20 4 C28 4, 34 10, 34 18 C34 24, 31 29, 26 32 L20 36 L20 4Z" fill="none" stroke="url(#orangeGrad)" strokeWidth="1.5"/>
              <polygon points="26,10 29,12 29,16 26,18 23,16 23,12" fill="none" stroke="#FF8A00" strokeWidth="1" opacity="0.7"/>
              <polygon points="23,18 26,20 26,24 23,26 20,24 20,20" fill="none" stroke="#FFBA00" strokeWidth="1" opacity="0.7"/>
              <polygon points="29,18 32,20 32,24 29,26 26,24 26,20" fill="none" stroke="#FF8A00" strokeWidth="1" opacity="0.5"/>
              {/* Center line */}
              <line x1="20" y1="4" x2="20" y2="36" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"/>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF"/>
                  <stop offset="100%" stopColor="#7B61FF"/>
                </linearGradient>
                <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFBA00"/>
                  <stop offset="100%" stopColor="#FF8A00"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span style={{ fontFamily: "Orbitron, sans-serif", fontWeight: 700, fontSize: "1.25rem" }}>
            <span className="gradient-text-blue-violet">Cerebro</span>
            <span className="gradient-text-orange">Hive</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="desktop-nav">
          {navLinks.map((link) => (
            <div
              key={link.label}
              style={{ position: "relative" }}
              onMouseEnter={() => link.dropdown && handleMouseEnter(link.label)}
              onMouseLeave={() => link.dropdown && handleMouseLeave()}
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "8px 12px",
                  fontFamily: "Exo 2, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  color: activeDropdown === link.label ? "#00E5FF" : "rgba(245,247,250,0.85)",
                  textDecoration: "none",
                  borderRadius: "6px",
                  transition: "all 0.2s",
                  background: activeDropdown === link.label ? "rgba(0,229,255,0.06)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#00E5FF";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,229,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  if (activeDropdown !== link.label) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(245,247,250,0.85)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }
                }}
              >
                {link.label}
                {link.dropdown && (
                  <ChevronDown
                    size={14}
                    style={{
                      opacity: 0.6,
                      transition: "transform 0.2s",
                      transform: activeDropdown === link.label ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                )}
              </Link>

              {/* Dropdown — transparent paddingTop bridges the gap so mouse stays in hover zone */}
              {link.dropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    minWidth: "220px",
                    paddingTop: "8px",       // bridges the visual gap without breaking hover
                    opacity: activeDropdown === link.label ? 1 : 0,
                    pointerEvents: activeDropdown === link.label ? "auto" : "none",
                    transition: "opacity 0.15s ease",
                  }}
                  onMouseEnter={() => handleMouseEnter(link.label)}
                  onMouseLeave={() => handleMouseLeave()}
                >
                  <div style={{
                    background: "rgba(8,11,20,0.96)",
                    border: "1px solid rgba(0,229,255,0.15)",
                    borderRadius: "12px",
                    backdropFilter: "blur(20px)",
                    padding: "8px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 20px rgba(0,229,255,0.05)",
                  }}>
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        style={{
                          display: "block",
                          padding: "10px 14px",
                          fontFamily: "Exo 2, sans-serif",
                          fontSize: "0.875rem",
                          color: "rgba(245,247,250,0.8)",
                          textDecoration: "none",
                          borderRadius: "8px",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.color = "#00E5FF";
                          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(0,229,255,0.08)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.color = "rgba(245,247,250,0.8)";
                          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA & Language Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Desktop Language Selector */}
          <div ref={langRef} style={{ position: "relative" }} className="desktop-nav">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLangOpen(!langOpen);
              }}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: langOpen ? "1px solid rgba(0, 229, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "8px 12px",
                color: langOpen ? "var(--neural-blue)" : "var(--text-primary)",
                fontFamily: "Orbitron, sans-serif",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(0, 229, 255, 0.3)";
                e.currentTarget.style.color = "var(--neural-blue)";
              }}
              onMouseLeave={(e) => {
                if (!langOpen) {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
            >
              {language.toUpperCase()}
              <ChevronDown
                size={12}
                style={{
                  opacity: 0.6,
                  transition: "transform 0.2s",
                  transform: langOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Dropdown Menu */}
            {langOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  minWidth: "140px",
                  background: "rgba(8,11,20,0.96)",
                  border: "1px solid rgba(0, 229, 255, 0.15)",
                  borderRadius: "10px",
                  backdropFilter: "blur(20px)",
                  padding: "6px",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,229,255,0.05)",
                  zIndex: 1010,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {[
                  { code: "en", label: "EN • English" },
                  { code: "es", label: "ES • Español" },
                  { code: "de", label: "DE • Deutsch" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as Locale);
                      setLangOpen(false);
                    }}
                    style={{
                      background: language === lang.code ? "rgba(0, 229, 255, 0.08)" : "transparent",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: language === lang.code ? "var(--neural-blue)" : "rgba(245,247,250,0.8)",
                      fontFamily: "Exo 2, sans-serif",
                      fontSize: "0.8rem",
                      fontWeight: language === lang.code ? 600 : 400,
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--neural-blue)";
                      e.currentTarget.style.background = "rgba(0, 229, 255, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      if (language !== lang.code) {
                        e.currentTarget.style.color = "rgba(245,247,250,0.8)";
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/contact" className="btn-primary" style={{ padding: "10px 20px", fontSize: "0.8rem" }}>
            {t("nav.bookConsultation")}
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none",
              background: "transparent",
              border: "none",
              color: "#F5F7FA",
              cursor: "pointer",
            }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          background: "rgba(8,11,20,0.98)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0,229,255,0.1)",
          padding: "20px 24px 32px",
          maxHeight: "85vh",
          overflowY: "auto",
        }}>
          {navLinks.map((link) => (
            <div key={link.label}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <Link
                  href={link.href}
                  onClick={() => { if (!link.dropdown) setMobileOpen(false); }}
                  style={{
                    flex: 1,
                    display: "block",
                    padding: "14px 0",
                    fontFamily: "Exo 2, sans-serif",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "rgba(245,247,250,0.9)",
                    textDecoration: "none",
                  }}
                >
                  {link.label}
                </Link>
                {link.dropdown && (
                  <button
                    onClick={() => setMobileExpanded(mobileExpanded === link.label ? null : link.label)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#00E5FF",
                      cursor: "pointer",
                      padding: "8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                    aria-label={`Toggle ${link.label} submenu`}
                  >
                    <ChevronDown
                      size={16}
                      style={{
                        transition: "transform 0.2s",
                        transform: mobileExpanded === link.label ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                )}
              </div>
              {link.dropdown && mobileExpanded === link.label && (
                <div style={{ paddingLeft: "16px", paddingBottom: "8px", background: "rgba(0,229,255,0.03)", borderRadius: "8px", marginTop: "4px" }}>
                  {link.dropdown.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => { setMobileOpen(false); setMobileExpanded(null); }}
                      style={{
                        display: "block",
                        padding: "10px 8px",
                        fontFamily: "Exo 2, sans-serif",
                        fontSize: "0.875rem",
                        color: "rgba(0,229,255,0.8)",
                        textDecoration: "none",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      → {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Mobile Language Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)" }}>Language:</span>
            {["en", "es", "de"].map((code) => (
              <button
                key={code}
                onClick={() => setLanguage(code as Locale)}
                style={{
                  flex: 1,
                  background: language === code ? "rgba(0, 229, 255, 0.1)" : "rgba(255,255,255,0.02)",
                  border: language === code ? "1px solid var(--neural-blue)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "6px",
                  padding: "8px",
                  color: language === code ? "var(--neural-blue)" : "var(--text-muted)",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <Link href="/contact" className="btn-primary" style={{ marginTop: "24px", display: "block", textAlign: "center" }}>
            {t("nav.bookConsultation")}
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
