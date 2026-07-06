"use client";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, Calendar, BookOpen, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/layout/LanguageContext";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  links?: { label: string; href: string }[];
}

export default function CerebroChat() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [initialTime, setInitialTime] = useState("12:00 PM");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize timestamp asynchronously to avoid hydration mismatch and avoid set-state-in-effect warning
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMsg: Message = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let replyText = t("chat.reply_default");
      let links: { label: string; href: string }[] = [];

      const query = textToSend.toLowerCase();

      // Simple language-agnostic keyword lookup
      const isCourse = query.includes("course") || query.includes("academy") || query.includes("learn") || query.includes("education") || query.includes("curso") || query.includes("kurs");
      const isBook = query.includes("book") || query.includes("consult") || query.includes("contact") || query.includes("meeting") || query.includes("schedule") || query.includes("cita") || query.includes("consulta") || query.includes("buchen") || query.includes("gespräch") || query.includes("termin");
      const isAgent = query.includes("agent") || query.includes("langgraph") || query.includes("flow") || query.includes("flujo");
      const isPaper = query.includes("whitepaper") || query.includes("guide") || query.includes("report") || query.includes("informe") || query.includes("leitfaden");
      const isTool = query.includes("tool") || query.includes("directory") || query.includes("n8n") || query.includes("langchain") || query.includes("herramienta");

      if (isCourse) {
        replyText = t("chat.reply_course");
        links = [
          { label: t("chat.btn_browse_courses"), href: "/academy/courses" },
          { label: t("chat.btn_learning_paths"), href: "/academy/learning-paths" }
        ];
      } else if (isBook) {
        replyText = t("chat.reply_consult");
        links = [{ label: t("chat.btn_book_consultation"), href: "/contact" }];
      } else if (isAgent) {
        replyText = t("chat.reply_agent");
        links = [
          { label: t("chat.btn_agent_solutions"), href: "/solutions/customer-support-ai" },
          { label: t("chat.btn_knowledge_management"), href: "/solutions/knowledge-management" }
        ];
      } else if (isPaper) {
        replyText = t("chat.reply_whitepaper");
        links = [{ label: t("chat.btn_explore_whitepapers"), href: "/resources/whitepapers" }];
      } else if (isTool) {
        replyText = t("chat.reply_tool");
        links = [{ label: t("chat.btn_ai_tools_directory"), href: "/resources/ai-tools-directory" }];
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          links: links.length > 0 ? links : undefined,
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const suggestions = [
    { label: t("chat.suggest_course"), icon: BookOpen },
    { label: t("chat.book_consult"), icon: Calendar },
    { label: t("chat.what_agents"), icon: Sparkles },
    { label: t("chat.free_papers"), icon: HelpCircle }
  ];

  return (
    <div style={{ position: "fixed", bottom: "32px", right: "32px", zIndex: 9999, fontFamily: "Exo 2, sans-serif" }}>
      {/* 1. Closed Chat Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="glow-blue animate-pulse-glow"
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--neural-blue), var(--violet))",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#080B14",
            transition: "transform 0.3s ease",
            boxShadow: "0 4px 20px rgba(0, 229, 255, 0.4)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <MessageSquare size={26} />
        </button>
      )}

      {/* 2. Expanded Chat Card */}
      {isOpen && (
        <div
          className="card-glass"
          style={{
            width: "380px",
            height: "520px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0, 229, 255, 0.15)",
            border: "1px solid rgba(0, 229, 255, 0.25)",
            borderRadius: "20px",
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(90deg, rgba(8,11,20,0.95), rgba(13,18,33,0.95))",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "rgba(0,229,255,0.1)",
                  border: "1px solid rgba(0,229,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={16} color="var(--neural-blue)" />
              </div>
              <div>
                <h4 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "4px" }}>
                  Cerebro Assistant <Sparkles size={11} color="var(--neural-blue)" />
                </h4>
                <div style={{ fontSize: "0.65rem", color: "var(--neural-blue)" }}>{t("chat.status")}</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "4px",
                marginLeft: "auto",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: "20px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              background: "rgba(8,11,20,0.85)",
            }}
          >
            {/* Virtual Greeting Message */}
            <div style={{ alignSelf: "flex-start", maxWidth: "80%" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  color: "var(--text-primary)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "12px 16px",
                  borderRadius: "16px 16px 16px 0",
                  fontSize: "0.85rem",
                  lineHeight: 1.5,
                }}
              >
                {t("chat.greeting")}
              </div>
              <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "4px", textAlign: "left" }}>
                {initialTime}
              </div>
            </div>

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "80%",
                }}
              >
                <div
                  style={{
                    background: msg.sender === "user" ? "linear-gradient(135deg, var(--neural-blue) 0%, rgba(123,97,255,0.7) 100%)" : "rgba(255,255,255,0.04)",
                    color: msg.sender === "user" ? "#080B14" : "var(--text-primary)",
                    border: msg.sender === "user" ? "none" : "1px solid rgba(255,255,255,0.06)",
                    padding: "12px 16px",
                    borderRadius: msg.sender === "user" ? "16px 16px 0 16px" : "16px 16px 16px 0",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                  }}
                >
                  {msg.text}
                  {msg.links && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px" }}>
                      {msg.links.map((link) => (
                        <Link
                          key={link.label}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          style={{
                            color: msg.sender === "user" ? "#080B14" : "var(--neural-blue)",
                            fontWeight: 600,
                            textDecoration: "underline",
                            display: "inline-flex",
                            alignItems: "center",
                            fontSize: "0.8rem",
                          }}
                        >
                          {link.label} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", marginTop: "4px", textAlign: msg.sender === "user" ? "right" : "left" }}>
                  {msg.timestamp}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ alignSelf: "flex-start", display: "flex", gap: "4px", padding: "10px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", fontSize: "0.8rem" }}>
                <span className="animate-pulse" style={{ color: "var(--neural-blue)" }}>●</span>
                <span className="animate-pulse" style={{ animationDelay: "0.2s", color: "var(--neural-blue)" }}>●</span>
                <span className="animate-pulse" style={{ animationDelay: "0.4s", color: "var(--neural-blue)" }}>●</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (when chat is empty/ready) */}
          {messages.length === 0 && !isTyping && (
            <div style={{ padding: "12px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: "rgba(8,11,20,0.9)" }}>
              {suggestions.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => handleSend(s.label)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(0, 229, 255, 0.12)",
                      borderRadius: "8px",
                      color: "var(--text-muted)",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(0, 229, 255, 0.05)";
                      e.currentTarget.style.borderColor = "var(--neural-blue)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                      e.currentTarget.style.borderColor = "rgba(0, 229, 255, 0.12)";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    <Icon size={12} style={{ color: "var(--neural-blue)" }} />
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            style={{
              padding: "16px 20px",
              background: "rgba(13,18,33,0.95)",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              type="text"
              placeholder={t("chat.placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "0.85rem",
                color: "var(--text-primary)",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.3)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
            <button
              type="submit"
              aria-label="Send message"
              style={{
                background: "linear-gradient(135deg, var(--neural-blue), var(--violet))",
                border: "none",
                borderRadius: "8px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#080B14",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
