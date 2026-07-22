"use client";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/layout/LanguageContext";

function CountUp({ target, suffix, color }: { target: number; suffix: string; color: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} style={{ fontFamily: "Orbitron, sans-serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, color, textShadow: `0 0 20px ${color}66` }}>
      {count.toLocaleString()}{suffix}
    </div>
  );
}

export default function SocialProofBar() {
  const { t } = useLanguage();

  const stats = [
    { value: 500, suffix: "+", label: t("home.stats.projects"), color: "#00E5FF" },
    { value: 50, suffix: "+", label: t("home.stats.agents"), color: "#7B61FF" },
    { value: 10000, suffix: "+", label: t("home.stats.students"), color: "#FF2ED1" },
    { value: 30, suffix: "+", label: t("home.stats.industries"), color: "#FFBA00" },
  ];

  return (
    <section style={{ padding: "0", position: "relative", zIndex: 10 }}>
      <div className="container-wide">
        <div style={{
          background: "rgba(255,255,255,0.025)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(0, 229, 255, 0.12)",
          borderRadius: "20px",
          padding: "40px 48px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
          marginTop: "-60px",
          boxShadow: "0 20px 80px rgba(0,0,0,0.5), 0 0 40px rgba(0,229,255,0.05)",
        }}>
          {stats.map((stat, i) => (
            <div key={stat.label} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              position: "relative",
              padding: "8px 16px",
            }}>
              {i < stats.length - 1 && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: "20%",
                  height: "60%",
                  width: 1,
                  background: "rgba(255,255,255,0.08)",
                }} />
              )}
              <CountUp target={stat.value} suffix={stat.suffix} color={stat.color} />
              <div style={{
                fontFamily: "Exo 2, sans-serif",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--text-muted)",
                marginTop: "6px",
                letterSpacing: "0.02em",
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)", opacity: 0.7, marginTop: "10px" }}>
          Illustrative figures representing target scale, not audited live metrics.
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; padding: 28px 24px !important; margin-top: -40px !important; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
