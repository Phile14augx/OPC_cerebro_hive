"use client";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { useLanguage } from "@/components/layout/LanguageContext";

export default function FinalCTA() {
  const { t } = useLanguage();

  return (
    <section className="section-pad" style={{ position: "relative", overflow: "hidden" }}>
      {/* Background gradient */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,229,255,0.05) 0%, rgba(123,97,255,0.04) 50%, transparent 100%)",
        pointerEvents: "none",
      }} />

      <div className="container-wide">
        <div style={{
          position: "relative",
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(0, 229, 255, 0.2)",
          borderRadius: "28px",
          padding: "80px 48px",
          textAlign: "center",
          overflow: "hidden",
          boxShadow: "0 0 80px rgba(0,229,255,0.06), inset 0 0 60px rgba(0,229,255,0.02)",
        }}>
          {/* Corner glows */}
          {["0 0", "100% 0", "0 100%", "100% 100%"].map((pos, i) => (
            <div key={i} style={{
              position: "absolute",
              top: pos.includes("100%") ? "auto" : 0,
              bottom: pos.includes("100%") ? 0 : "auto",
              left: pos.startsWith("100%") ? "auto" : 0,
              right: pos.startsWith("100%") ? 0 : "auto",
              width: "200px",
              height: "200px",
              background: i % 2 === 0
                ? "radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(123,97,255,0.05) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />
          ))}

          {/* Hexagon decoration */}
          <div style={{
            position: "absolute",
            top: "20px",
            right: "60px",
            opacity: 0.06,
            fontSize: "120px",
            lineHeight: 1,
            color: "#00E5FF",
            fontFamily: "monospace",
          }}>
            ⬡
          </div>

          {/* Content */}
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "28px" }}>
            <Calendar size={12} />
            {t("home.finalCta.eyebrow")}
          </div>

          <h2 style={{
            fontFamily: "Orbitron, sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 900,
            marginBottom: "20px",
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
          }}>
            {t("home.finalCta.title_prefix")}
            <br />
            <span className="gradient-text-full">{t("home.finalCta.title_accent")}</span>
          </h2>

          <p style={{
            fontFamily: "Exo 2, sans-serif",
            fontSize: "1.15rem",
            color: "rgba(245,247,250,0.7)",
            maxWidth: "520px",
            margin: "0 auto 16px",
            lineHeight: 1.7,
          }}>
            {t("home.finalCta.subtitle")}
          </p>
          <p style={{
            fontFamily: "Orbitron, sans-serif",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--neural-blue)",
            marginBottom: "44px",
            letterSpacing: "0.05em",
          }}>
            {t("home.finalCta.highlight")}
          </p>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn-primary" style={{ fontSize: "0.95rem", padding: "16px 40px" }}>
              <Calendar size={18} />
              {t("home.finalCta.cta_book")}
            </Link>
            <Link href="/tools/ai-readiness" className="btn-ghost" style={{ fontSize: "0.95rem", padding: "16px 40px" }}>
              {t("home.finalCta.cta_assess")}
            </Link>
          </div>

          {/* Social proof */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "32px",
            marginTop: "52px",
            flexWrap: "wrap",
          }}>
            {[
              { value: t("home.finalCta.stat1_val"), label: t("home.finalCta.stat1_lbl") },
              { value: t("home.finalCta.stat2_val"), label: t("home.finalCta.stat2_lbl") },
              { value: t("home.finalCta.stat3_val"), label: t("home.finalCta.stat3_lbl") },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "Orbitron, sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "var(--neural-blue)" }}>
                  {item.value}
                </div>
                <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
