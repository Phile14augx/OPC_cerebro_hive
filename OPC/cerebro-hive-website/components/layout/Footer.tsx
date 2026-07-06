"use client";
import Link from "next/link";
import { useLanguage } from "@/components/layout/LanguageContext";

const socials = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    path: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "https://twitter.com",
    path: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    path: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#06090F" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
];

export default function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    [t("footer.company")]: [
      { label: t("nav.about"), href: "/about" },
      { label: t("footer.careers"), href: "/careers" },
      { label: t("footer.communityHub"), href: "/community" },
      { label: t("footer.caseStudies"), href: "/case-studies" },
      { label: t("footer.contact"), href: "/contact" },
    ],
    [t("nav.services")]: [
      { label: t("nav.services_dropdown.consulting"), href: "/services/ai-consulting" },
      { label: t("nav.services_dropdown.automation"), href: "/services/ai-automation" },
      { label: t("nav.services_dropdown.development"), href: "/services/ai-development" },
      { label: t("nav.services_dropdown.data"), href: "/services/data-engineering" },
      { label: t("nav.services_dropdown.training"), href: "/services/corporate-training" },
    ],
    [t("nav.academy")]: [
      { label: t("footer.allCourses"), href: "/academy/courses" },
      { label: t("footer.certifications"), href: "/academy/certifications" },
      { label: t("footer.learningPaths"), href: "/academy/learning-paths" },
      { label: t("footer.bootcamps"), href: "/academy/bootcamps" },
      { label: t("footer.corporatePrograms"), href: "/academy/corporate-programs" },
      { label: t("footer.affiliateProgram"), href: "/academy/referral" },
    ],
    [t("nav.resources")]: [
      { label: t("footer.blog"), href: "/resources/blog" },
      { label: t("footer.whitepapers"), href: "/resources/whitepapers" },
      { label: t("footer.aiTools"), href: "/resources/ai-tools-directory" },
      { label: t("footer.templates"), href: "/resources/templates" },
      { label: t("footer.aiReadiness"), href: "/tools/ai-readiness" },
    ],
  };

  return (
    <footer style={{ background: "#06090F", borderTop: "1px solid rgba(0,229,255,0.08)", paddingTop: "80px" }}>
      <div className="container-wide">
        {/* Top section */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1.6fr", gap: "40px", marginBottom: "60px" }}>
          {/* Brand column */}
          <div style={{ gridColumn: "span 1" }}>
            {/* Logo */}
            <div style={{ marginBottom: "16px" }}>
              <span style={{ fontFamily: "Orbitron, sans-serif", fontWeight: 700, fontSize: "1.3rem" }}>
                <span className="gradient-text-blue-violet">Cerebro</span>
                <span className="gradient-text-orange">Hive</span>
              </span>
            </div>
            <p style={{ color: "var(--text-primary)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "20px", fontFamily: "Orbitron, sans-serif", fontWeight: 500 }}>
              Intelligence. Connection. Impact.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", lineHeight: 1.7 }}>
              {t("footer.slogan")}
            </p>
            {/* Socials */}
            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              {socials.map(({ path, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "8px",
                    color: "rgba(245,247,250,0.6)",
                    transition: "all 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = "#00E5FF";
                    el.style.borderColor = "rgba(0,229,255,0.3)";
                    el.style.background = "rgba(0,229,255,0.08)";
                    el.style.boxShadow = "0 0 12px rgba(0,229,255,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = "rgba(245,247,250,0.6)";
                    el.style.borderColor = "rgba(255,255,255,0.08)";
                    el.style.background = "rgba(255,255,255,0.04)";
                    el.style.boxShadow = "none";
                  }}
                >
                  {path}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 style={{
                fontFamily: "Orbitron, sans-serif",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--neural-blue)",
                marginBottom: "16px",
              }}>
                {category}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{
                        fontFamily: "Exo 2, sans-serif",
                        fontSize: "0.875rem",
                        color: "var(--text-muted)",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#00E5FF")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 style={{
              fontFamily: "Orbitron, sans-serif",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--neural-blue)",
              marginBottom: "16px",
            }}>
              {t("footer.stayAhead")}
            </h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "16px" }}>
              {t("footer.newsletterDesc")}
            </p>
            <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                type="email"
                placeholder="your@email.com"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  fontFamily: "Exo 2, sans-serif",
                  fontSize: "0.875rem",
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(0,229,255,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
              />
              <button type="submit" className="btn-primary" style={{ padding: "11px 20px", fontSize: "0.78rem" }}>
                {t("footer.subscribe")}
              </button>
            </form>
          </div>
        </div>

        {/* Neon divider */}
        <div className="neon-divider" />

        {/* Bottom bar */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 0",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.8rem", color: "var(--text-dim)" }}>
            {t("footer.rights")}
          </p>
          <div style={{ display: "flex", gap: "24px" }}>
            {[
              { label: t("footer.privacy"), href: "#" },
              { label: t("footer.terms"), href: "#" },
              { label: t("footer.cookie"), href: "#" }
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  fontFamily: "Exo 2, sans-serif",
                  fontSize: "0.8rem",
                  color: "var(--text-dim)",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--neural-blue)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          footer .container-wide > div:first-child {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          footer .container-wide > div:first-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
