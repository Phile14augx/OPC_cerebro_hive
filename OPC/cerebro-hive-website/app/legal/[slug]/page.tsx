import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const LEGAL_DOCS: Record<
  string,
  { title: string; effective: string; sections: { heading: string; body: string }[] }
> = {
  privacy: {
    title: "Privacy Policy",
    effective: "January 1, 2025",
    sections: [
      {
        heading: "1. Introduction",
        body: "CerebroHive, Inc. ('CerebroHive', 'we', 'our', or 'us') is committed to protecting your personal information. This Privacy Policy explains how we collect, use, share, and safeguard information when you use our platform, services, website, and Academy programs. By accessing or using our products, you agree to the practices described in this policy.",
      },
      {
        heading: "2. Information We Collect",
        body: "We collect information you provide directly (name, email, company, payment information), information generated through your use of our platform (usage logs, configuration data, model inputs/outputs where applicable), and information from third parties (identity providers, payment processors). We do not sell personal data to third parties for advertising purposes.",
      },
      {
        heading: "3. How We Use Information",
        body: "We use your information to provide and improve our services, process payments, communicate with you about your account, ensure platform security, comply with legal obligations, and develop new features. We use aggregate, anonymized data to improve our AI models and platform performance.",
      },
      {
        heading: "4. Data Retention",
        body: "We retain personal data for as long as necessary to provide services and comply with legal obligations. Account data is retained for 90 days following account closure unless a longer period is required by law. You may request deletion of your data at any time by contacting privacy@cerebro-hive.com.",
      },
      {
        heading: "5. Data Sharing",
        body: "We share data with service providers who help us operate the platform (cloud infrastructure, payment processors, analytics), legal authorities when required by law, and business successors in the event of merger or acquisition. We execute Data Processing Agreements with all sub-processors handling personal data.",
      },
      {
        heading: "6. Security",
        body: "We maintain SOC 2 Type II certification and implement industry-standard security controls including encryption in transit (TLS 1.3+) and at rest (AES-256), access controls, penetration testing, and vulnerability management programs. For healthcare clients, we execute HIPAA Business Associate Agreements.",
      },
      {
        heading: "7. Your Rights",
        body: "Depending on your location, you may have rights to access, correct, delete, port, or restrict processing of your personal data, and to object to certain processing. EU/UK residents have rights under GDPR. California residents have rights under CCPA/CPRA. To exercise your rights, contact privacy@cerebro-hive.com.",
      },
      {
        heading: "8. Contact",
        body: "For privacy inquiries: privacy@cerebro-hive.com. CerebroHive, Inc., Attn: Privacy Officer. We aim to respond to all requests within 30 days.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    effective: "January 1, 2025",
    sections: [
      {
        heading: "1. Acceptance",
        body: "By accessing or using CerebroHive's platform, APIs, services, or Academy programs, you agree to be bound by these Terms of Service. If you are using CerebroHive on behalf of an organization, you represent that you have authority to bind that organization to these terms.",
      },
      {
        heading: "2. Services",
        body: "CerebroHive provides an enterprise AI platform (50 products across 6 tiers), professional services (AI strategy, engineering, operations, security, and industry solutions), and Academy training programs. Specific terms for each service category are governed by the applicable Order Form or Statement of Work.",
      },
      {
        heading: "3. Account Responsibilities",
        body: "You are responsible for maintaining the confidentiality of your credentials, all activity that occurs under your account, ensuring your use complies with applicable laws, and providing accurate account information. You must notify us immediately of any unauthorized access to your account.",
      },
      {
        heading: "4. Acceptable Use",
        body: "You agree not to use CerebroHive to violate applicable laws, infringe third-party rights, transmit malware or malicious code, reverse engineer our proprietary models or software, or resell access without written authorization. See our Acceptable Use Policy for the complete list of prohibited activities.",
      },
      {
        heading: "5. Intellectual Property",
        body: "CerebroHive retains all rights to our platform, software, models, and documentation. You retain rights to your data and content. Work product created under professional services engagements is governed by the applicable Statement of Work, which typically transfers ownership of custom-developed deliverables to you upon payment.",
      },
      {
        heading: "6. Limitation of Liability",
        body: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, CEREBRO-HIVE'S TOTAL LIABILITY FOR ANY CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR OUR SERVICES SHALL NOT EXCEED THE AMOUNTS PAID BY YOU IN THE 12 MONTHS PRECEDING THE CLAIM. WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES.",
      },
      {
        heading: "7. Governing Law",
        body: "These Terms are governed by the laws of the State of Delaware, without regard to conflict of law principles. Any disputes shall be resolved by binding arbitration under JAMS rules, except that either party may seek injunctive relief in any court of competent jurisdiction.",
      },
      {
        heading: "8. Changes",
        body: "We may update these Terms from time to time. We will provide 30 days' notice of material changes via email or platform notification. Continued use of CerebroHive after the effective date of changes constitutes acceptance of the updated Terms.",
      },
    ],
  },
  security: {
    title: "Security Policy",
    effective: "January 1, 2025",
    sections: [
      {
        heading: "1. Security Program Overview",
        body: "CerebroHive maintains a comprehensive information security management system (ISMS) aligned to ISO 27001 principles and audited against SOC 2 Trust Service Criteria (Security, Availability, Confidentiality) annually by an independent third-party auditor. Our SOC 2 Type II report is available to customers under NDA.",
      },
      {
        heading: "2. Infrastructure Security",
        body: "All CerebroHive production infrastructure runs on FedRAMP-authorized cloud providers (AWS GovCloud, Azure Government where applicable). We implement defense-in-depth: network segmentation, WAF, DDoS protection, and zero-trust access controls. Data is encrypted in transit (TLS 1.3+) and at rest (AES-256).",
      },
      {
        heading: "3. AI-Specific Security",
        body: "We implement controls specific to AI systems: prompt injection defenses, output filtering, model access controls, rate limiting, and audit logging of all model interactions. Our AI security team conducts quarterly red-team exercises against all customer-facing AI systems.",
      },
      {
        heading: "4. Access Control",
        body: "CerebroHive employees follow least-privilege access principles. Production access requires manager approval, MFA, and audit logging. We conduct quarterly access reviews and revoke access within 24 hours of employee departure.",
      },
      {
        heading: "5. Vulnerability Management",
        body: "We conduct continuous automated vulnerability scanning, quarterly penetration testing by external firms, and maintain a responsible disclosure program. Critical vulnerabilities are remediated within 24 hours; high severity within 7 days.",
      },
      {
        heading: "6. Incident Response",
        body: "Our incident response program follows NIST SP 800-61. We maintain a 24/7 Security Operations function and are committed to notifying affected customers within 72 hours of discovering a breach affecting their data, consistent with GDPR Article 33.",
      },
      {
        heading: "7. Responsible Disclosure",
        body: "We welcome security researchers who responsibly disclose vulnerabilities. Please report security concerns to security@cerebro-hive.com with the subject line 'Responsible Disclosure'. We commit to acknowledging reports within 24 hours and providing a remediation timeline within 7 days. We do not pursue legal action against researchers who follow responsible disclosure guidelines.",
      },
      {
        heading: "8. Certifications & Attestations",
        body: "Current certifications: SOC 2 Type II (annual), FedRAMP Moderate (authorized). In progress: ISO 27001 (expected Q3 2026). Compliance alignments: NIST CSF, NIST AI RMF, HIPAA (BAA available), EU AI Act, GDPR, CCPA.",
      },
    ],
  },
  dpa: {
    title: "Data Processing Agreement",
    effective: "January 1, 2025",
    sections: [
      {
        heading: "1. Purpose",
        body: "This Data Processing Agreement ('DPA') supplements the CerebroHive Terms of Service or Master Services Agreement and governs CerebroHive's processing of personal data on behalf of customers acting as data controllers, in accordance with applicable data protection law including GDPR, CCPA, and HIPAA where applicable.",
      },
      {
        heading: "2. Roles",
        body: "The customer is the data controller, determining the purposes and means of processing personal data. CerebroHive is the data processor, processing personal data only on documented instructions from the customer and only for the purposes set forth in the applicable Order Form or Statement of Work.",
      },
      {
        heading: "3. Processing Instructions",
        body: "CerebroHive processes personal data only to provide the contracted services, comply with legal obligations, and as otherwise expressly permitted in writing by the customer. CerebroHive does not use customer data to train its proprietary models without explicit written consent.",
      },
      {
        heading: "4. Sub-Processors",
        body: "CerebroHive uses sub-processors to provide infrastructure (AWS, Azure), payment processing (Stripe), and communications services. A current list of sub-processors is available at cerebro-hive.com/legal/sub-processors. We notify customers of new sub-processors 30 days in advance and allow customers to object.",
      },
      {
        heading: "5. Security Measures",
        body: "CerebroHive implements technical and organizational measures appropriate to the risk, including encryption, access controls, and audit logging as described in our Security Policy. Customers may request details of specific security measures for their deployment.",
      },
      {
        heading: "6. Data Subject Rights",
        body: "CerebroHive assists customers in fulfilling data subject rights requests (access, deletion, portability, correction) within commercially reasonable timeframes, typically within 5 business days of receipt of a verified request from the customer.",
      },
      {
        heading: "7. Breach Notification",
        body: "CerebroHive notifies customers without undue delay, and in any event within 72 hours, of becoming aware of a personal data breach affecting customer data. Notification includes the nature of the breach, categories and approximate number of data subjects affected, and likely consequences.",
      },
      {
        heading: "8. Governing Law & Execution",
        body: "This DPA is governed by the same law as the underlying agreement. To execute a DPA, email legal@cerebro-hive.com. Enterprise customers should work with their CerebroHive account team to execute a DPA as part of their MSA.",
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    effective: "January 1, 2025",
    sections: [
      {
        heading: "1. What Are Cookies",
        body: "Cookies are small text files placed on your device when you visit a website. We also use similar technologies including pixel tags, web beacons, and local storage. This policy explains how CerebroHive uses these technologies on our website and platform.",
      },
      {
        heading: "2. Strictly Necessary Cookies",
        body: "These cookies are required for the website and platform to function and cannot be disabled. They include session authentication cookies, CSRF protection tokens, and load-balancing cookies. These do not track you across sites and are not used for advertising.",
      },
      {
        heading: "3. Analytics Cookies",
        body: "We use privacy-preserving analytics (Plausible Analytics, which does not use cookies and processes no personal data) to understand how visitors use our website. We do not use Google Analytics or similar cookie-based analytics tools.",
      },
      {
        heading: "4. Functional Cookies",
        body: "Functional cookies remember your preferences (theme, language, consent choices) to improve your experience. These are first-party cookies and are not shared with third parties.",
      },
      {
        heading: "5. Cookies We Do NOT Use",
        body: "CerebroHive does not use advertising or tracking cookies, third-party behavioral advertising networks, or cross-site tracking technologies. We do not sell data to data brokers. Our Academy platform uses first-party cookies only for course progress and authentication.",
      },
      {
        heading: "6. Managing Cookies",
        body: "You can control cookies through your browser settings. Disabling strictly necessary cookies will impair platform functionality. Since we use privacy-preserving analytics that don't use cookies, opting out of analytics does not require browser changes.",
      },
      {
        heading: "7. Contact",
        body: "Questions about our cookie practices: privacy@cerebro-hive.com.",
      },
    ],
  },
  aup: {
    title: "Acceptable Use Policy",
    effective: "January 1, 2025",
    sections: [
      {
        heading: "1. Purpose",
        body: "This Acceptable Use Policy ('AUP') defines the acceptable and prohibited uses of CerebroHive's platform, APIs, services, and Academy programs. All users, including employees of customer organizations, must comply with this AUP.",
      },
      {
        heading: "2. Prohibited Uses",
        body: "You may not use CerebroHive to: violate applicable laws or regulations; infringe intellectual property rights; generate, distribute, or store illegal content; create, deploy, or facilitate malware, ransomware, or cyberattacks; engage in unauthorized access to systems; conduct fraud or deception; generate content intended to harass, threaten, or harm individuals; violate export control laws; or use AI systems to make consequential decisions about individuals without appropriate human oversight and disclosure.",
      },
      {
        heading: "3. AI-Specific Restrictions",
        body: "Users may not use CerebroHive's AI capabilities to: generate disinformation or synthetic media designed to deceive; impersonate individuals without consent; conduct adversarial attacks on third-party AI systems; circumvent safety filters or alignment measures; develop AI systems for autonomous weapons; or process sensitive personal data without appropriate legal basis and consent.",
      },
      {
        heading: "4. Regulated Industries",
        body: "Customers using CerebroHive in regulated industries (healthcare, financial services, government) must comply with all applicable regulations (HIPAA, GLBA, FINRA, FedRAMP, etc.) in addition to this AUP. CerebroHive provides compliance tooling but customers remain responsible for their regulatory compliance.",
      },
      {
        heading: "5. Enforcement",
        body: "CerebroHive may suspend or terminate access to any account that violates this AUP, with or without notice depending on the severity of the violation. We cooperate with law enforcement when legally required. Serious violations may result in permanent termination and referral to appropriate authorities.",
      },
      {
        heading: "6. Reporting Violations",
        body: "To report AUP violations or abuse, contact security@cerebro-hive.com with subject 'AUP Violation Report'. We investigate all reports and respond within 2 business days. Good-faith reports of violations will not be penalized.",
      },
    ],
  },
};

const SLUG_LABELS: Record<string, string> = {
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  security: "Security Policy",
  dpa: "Data Processing Agreement",
  cookies: "Cookie Policy",
  aup: "Acceptable Use Policy",
};

export async function generateStaticParams() {
  return Object.keys(LEGAL_DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];
  if (!doc) return { title: "Document Not Found" };
  return {
    title: `${doc.title} — CerebroHive`,
    description: `CerebroHive ${doc.title}. Effective ${doc.effective}.`,
    robots: { index: false, follow: false },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = LEGAL_DOCS[slug];
  if (!doc) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-8">
      <Link
        href="/company"
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary-accent transition-colors"
      >
        <ArrowLeft size={14} /> Company
      </Link>

      <div className="mt-6 mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary-accent mb-2">
          Legal
        </p>
        <h1 className="text-3xl font-bold text-text-primary">{doc.title}</h1>
        <p className="text-xs text-text-secondary mt-2">Effective date: {doc.effective}</p>
      </div>

      {/* Nav to other legal docs */}
      <div className="flex flex-wrap gap-2 mb-10">
        {Object.entries(SLUG_LABELS).map(([s, label]) => (
          <Link
            key={s}
            href={`/legal/${s}`}
            className={`text-[10px] font-semibold px-3 py-1 rounded-full border transition-colors ${
              s === slug
                ? "border-primary-accent/50 bg-primary-accent/10 text-primary-accent"
                : "border-border text-text-secondary hover:border-primary-accent/30 hover:text-text-primary"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="space-y-8">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-base font-bold text-text-primary mb-3">{section.heading}</h2>
            <p className="text-sm text-text-secondary leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <p className="text-xs text-text-secondary">
          Questions about this document? Contact{" "}
          <a href="mailto:legal@cerebro-hive.com" className="text-primary-accent hover:underline">
            legal@cerebro-hive.com
          </a>
        </p>
      </div>
    </main>
  );
}
