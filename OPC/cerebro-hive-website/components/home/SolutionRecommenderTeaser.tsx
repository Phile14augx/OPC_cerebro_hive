"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const challenges = [
  { label: "Operations & Workflow", icon: "⚙️", href: "/solutions/erp-automation" },
  { label: "Customer Experience", icon: "🤝", href: "/solutions/customer-support-ai" },
  { label: "Sales & Marketing", icon: "📈", href: "/solutions/sales-automation" },
  { label: "HR & Training", icon: "👥", href: "/solutions/hr-automation" },
  { label: "Finance & Reporting", icon: "💰", href: "/solutions/erp-automation" },
  { label: "Knowledge & Data", icon: "🧠", href: "/solutions/knowledge-management" },
];

export default function SolutionRecommenderTeaser() {
  const [selected, setSelected] = useState<number | null>(null);
  const router = useRouter();

  const handleSelect = (i: number) => {
    setSelected(i);
    setTimeout(() => {
      router.push(challenges[i].href);
    }, 600);
  };

  return (
    <section className="section-pad">
      <div className="container-wide">
        <div style={{
          background: "rgba(0, 229, 255, 0.03)",
          border: "1px solid rgba(0, 229, 255, 0.12)",
          borderRadius: "24px",
          padding: "64px 48px",
          position: "relative",
          overflow: "hidden",
          textAlign: "center",
        }}>
          {/* Decorative glow */}
          <div style={{
            position: "absolute",
            top: "-60px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "400px",
            height: "200px",
            background: "radial-gradient(ellipse, rgba(0,229,255,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div className="section-label" style={{ display: "inline-flex", marginBottom: "24px" }}>
            Find Your Solution
          </div>

          <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", marginBottom: "16px" }}>
            What&apos;s Your Biggest{" "}
            <span className="gradient-text-full">AI Challenge</span>{" "}
            Right Now?
          </h2>
          <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", fontSize: "1rem", marginBottom: "40px", maxWidth: "480px", margin: "0 auto 40px" }}>
            Select your primary challenge and we&apos;ll show you the right AI solution.
          </p>

          {/* Options */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", maxWidth: "720px", margin: "0 auto 40px" }}>
            {challenges.map((ch, i) => (
              <button
                key={ch.label}
                onClick={() => handleSelect(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "14px 18px",
                  background: selected === i
                    ? "rgba(0, 229, 255, 0.15)"
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${selected === i ? "rgba(0,229,255,0.5)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.25s",
                  fontFamily: "Exo 2, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: selected === i ? "#00E5FF" : "rgba(245,247,250,0.8)",
                  textAlign: "left",
                  boxShadow: selected === i ? "0 0 20px rgba(0,229,255,0.2)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (selected !== i) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,229,255,0.25)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(245,247,250,1)";
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selected !== i) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(245,247,250,0.8)";
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                  }
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>{ch.icon}</span>
                {ch.label}
              </button>
            ))}
          </div>

          {/* Full recommender CTA */}
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <button
              onClick={() => router.push("/tools/solution-finder")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: "Exo 2, sans-serif",
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                textDecorationColor: "transparent",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#00E5FF")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)")}
            >
              Take the full AI Solution Finder quiz <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .recommender-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
