"use client";
import { useState } from "react";
import { X, Mail, Shield, CheckCircle, Download } from "lucide-react";

interface GatedDownloadModalProps {
  title: string;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export default function GatedDownloadModal({ title, onClose, onSuccess }: GatedDownloadModalProps) {
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) return;

    setSubmitted(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          type: "gated-download",
          target: title
        })
      });
    } catch (err) {
      console.error("Failed to log gated download lead:", err);
    }
    // Trigger parent success callback after slight delay
    setTimeout(() => {
      onSuccess(form.email);
    }, 1000);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(8, 11, 20, 0.8)", backdropFilter: "blur(8px)",
      padding: "20px",
    }}>
      <div className="card-glass" style={{
        maxWidth: "480px", width: "100%", padding: "36px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(0, 229, 255, 0.1)",
        border: "1px solid rgba(0, 229, 255, 0.25)",
        position: "relative",
        animation: "fadeIn 0.2s ease-out",
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "20px", right: "20px",
            background: "transparent", border: "none", color: "var(--text-muted)",
            cursor: "pointer", padding: "4px",
          }}
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: "60px", height: "60px", borderRadius: "50%",
              background: "rgba(0, 229, 255, 0.1)", border: "1px solid rgba(0, 229, 255, 0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <CheckCircle size={28} color="var(--neural-blue)" />
            </div>
            <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.15rem", fontWeight: 700, color: "var(--neural-blue)", marginBottom: "12px" }}>
              Request Approved!
            </h3>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px" }}>
              Thank you. The whitepaper <strong>&quot;{title}&quot;</strong> has been unlocked.
            </p>
            <a
              href={`/whitepapers/${title.toLowerCase().replace(/\s+/g, "-")}.pdf`}
              download
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Download size={16} />
              Download PDF Now
            </a>
          </div>
        ) : (
          <>
            <div className="section-label" style={{ display: "inline-flex", marginBottom: "16px" }}>
              <Shield size={11} /> Gated Research
            </div>
            <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.35, marginBottom: "10px" }}>
              Download Whitepaper
            </h3>
            <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "24px", lineHeight: 1.5 }}>
              Enter your details below to unlock <strong>&quot;{title}&quot;</strong> and join our weekly executive briefing.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { id: "name", label: "Full Name", placeholder: "Alex Mercer", type: "text" },
                { id: "email", label: "Work Email", placeholder: "alex@company.com", type: "email" },
                { id: "company", label: "Company", placeholder: "Cerebro Industries", type: "text" },
              ].map((field) => (
                <div key={field.id}>
                  <label style={{ display: "block", fontFamily: "Orbitron, sans-serif", fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--neural-blue)", marginBottom: "6px" }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    required
                    placeholder={field.placeholder}
                    value={form[field.id as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
                      padding: "10px 14px", fontFamily: "Exo 2, sans-serif",
                      fontSize: "0.85rem", color: "var(--text-primary)", outline: "none",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(0, 229, 255, 0.3)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                  />
                </div>
              ))}

              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "4px" }}>
                <Mail size={14} color="var(--neural-blue)" style={{ flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "0.675rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                  We respect your privacy. By submitting, you agree to receive technical whitepapers and marketing emails from CerebroHive. Unsubscribe anytime.
                </span>
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "8px" }}>
                Request Access →
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
