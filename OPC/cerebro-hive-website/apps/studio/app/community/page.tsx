"use client";
import { CheckCircle, ArrowRight, Zap, Users, MessageSquare, Calendar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const channels = [
  {
    icon: MessageSquare,
    color: "#00E5FF",
    title: "Discord Developer Lab",
    desc: "Join 4,500+ active AI builders. Chat about model fine-tuning, RAG frameworks, LangGraph strategies, and show off your automations.",
    members: "4.5k+ Members",
    cta: "Join Discord Chat →",
    href: "https://discord.gg"
  },
  {
    icon: Calendar,
    color: "#7B61FF",
    title: "Weekly AI Hackathons",
    desc: "Build live projects every Saturday, team up with fellow students, and present prototypes to enterprise partners for prizes and roles.",
    members: "Saturdays 9AM EST",
    cta: "Register for Saturday →",
    href: "/academy/bootcamps"
  },
  {
    icon: Users,
    color: "#FF8A00",
    title: "Alumni LinkedIn Network",
    desc: "Connect with certified professionals working as AI engineers, strategy consultants, and data leads across global organizations.",
    members: "1.2k+ Alumni",
    cta: "Request Connection →",
    href: "https://linkedin.com"
  }
];

const events = [
  { date: "June 20", title: "Building Multi-Agent Workflows with LangGraph", type: "Webinar", tag: "Technical", color: "#00E5FF" },
  { date: "June 27", title: "AI Readiness & Governance Frameworks Audit", type: "Workshop", tag: "Strategy", color: "#7B61FF" },
  { date: "July 04", title: "Saturday Sandbox: RAG Pipeline Architectures", type: "Hackathon", tag: "Coding", color: "#FF8A00" },
  { date: "July 11", title: "Cohort Kickoff: AI Engineering Masterclass", type: "Academy", tag: "Education", color: "#FF2ED1" }
];

export default function CommunityPage() {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.includes("@")) return;
    setIsLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: waitlistEmail.split("@")[0],
          email: waitlistEmail,
          company: "Unknown",
          type: "community-waitlist",
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true); // still show success to user
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "60px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative", textAlign: "center" }}>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
            <Users size={11} /> Global Hub
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.8rem)", marginBottom: "20px" }}>
            The CerebroHive <span className="gradient-text-full">Community</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto", lineHeight: 1.7 }}>
            A practitioner ecosystem connecting developers, strategic consultants, and enterprise operators. Learn together, build together.
          </p>
        </div>
      </section>

      {/* Channels Grid */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {channels.map((chan, i) => {
              const Icon = chan.icon;
              return (
                <div key={i} className="card-glass" style={{ padding: "36px 30px", display: "flex", flexDirection: "column", height: "100%", borderColor: "rgba(255,255,255,0.08)", transition: "border-color 0.25s" }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = `${chan.color}40`}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "10px", background: `${chan.color}14`, border: `1px solid ${chan.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={20} color={chan.color} />
                    </div>
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: chan.color, background: `${chan.color}12`, border: `1px solid ${chan.color}30`, padding: "3px 10px", borderRadius: "100px" }}>{chan.members}</span>
                  </div>
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>{chan.title}</h3>
                  <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.83rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px", flex: 1 }}>{chan.desc}</p>
                  <a href={chan.href} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none", fontFamily: "Orbitron, sans-serif", fontSize: "0.78rem", fontWeight: 700, color: chan.color }}>
                    {chan.cta}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Events Calendar List */}
      <section style={{ paddingBottom: "60px" }}>
        <div className="container-wide">
          <div className="card-glass" style={{ padding: "40px" }}>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.35rem", fontWeight: 700, marginBottom: "28px", textAlign: "center" }}>Upcoming Community Events</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "800px", margin: "0 auto" }}>
              {events.map((ev, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyItems: "space-between", padding: "18px 24px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", gap: "20px", flexWrap: "wrap" }}>
                  {/* Date Badge */}
                  <div style={{ width: "80px", textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.06)", paddingRight: "20px" }}>
                    <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>{ev.date.split(" ")[1]}</div>
                    <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.58rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>{ev.date.split(" ")[0]}</div>
                  </div>
                  
                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "inline-flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: ev.color, background: `${ev.color}10`, border: `1px solid ${ev.color}25`, padding: "2px 8px", borderRadius: "100px", textTransform: "uppercase" }}>{ev.type}</span>
                      <span style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.72rem", color: "var(--text-muted)" }}>• {ev.tag}</span>
                    </div>
                    <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.92rem", fontWeight: 700, color: "var(--text-primary)" }}>{ev.title}</h4>
                  </div>
                  
                  {/* Action */}
                  <Link href="/academy" style={{ textDecoration: "none", fontFamily: "Orbitron, sans-serif", fontSize: "0.72rem", fontWeight: 700, color: "var(--neural-blue)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    RSVP Event <ArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Offline Meetups Waitlist */}
      <section style={{ paddingBottom: "100px" }}>
        <div className="container-wide" style={{ maxWidth: "560px" }}>
          <div className="card-glass" style={{ padding: "48px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontFamily: "Orbitron, sans-serif", fontSize: "0.6rem", fontWeight: 700, color: "var(--neural-blue)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "14px" }}>
              <Zap size={10} /> Local Chapters
            </div>
            <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "12px" }}>Join the Offline Meetup Waitlist</h2>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
              We are starting local practitioner chapters for developers and strategy operators in Berlin, San Francisco, Bangalore, and London. Register to receive priority invitations.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input type="email" placeholder="your@email.com" value={waitlistEmail} onChange={(e) => setWaitlistEmail(e.target.value)} required
                  style={{ padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "var(--text-primary)", fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", outline: "none", textAlign: "center" }} />
                <button type="submit" className="btn-primary" style={{ justifyContent: "center", gap: "6px" }}>
                  Join Chapter Waitlist <ArrowRight size={13} />
                </button>
              </form>
            ) : (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <CheckCircle size={36} color="var(--neural-blue)" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1rem", fontWeight: 700, color: "var(--neural-blue)", marginBottom: "6px" }}>✓ Successfully Registered</h3>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  We have added you to our localized mailing list. You will receive updates as soon as the first chapter meetings are scheduled in your region.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
