import { Metadata } from "next";
export const metadata: Metadata = { title: "Security Policy | CerebroHive", description: "How CerebroHive protects your data with enterprise-grade security practices." };
const sections = [
  { title: "1. Data Encryption", content: "All data transmitted to and from CerebroHive services is encrypted in transit using TLS 1.3. Data at rest is encrypted using AES-256. API keys and credentials are stored in encrypted secret management systems and never exposed in application code." },
  { title: "2. Access Control", content: "We implement role-based access control (RBAC) across all internal systems. Access to client data is strictly limited to personnel who require it to deliver contracted services. All access events are logged and reviewed periodically." },
  { title: "3. LLM API Security", content: "When integrating with external LLM providers on behalf of clients, we deploy private API gateway proxies that enforce token rate limits, PII redaction, and audit logging. Client data is never passed to public model providers without explicit contractual authorization." },
  { title: "4. Infrastructure Security", content: "Our infrastructure is hosted on cloud platforms with SOC 2 Type II and ISO 27001 certifications. We conduct automated vulnerability scanning, dependency auditing, and penetration testing on a regular schedule." },
  { title: "5. Incident Response", content: "CerebroHive maintains a documented Incident Response Plan. In the event of a security breach affecting client data, we will notify affected clients within 72 hours of becoming aware of the incident, as required by applicable regulations." },
  { title: "6. Responsible Disclosure", content: "If you discover a security vulnerability in our systems, please report it responsibly to security@cerebro-hive.com. We commit to acknowledging your report within 48 hours and working to resolve confirmed vulnerabilities promptly." },
];
export default function SecurityPage() {
  return (
    <div className="bg-background min-h-screen">
      <section className="relative py-24 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,122,0.04),transparent_70%)]" />
        <div className="container-wide relative z-10 max-w-3xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">Security Policy</h1>
          <p className="text-text-secondary font-inter">Effective Date: July 1, 2026 · CerebroHive OPC Pvt. Ltd.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container-wide max-w-3xl flex flex-col gap-6">
          {sections.map((s) => (
            <div key={s.title} className="p-6 rounded-2xl bg-surface border border-border">
              <h2 className="text-lg font-space font-bold text-text-primary mb-3">{s.title}</h2>
              <p className="text-text-secondary font-inter text-sm leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
