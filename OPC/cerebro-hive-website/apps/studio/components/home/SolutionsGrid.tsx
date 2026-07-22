"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Headphones, TrendingUp, BookOpen, Users, BarChart3, Cpu } from "lucide-react";
import { useLanguage } from "@/components/layout/LanguageContext";

export default function SolutionsGrid() {
  const [hovered, setHovered] = useState<number | null>(null);
  const { t } = useLanguage();

  const solutions = [
    {
      icon: Headphones,
      title: t("home.solutions.sol1.title"),
      description: t("home.solutions.sol1.desc"),
      href: "/solutions/customer-support-ai",
      color: "#00E5FF",
      stat: t("home.solutions.sol1.stat"),
    },
    {
      icon: TrendingUp,
      title: t("home.solutions.sol2.title"),
      description: t("home.solutions.sol2.desc"),
      href: "/solutions/sales-automation",
      color: "#7B61FF",
      stat: t("home.solutions.sol2.stat"),
    },
    {
      icon: BookOpen,
      title: t("home.solutions.sol3.title"),
      description: t("home.solutions.sol3.desc"),
      href: "/solutions/knowledge-management",
      color: "#FF2ED1",
      stat: t("home.solutions.sol3.stat"),
    },
    {
      icon: Users,
      title: t("home.solutions.sol4.title"),
      description: t("home.solutions.sol4.desc"),
      href: "/solutions/hr-automation",
      color: "#FFBA00",
      stat: t("home.solutions.sol4.stat"),
    },
    {
      icon: BarChart3,
      title: t("home.solutions.sol5.title"),
      description: t("home.solutions.sol5.desc"),
      href: "/solutions/erp-automation",
      color: "#FF8A00",
      stat: t("home.solutions.sol5.stat"),
    },
    {
      icon: Cpu,
      title: t("home.solutions.sol6.title"),
      description: t("home.solutions.sol6.desc"),
      href: "/solutions/marketing-automation",
      color: "#00E5FF",
      stat: t("home.solutions.sol6.stat"),
    },
  ];

  return (
    <section className="section-pad hex-pattern" style={{ position: "relative" }}>
      <div className="container-wide">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div className="section-label" style={{ display: "inline-flex" }}>
            {t("home.solutions.eyebrow")}
          </div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: "20px" }}>
            {t("home.solutions.title_prefix")}
            <span className="gradient-text-blue-violet">{t("home.solutions.title_accent")}</span>
          </h2>
          <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "1.1rem", maxWidth: "560px", margin: "0 auto" }}>
            {t("home.solutions.description")}
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {solutions.map((sol, i) => {
            const Icon = sol.icon;
            const isHovered = hovered === i;

            return (
              <div
                key={sol.title}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: "relative",
                  background: isHovered ? `rgba(255,255,255,0.05)` : "rgba(255,255,255,0.025)",
                  border: `1px solid ${isHovered ? sol.color + "40" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: "16px",
                  padding: "28px 24px",
                  cursor: "pointer",
                  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                  boxShadow: isHovered ? `0 20px 50px rgba(0,0,0,0.4), 0 0 25px ${sol.color}18` : "none",
                  overflow: "hidden",
                }}
              >
                {/* Hover glow blob */}
                {isHovered && (
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0,
                    width: "100%",
                    height: "100%",
                    background: `radial-gradient(circle at 30% 30%, ${sol.color}08 0%, transparent 60%)`,
                    pointerEvents: "none",
                  }} />
                )}

                {/* Icon */}
                <div style={{
                  width: 48, height: 48,
                  borderRadius: "12px",
                  background: `${sol.color}14`,
                  border: `1px solid ${sol.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "18px",
                  transition: "box-shadow 0.3s",
                  boxShadow: isHovered ? `0 0 20px ${sol.color}30` : "none",
                }}>
                  <Icon size={22} color={sol.color} />
                </div>

                <h3 style={{
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  marginBottom: "10px",
                  color: isHovered ? "#F5F7FA" : "rgba(245,247,250,0.9)",
                }}>
                  {sol.title}
                </h3>

                <p style={{
                  fontFamily: "Exo 2, sans-serif",
                  fontSize: "0.875rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.65,
                  marginBottom: "20px",
                }}>
                  {sol.description}
                </p>

                {/* Stat */}
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: sol.color,
                  padding: "5px 12px",
                  background: `${sol.color}12`,
                  border: `1px solid ${sol.color}25`,
                  borderRadius: "100px",
                  letterSpacing: "0.05em",
                  marginBottom: "20px",
                }}>
                  ↑ {sol.stat}
                </div>

                {/* Learn More */}
                <Link
                  href={sol.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontFamily: "Orbitron, sans-serif",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: isHovered ? sol.color : "var(--text-muted)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                    letterSpacing: "0.05em",
                  }}
                >
                  {t("home.solutions.learn_more")} <ArrowRight size={13} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <Link href="/solutions" className="btn-ghost">
            {t("home.solutions.view_all")}
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .solutions-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .solutions-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
