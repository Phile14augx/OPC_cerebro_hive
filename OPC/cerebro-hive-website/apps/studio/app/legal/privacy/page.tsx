import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CerebroHive",
  description: "CerebroHive privacy policy — how we collect, use, and protect your data.",
};

const sections = [
  { title: "1. Information We Collect", content: "We collect information you provide directly to us, such as when you fill out our contact form, request a strategy call, enroll in a course, or subscribe to our community. This includes your name, business email address, company name, phone number, and project details. We also automatically collect certain technical data when you visit our website, including IP address, browser type, pages visited, and session duration." },
  { title: "2. How We Use Your Information", content: "We use the information we collect to respond to your inquiries, deliver the services you request, send you relevant technical content and research updates, improve our website and offerings, and comply with legal obligations. We do not use your data for automated profiling or sell your personal data to third parties." },
  { title: "3. Data Storage and Security", content: "Your data is stored securely on our servers located in India and processed in accordance with applicable data protection laws. We implement industry-standard encryption, access controls, and audit logging to protect your information. We retain your data only as long as necessary to fulfil the purposes described in this policy." },
  { title: "4. Sharing of Information", content: "We do not sell, rent, or trade your personal information. We may share your data with trusted service providers who assist us in operating our business under strict confidentiality agreements. We may disclose your information when required by law or to protect the rights and safety of CerebroHive and its clients." },
  { title: "5. Your Rights", content: "You have the right to access, correct, or delete personal data we hold about you. You may also withdraw consent, object to processing, or request data portability at any time. To exercise these rights, contact us at privacy@cerebro-hive.com. We will respond within 30 days." },
  { title: "6. Cookies", content: "We use essential cookies to ensure our website functions correctly and analytical cookies to understand how visitors interact with our site. You may disable non-essential cookies through your browser settings. We do not use advertising or tracking cookies." },
  { title: "7. Changes to This Policy", content: "We may update this Privacy Policy periodically. We will notify you of material changes by posting the revised policy on this page with an updated effective date. Continued use of our services after changes constitutes acceptance of the updated policy." },
  { title: "8. Contact", content: "For any privacy-related questions or requests, contact our Data Protection Officer at: privacy@cerebro-hive.com or write to CerebroHive OPC Pvt. Ltd., Electronic City Phase II, Bengaluru - 560 100, Karnataka, India." },
];

export default function PrivacyPage() {
  return (
    <div className="bg-background min-h-screen">
      <section className="relative py-24 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,122,0.04),transparent_70%)]" />
        <div className="container-wide relative z-10 max-w-3xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">Privacy Policy</h1>
          <p className="text-text-secondary font-inter">Effective Date: July 1, 2026 · CerebroHive OPC Pvt. Ltd.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container-wide max-w-3xl">
          <p className="text-text-secondary font-inter leading-relaxed mb-12">CerebroHive OPC Pvt. Ltd. is committed to protecting the privacy of individuals who interact with our website and services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.</p>
          <div className="flex flex-col gap-6">
            {sections.map((s) => (
              <div key={s.title} className="p-6 rounded-2xl bg-surface border border-border">
                <h2 className="text-lg font-space font-bold text-text-primary mb-3">{s.title}</h2>
                <p className="text-text-secondary font-inter text-sm leading-relaxed">{s.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
