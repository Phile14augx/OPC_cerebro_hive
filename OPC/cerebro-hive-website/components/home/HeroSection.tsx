"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { HeroEngine } from "./HeroEngine";
import { useLanguage } from "@/components/layout/LanguageContext";

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new HeroEngine(canvas);
    engine.start();

    const resize = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      engine.resize(w, h);
    };
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      engine.setMouse(x, y);
    };

    const handleMouseLeave = () => {
      engine.setMouse(-9999, -9999);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      engine.stop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <>
      {/* 1. Living AI Ecosystem Animation Section */}
      <section style={{ position: "relative", height: "75vh", width: "100%", overflow: "hidden", background: "#080B14" }}>
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        />
        {/* Scroll indicator for the animation section */}
        <div style={{
          position: "absolute",
          bottom: "32px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          opacity: 0.6,
        }}>
          <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-muted)" }}>
            {t("home.explore")}
          </span>
          <div style={{
            width: 24, height: 40,
            border: "1px solid rgba(0,229,255,0.3)",
            borderRadius: 12,
            display: "flex",
            justifyContent: "center",
            paddingTop: 8,
          }}>
            <div style={{
              width: 4, height: 8,
              background: "var(--neural-blue)",
              borderRadius: 2,
              animation: "float 1.5s ease-in-out infinite",
            }} />
          </div>
        </div>
      </section>

      {/* 2. Hero Content Section */}
      <section style={{ position: "relative", background: "#080B14", paddingTop: "80px", paddingBottom: "100px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container-wide">
          <div style={{ maxWidth: "820px", margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* Label */}
            <div className="section-label" style={{ marginBottom: "28px" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--neural-blue)", display: "inline-block" }} />
              AI Automation • AI Consulting • AI Education
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: "28px",
              letterSpacing: "-0.01em",
            }}>
              <span style={{ display: "block", color: "#F5F7FA" }}>{t("home.hero.headline_1")}</span>
              <span style={{ display: "block" }}>
                <span className="gradient-text-full">{t("home.hero.headline_2")}</span>
              </span>
              <span style={{ display: "block", color: "#F5F7FA" }}>
                {t("home.hero.headline_3")}
              </span>
            </h1>

            {/* Subheadline */}
            <p style={{
              fontFamily: "Exo 2, sans-serif",
              fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
              color: "rgba(245,247,250,0.75)",
              lineHeight: 1.7,
              maxWidth: "600px",
              marginBottom: "40px",
            }}>
              {t("home.hero.subtitle")}
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/contact" className="btn-primary" style={{ fontSize: "0.9rem", padding: "14px 32px" }}>
                {t("home.hero.cta_consult")}
              </Link>
              <Link href="/solutions" className="btn-ghost" style={{ fontSize: "0.9rem", padding: "14px 32px" }}>
                {t("home.hero.cta_solutions")}
              </Link>
            </div>

            {/* Trust badges */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", marginTop: "56px", flexWrap: "wrap" }}>
              {[
                { label: t("home.expertise_badge"), value: t("home.expertise_val") },
                { label: t("home.clients_badge"), value: t("home.clients_val") },
                { label: t("home.global_badge"), value: t("home.global_val") },
              ].map((badge) => (
                <div key={badge.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: 1, height: 32, background: "rgba(0,229,255,0.2)" }} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {badge.label}
                    </div>
                    <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "var(--neural-blue)" }}>
                      {badge.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
