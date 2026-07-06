"use client";
import { useState } from "react";
import { Mail, Phone, MapPin, Calendar, Send, CheckCircle } from "lucide-react";

const services = [
  "AI Consulting", "AI Automation", "AI Agent Development",
  "Data Engineering", "Corporate Training", "Academy Course",
  "Product Demo", "Other",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", company: "", service: "", message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.service || "General Inquiry",
          message: form.message
        })
      });
    } catch (err) {
      console.error("Failed to submit contact request:", err);
    }
    setSubmitted(true);
  };

  return (
    <>
      {/* Hero */}
      <section style={{ paddingTop: "140px", paddingBottom: "60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(0,229,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative", textAlign: "center" }}>
          <div className="section-label" style={{ display: "inline-flex", marginBottom: "24px" }}>
            <Calendar size={12} />
            Free Consultation
          </div>
          <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
            Let&apos;s Build Your{" "}
            <span className="gradient-text-full">AI Strategy Together</span>
          </h1>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "540px", margin: "0 auto", lineHeight: 1.7 }}>
            Book a free consultation or send us a message. Our team responds within 24 hours — usually much faster.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="section-pad" style={{ paddingTop: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "60px", alignItems: "start" }}>
            {/* Left: Contact info */}
            <div>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "28px" }}>
                Get in Touch
              </h2>

              {/* Contact details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "40px" }}>
                {[
                  { icon: Mail, label: "Email", value: "hello@cerebro-hive.com", color: "#00E5FF" },
                  { icon: Phone, label: "Phone", value: "+1 (555) 123-4567", color: "#7B61FF" },
                  { icon: MapPin, label: "Location", value: "Global — Remote-first team", color: "#FF8A00" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${color}14`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={18} color={color} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: color, marginBottom: "4px" }}>{label}</div>
                      <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.95rem", color: "var(--text-primary)" }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calendly embed placeholder */}
              <div style={{
                background: "rgba(0,229,255,0.04)",
                border: "1px solid rgba(0,229,255,0.15)",
                borderRadius: "16px",
                padding: "28px 24px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <Calendar size={18} color="var(--neural-blue)" />
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.9rem", fontWeight: 700, color: "var(--neural-blue)" }}>
                    Book a Time Slot
                  </h3>
                </div>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "16px", lineHeight: 1.65 }}>
                  Prefer to schedule directly? Pick a time that works for you — 30 min strategy call, free.
                </p>
                <a
                  href="https://calendly.com/cerebro-hive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <Calendar size={16} />
                  Schedule on Calendly →
                </a>
              </div>

              {/* Response time */}
              <div style={{ display: "flex", gap: "20px", marginTop: "24px" }}>
                {["24h", "Free", "No pressure"].map((badge, i) => (
                  <div key={badge} style={{ textAlign: "center", flex: 1 }}>
                    <div style={{ fontFamily: "Orbitron, sans-serif", fontWeight: 800, fontSize: "1.1rem", color: ["#00E5FF","#7B61FF","#FF8A00"][i] }}>{badge}</div>
                    <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      {["Response time", "Initial consultation", "Sales pitch"][i]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div className="card-glass" style={{ padding: "40px" }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <CheckCircle size={28} color="var(--neural-blue)" />
                  </div>
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--neural-blue)", marginBottom: "12px" }}>
                    Message Received!
                  </h3>
                  <p style={{ fontFamily: "Exo 2, sans-serif", color: "var(--text-muted)", lineHeight: 1.65 }}>
                    Thanks for reaching out. We&apos;ll be in touch within 24 hours. In the meantime, feel free to explore our <a href="/resources/blog" style={{ color: "var(--neural-blue)" }}>AI resources</a>.
                  </p>
                </div>
              ) : (
                <>
                  <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.2rem", fontWeight: 700, marginBottom: "28px" }}>
                    Send Us a Message
                  </h2>
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      {[
                        { id: "name", label: "Full Name", placeholder: "John Smith", type: "text" },
                        { id: "email", label: "Work Email", placeholder: "john@company.com", type: "email" },
                      ].map((field) => (
                        <div key={field.id}>
                          <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--neural-blue)", marginBottom: "8px" }}>
                            {field.label}
                          </label>
                          <input
                            id={field.id}
                            type={field.type}
                            placeholder={field.placeholder}
                            required
                            value={form[field.id as keyof typeof form]}
                            onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
                            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 16px", fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: "var(--text-primary)", outline: "none" }}
                            onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--neural-blue)", marginBottom: "8px" }}>
                        Company
                      </label>
                      <input
                        id="company"
                        type="text"
                        placeholder="Your Company Name"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 16px", fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: "var(--text-primary)", outline: "none" }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--neural-blue)", marginBottom: "8px" }}>
                        Service Interest
                      </label>
                      <select
                        id="service"
                        value={form.service}
                        onChange={(e) => setForm({ ...form, service: e.target.value })}
                        style={{ width: "100%", background: "rgba(8,11,20,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 16px", fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: form.service ? "var(--text-primary)" : "var(--text-muted)", outline: "none", cursor: "pointer" }}
                      >
                        <option value="">Select a service...</option>
                        {services.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--neural-blue)", marginBottom: "8px" }}>
                        Message
                      </label>
                      <textarea
                        id="message"
                        placeholder="Tell us about your project or challenge..."
                        required
                        rows={4}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 16px", fontFamily: "Exo 2, sans-serif", fontSize: "0.9rem", color: "var(--text-primary)", outline: "none", resize: "vertical" }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ padding: "14px", fontSize: "0.9rem", display: "flex", gap: "8px", justifyContent: "center" }}>
                      <Send size={16} />
                      Send Message →
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
