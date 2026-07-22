import { Metadata } from "next";
export const metadata: Metadata = { title: "AI Ethics Charter | CerebroHive", description: "CerebroHive commitment to responsible, transparent, and human-centric AI development." };
const principles = [
  { title: "Human-Centric AI", content: "We design all AI systems to augment human capability, not replace human judgment in high-stakes decisions. Every autonomous agent we build includes human-in-the-loop override mechanisms. We measure success not just by automation rates, but by outcomes for the people the system serves." },
  { title: "Transparency & Explainability", content: "We are committed to building AI systems that can explain their reasoning in plain language. We do not deploy black-box models in contexts where clients or end-users have a right to understand why a decision was made. We document model limitations and failure modes in all project deliverables." },
  { title: "Privacy by Design", content: "We apply privacy-by-design principles in every AI system we architect. PII identification, redaction, and access control are not afterthoughts — they are built into data pipelines from day one. We never train models on client data without explicit consent and contractual authorization." },
  { title: "Fairness & Bias Mitigation", content: "We actively test AI models for demographic bias and discriminatory patterns before deployment. We document evaluation metrics and known limitations. Where bias is identified, we escalate findings to clients and propose remediation paths before proceeding to production." },
  { title: "Security & Adversarial Robustness", content: "We design AI systems to resist prompt injection, model extraction, and adversarial manipulation. All enterprise AI deployments include threat modelling specific to LLM attack surfaces. We conduct red-team evaluations on agent pipelines before client handover." },
  { title: "Accountability", content: "CerebroHive accepts accountability for the AI systems we design and deploy during the contracted engagement period. We provide SLAs on model performance and commit to post-launch monitoring periods. When errors occur, we document root causes and implement corrections transparently." },
  { title: "Environmental Responsibility", content: "We evaluate the computational cost and carbon footprint of AI model choices. Where feasible, we recommend smaller, fine-tuned models over large general-purpose models to reduce inference costs and environmental impact. We encourage clients to track AI operational costs as part of their sustainability reporting." },
];
export default function AIEthicsPage() {
  return (
    <div className="bg-background min-h-screen">
      <section className="relative py-24 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,245,122,0.04),transparent_70%)]" />
        <div className="container-wide relative z-10 max-w-3xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-accent mb-4 block">Legal</span>
          <h1 className="text-4xl md:text-5xl font-space font-bold text-text-primary mb-4">AI Ethics Charter</h1>
          <p className="text-text-secondary font-inter">Our commitment to responsible, transparent, and human-centric AI development.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="container-wide max-w-3xl">
          <p className="text-text-secondary font-inter leading-relaxed mb-12">At CerebroHive, we believe the measure of excellent AI engineering is not just technical performance — it is the net positive impact on the organizations and people the system serves. The following principles guide every engagement, every model, and every line of agent code we write.</p>
          <div className="flex flex-col gap-6">
            {principles.map((p, i) => (
              <div key={p.title} className="p-6 rounded-2xl bg-surface border border-border flex gap-5">
                <div className="w-8 h-8 rounded-lg bg-primary-accent/10 border border-primary-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary-accent font-space font-bold text-xs">{i + 1}</span>
                </div>
                <div>
                  <h2 className="text-base font-space font-bold text-text-primary mb-2">{p.title}</h2>
                  <p className="text-text-secondary font-inter text-sm leading-relaxed">{p.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-6 rounded-2xl bg-primary-accent/5 border border-primary-accent/20">
            <p className="text-text-secondary font-inter text-sm leading-relaxed">This charter is a living document, updated as our understanding of responsible AI evolves. For questions or to discuss specific ethical considerations for your project, contact us at <a href="mailto:ethics@cerebro-hive.com" className="text-primary-accent hover:underline">ethics@cerebro-hive.com</a>.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
