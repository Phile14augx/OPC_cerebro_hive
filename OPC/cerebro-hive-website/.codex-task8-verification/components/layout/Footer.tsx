import Link from "next/link";

const FOOTER = {
  platform: {
    label: "Platform",
    links: [
      { label: "All 50 Products", href: "/platform" },
      { label: "Security & Governance", href: "/platform#tier-0" },
      { label: "AI Runtime", href: "/platform#tier-3" },
      { label: "Business Applications", href: "/platform#tier-4" },
      { label: "Ecosystem & Commerce", href: "/platform#tier-5" },
    ],
  },
  services: {
    label: "Services",
    links: [
      { label: "Strategy & Advisory", href: "/services/strategy" },
      { label: "Engineering & Implementation", href: "/services/engineering" },
      { label: "AI Operations", href: "/services/operations" },
      { label: "Security & Governance", href: "/services/security" },
      { label: "Industry Solutions", href: "/services/industry" },
    ],
  },
  solutions: {
    label: "Solutions",
    links: [
      { label: "Enterprise AI", href: "/solutions/enterprise-ai" },
      { label: "AI Agents", href: "/solutions/ai-agents" },
      { label: "RAG Systems", href: "/solutions/rag" },
      { label: "AI Governance", href: "/solutions/ai-governance" },
      { label: "All Solutions", href: "/solutions" },
    ],
  },
  company: {
    label: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Academy", href: "/academy" },
      { label: "Contact", href: "/contact" },
    ],
  },
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="container-wide py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="font-space font-bold text-xl tracking-tight text-text-primary hover:text-primary-accent transition-colors"
            >
              Cerebro<span className="text-primary-accent">Hive</span>
            </Link>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              Enterprise AI systems that transform how organizations operate,
              learn, and grow.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-block px-4 py-2 rounded-full bg-primary-accent text-background text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Book Strategy Session
            </Link>
          </div>

          {/* Nav columns */}
          {Object.values(FOOTER).map((col) => (
            <div key={col.label}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-secondary mb-4">
                {col.label}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-primary-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary">
            © {new Date().getFullYear()} CerebroHive. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/legal/privacy" className="text-xs text-text-secondary hover:text-primary-accent transition-colors">
              Privacy
            </Link>
            <Link href="/legal/terms" className="text-xs text-text-secondary hover:text-primary-accent transition-colors">
              Terms
            </Link>
            <Link href="/legal/security" className="text-xs text-text-secondary hover:text-primary-accent transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
