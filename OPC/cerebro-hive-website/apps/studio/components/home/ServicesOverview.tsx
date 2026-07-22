"use client";
import Link from "next/link";
import { Brain, Zap, GraduationCap, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/layout/LanguageContext";

export default function ServicesOverview() {
  const { t } = useLanguage();

  const services = [
    {
      icon: Brain,
      title: t("home.services.consulting.title"),
      subtitle: t("home.services.consulting.subtitle"),
      description: t("home.services.consulting.desc"),
      href: "/services/ai-strategy",
      accentColor: "#00E5FF",
      borderGradient: "linear-gradient(180deg, #00E5FF 0%, transparent 100%)",
      features: [
        t("home.services.consulting.f1"),
        t("home.services.consulting.f2"),
        t("home.services.consulting.f3"),
        t("home.services.consulting.f4")
      ],
      tag: t("home.services.consulting.tag"),
    },
    {
      icon: Zap,
      title: t("home.services.automation.title"),
      subtitle: t("home.services.automation.subtitle"),
      description: t("home.services.automation.desc"),
      href: "/services/autonomous-transformation",
      accentColor: "#FF8A00",
      borderGradient: "linear-gradient(180deg, #FF8A00 0%, transparent 100%)",
      features: [
        t("home.services.automation.f1"),
        t("home.services.automation.f2"),
        t("home.services.automation.f3"),
        t("home.services.automation.f4")
      ],
      tag: t("home.services.automation.tag"),
    },
    {
      icon: GraduationCap,
      title: t("home.services.academy.title"),
      subtitle: t("home.services.academy.subtitle"),
      description: t("home.services.academy.desc"),
      href: "/academy",
      accentColor: "#7B61FF",
      borderGradient: "linear-gradient(180deg, #7B61FF 0%, transparent 100%)",
      features: [
        t("home.services.academy.f1"),
        t("home.services.academy.f2"),
        t("home.services.academy.f3"),
        t("home.services.academy.f4")
      ],
      tag: t("home.services.academy.tag"),
    },
  ];

  return (
    <section className="section-pad" style={{ position: "relative", overflow: "hidden" }}>
      {/* Background decoration */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(123,97,255,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="container-wide">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div className="section-label" style={{ display: "inline-flex" }}>
            {t("home.services.eyebrow")}
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "20px" }}>
            {t("home.services.title_prefix")}
            <span className="gradient-text-full">{t("home.services.title_accent")}</span>
          </h2>
          <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "560px", margin: "0 auto" }}>
            {t("home.services.description")}
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px" }}>
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="card-glass"
                style={{ padding: "36px 32px", position: "relative", overflow: "hidden" }}
              >
                {/* Top color border */}
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: "2px",
                  background: service.borderGradient,
                }} />

                {/* Tag */}
                <div style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  background: `${service.accentColor}18`,
                  border: `1px solid ${service.accentColor}40`,
                  borderRadius: "100px",
                  color: service.accentColor,
                }}>
                  {service.tag}
                </div>

                {/* Icon */}
                <div style={{
                  width: 56, height: 56,
                  borderRadius: "14px",
                  background: `${service.accentColor}14`,
                  border: `1px solid ${service.accentColor}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "24px",
                  boxShadow: `0 0 20px ${service.accentColor}20`,
                }}>
                  <Icon size={26} color={service.accentColor} />
                </div>

                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px" }}>
                  {service.title}
                </h3>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: service.accentColor, fontWeight: 600, marginBottom: "16px", letterSpacing: "0.03em" }}>
                  {service.subtitle}
                </p>
                <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "24px" }}>
                  {service.description}
                </p>

                {/* Features */}
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
                  {service.features.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "rgba(245,247,250,0.75)" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: service.accentColor, flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={service.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    color: service.accentColor,
                    textDecoration: "none",
                    transition: "gap 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.gap = "10px";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.gap = "6px";
                  }}
                >
                  {t("home.services.explore_prefix")}{service.title} <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .services-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .services-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
