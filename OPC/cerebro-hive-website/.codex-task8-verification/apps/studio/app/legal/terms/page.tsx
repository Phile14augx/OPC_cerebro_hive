import { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of Service | CerebroHive", description: "CerebroHive terms of service governing use of our platform and services." };
const sections = [
  { title: "1. Acceptance of Terms", content: "By accessing or using the CerebroHive website, services, or products, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services. These terms apply to all visitors, clients, and users." },
  { title: "2. Services", content: "CerebroHive provides AI consulting, engineering, education, and automation services to enterprise clients. Service delivery terms, timelines, and deliverables are defined in individual Statements of Work (SOW) and Master Services Agreements (MSA) executed between CerebroHive and each client." },
  { title: "3. Intellectual Property", content: "All content on this website including text, graphics, logos, and code is the property of CerebroHive OPC Pvt. Ltd. unless otherwise stated. Client deliverables and intellectual property ownership are governed by the specific project contract. Generally, clients own all custom code and models built for them after full payment." },
  { title: "4. Prohibited Use", content: "You may not use our services to violate any applicable law, infringe on intellectual property rights, transmit malware or harmful code, scrape or reproduce our website content without permission, or misrepresent your identity or affiliation with CerebroHive." },
  { title: "5. Limitation of Liability", content: "CerebroHive shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability for any claim arising from our services shall not exceed the fees paid by you in the three months preceding the claim." },
  { title: "6. Confidentiality", content: "Both parties agree to maintain the confidentiality of proprietary information shared during engagements. Non-disclosure obligations are typically formalized in the MSA executed at the start of each client relationship." },
  { title: "7. Governing Law", content: "These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India." },
  { title: "8. Contact", content: "For questions about these Terms of Service, contact us at legal@cerebro-hive.com." },
];
export default function TermsPage() {
  return (
    <div className="bg-background min-h-screen">
      <section className="relative py-24 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,122,0.04),transparent_70%)]" />
        <div className="container-wide relative z-10 max-w-3xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">Terms of Service</h1>
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
