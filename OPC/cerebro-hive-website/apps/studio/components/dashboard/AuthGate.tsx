"use client";

import React, { useState } from "react";
import { Sparkles, Building, Mail, Lock, CreditCard, Calendar, ShieldCheck, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

interface AuthGateProps {
  onAuthSuccess: (session: { email: string; company: string }) => void;
}

export default function AuthGate({ onAuthSuccess }: AuthGateProps) {
  const [step, setStep] = useState<"signup" | "payment" | "login">("signup");
  
  // Registration State
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  // Payment State
  const [cardholder, setCardholder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [authorizing, setAuthorizing] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Handler for Signup
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      setSignupError("Company name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setSignupError("Please enter a valid business email.");
      return;
    }
    if (password.length < 6) {
      setSignupError("Password must be at least 6 characters.");
      return;
    }
    setSignupError("");
    // Autofill login email
    setLoginEmail(email);
    // Proceed to payment portal
    setStep("payment");
  };

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const matches = value.match(/\d{1,4}/g);
    setCardNumber(matches ? matches.join(" ") : "");
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  // Format CVV (max 3 digits)
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCvv(value);
  };

  // Handler for Payment Submission
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardholder.trim()) {
      setPaymentError("Cardholder name is required.");
      return;
    }
    if (cardNumber.replace(/\s/g, "").length !== 16) {
      setPaymentError("Please enter a valid 16-digit card number.");
      return;
    }
    if (expiry.length !== 5) {
      setPaymentError("Please enter expiry in MM/YY format.");
      return;
    }
    if (cvv.length !== 3) {
      setPaymentError("Please enter a valid 3-digit CVV.");
      return;
    }
    
    setPaymentError("");
    setAuthorizing(true);

    // Simulate payment gateway loading
    setTimeout(() => {
      setAuthorizing(false);
      setStep("login");
    }, 1800);
  };

  // Handler for Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail !== email || loginPassword !== password) {
      setLoginError("Invalid credentials. Please verify your email and password.");
      return;
    }
    setLoginError("");
    onAuthSuccess({ email: loginEmail, company });
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", padding: "20px 0" }}>
      <div className="card-glass" style={{ width: "100%", maxWidth: "480px", padding: "40px", position: "relative", zIndex: 20 }}>
        
        {/* Step 1: SIGN UP */}
        {step === "signup" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <div className="section-label" style={{ marginBottom: "16px" }}>
                <Sparkles size={11} className="animate-pulse" /> Partner Enrollment
              </div>
              <h2 style={{ fontFamily: "var(--font-orbitron), sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>
                Create Client Profile
              </h2>
              <p style={{ fontFamily: "var(--font-exo), sans-serif", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Initialize credentials to deploy Sandbox models and view invoice ledgers.
              </p>
            </div>

            <form onSubmit={handleSignupSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Company Name
                </label>
                <div style={{ position: "relative" }}>
                  <Building size={16} color="var(--text-dim)" style={{ position: "absolute", left: "14px", top: "14px" }} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. AeroSpace Global Inc."
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 40px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-exo), sans-serif",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--neural-blue)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Business Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="var(--text-dim)" style={{ position: "absolute", left: "14px", top: "14px" }} />
                  <input
                    type="email"
                    required
                    placeholder="partner@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 40px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-exo), sans-serif",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--neural-blue)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} color="var(--text-dim)" style={{ position: "absolute", left: "14px", top: "14px" }} />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 40px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-exo), sans-serif",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--neural-blue)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </div>
              </div>

              {signupError && (
                <div style={{ color: "#FF453A", fontSize: "0.8rem", marginTop: "4px" }}>
                  {signupError}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "10px" }}>
                Proceed to Payment Gate <ArrowRight size={14} />
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Already have an active account?{" "}
                <button
                  onClick={() => setStep("login")}
                  style={{ background: "none", border: "none", color: "var(--neural-blue)", cursor: "pointer", fontWeight: 600, padding: 0 }}
                >
                  Sign In
                </button>
              </span>
            </div>
          </div>
        )}

        {/* Step 2: PAYMENT GATE */}
        {step === "payment" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <div className="section-label" style={{ marginBottom: "16px", color: "var(--amber)", background: "rgba(255,186,0,0.08)", borderColor: "rgba(255,186,0,0.2)" }}>
                <CreditCard size={11} /> Licensing Gate
              </div>
              <h2 style={{ fontFamily: "var(--font-orbitron), sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>
                License Activation
              </h2>
              <p style={{ fontFamily: "var(--font-exo), sans-serif", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Activate sandbox trials and dedicated portal access.
              </p>
            </div>

            {/* License details */}
            <div className="card-glass" style={{ padding: "16px", background: "rgba(255,255,255,0.015)", border: "1px dashed rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Product SKU</span>
                <span className="font-mono" style={{ color: "var(--text-primary)" }}>CEREBRO-SANDBOX-TRIAL</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Authorized User</span>
                <span style={{ color: "var(--text-primary)" }}>{email}</span>
              </div>
              <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontWeight: 700 }}>
                <span style={{ color: "var(--text-primary)" }}>Activation Fee</span>
                <span className="font-mono" style={{ color: "var(--neural-blue)" }}>$0.00 <span style={{ fontSize: "0.7rem", fontWeight: 400, color: "var(--text-muted)" }}>(Developer Sandbox Free Tier)</span></span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  disabled={authorizing}
                  placeholder="e.g. John Doe"
                  value={cardholder}
                  onChange={(e) => setCardholder(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-exo), sans-serif",
                    fontSize: "0.9rem",
                    outline: "none"
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--neural-blue)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Card Number
                </label>
                <div style={{ position: "relative" }}>
                  <CreditCard size={16} color="var(--text-dim)" style={{ position: "absolute", left: "14px", top: "14px" }} />
                  <input
                    type="text"
                    required
                    disabled={authorizing}
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 40px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--neural-blue)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "6px" }}>
                    Expiry Date
                  </label>
                  <div style={{ position: "relative" }}>
                    <Calendar size={16} color="var(--text-dim)" style={{ position: "absolute", left: "14px", top: "14px" }} />
                    <input
                      type="text"
                      required
                      disabled={authorizing}
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      style={{
                        width: "100%",
                        padding: "12px 16px 12px 40px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: "0.9rem",
                        outline: "none"
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "var(--neural-blue)"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "6px" }}>
                    CVV
                  </label>
                  <input
                    type="password"
                    required
                    disabled={authorizing}
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--neural-blue)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </div>
              </div>

              {paymentError && (
                <div style={{ color: "#FF453A", fontSize: "0.8rem", marginTop: "4px" }}>
                  {paymentError}
                </div>
              )}

              <button
                type="submit"
                disabled={authorizing}
                className="btn-orange"
                style={{ width: "100%", marginTop: "10px", opacity: authorizing ? 0.8 : 1 }}
              >
                {authorizing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" style={{ marginRight: "6px" }} /> Authorizing Secure Node...
                  </>
                ) : (
                  <>
                    Activate License & Sign Code <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: LOGIN */}
        {step === "login" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ textAlign: "center" }}>
              <div className="section-label" style={{ marginBottom: "16px", color: "var(--violet)", background: "rgba(123,97,255,0.08)", borderColor: "rgba(123,97,255,0.2)" }}>
                <ShieldCheck size={11} /> Decryption Gate
              </div>
              <h2 style={{ fontFamily: "var(--font-orbitron), sans-serif", fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>
                Workspace Authentication
              </h2>
              <p style={{ fontFamily: "var(--font-exo), sans-serif", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                Validate key credentials to access the secure client console.
              </p>
            </div>

            <div className="card-glass" style={{ padding: "12px", background: "rgba(123, 97, 255, 0.05)", border: "1px solid rgba(123, 97, 255, 0.15)", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.8rem", color: "var(--text-primary)" }}>
              <CheckCircle2 size={16} color="var(--neural-blue)" />
              <span>License authorized successfully for <strong>{company}</strong></span>
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Business Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} color="var(--text-dim)" style={{ position: "absolute", left: "14px", top: "14px" }} />
                  <input
                    type="email"
                    required
                    placeholder="partner@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 40px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-exo), sans-serif",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--neural-blue)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "var(--font-orbitron), sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: "6px" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} color="var(--text-dim)" style={{ position: "absolute", left: "14px", top: "14px" }} />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px 12px 40px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-exo), sans-serif",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "var(--neural-blue)"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                  />
                </div>
              </div>

              {loginError && (
                <div style={{ color: "#FF453A", fontSize: "0.8rem", marginTop: "4px" }}>
                  {loginError}
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "10px" }}>
                Decrypt & Enter Workspace <ArrowRight size={14} />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
