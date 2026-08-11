export interface ImpactMetric {
  id: string;
  metric: string;
  label: string;
  domain: string;
  architecture: string;
}

export const impactMetrics: ImpactMetric[] = [
  {
    id: "m1",
    metric: "$2.4M",
    label: "Annual OPEX Reduction",
    domain: "Financial Services",
    architecture: "Replaced 40 rigid RPA bots with 3 autonomous reasoning agents."
  },
  {
    id: "m2",
    metric: "300%",
    label: "Faster Claim Processing",
    domain: "Healthcare",
    architecture: "Deployed private multimodal LLM to parse handwritten unstructured clinical forms."
  },
  {
    id: "m3",
    metric: "99.9%",
    label: "Uptime & Availability",
    domain: "Logistics",
    architecture: "Global supply chain routing optimized via distributed edge inferencing."
  },
  {
    id: "m4",
    metric: "Zero",
    label: "Data Breaches",
    domain: "Enterprise Wide",
    architecture: "Strict BYOK encryption and completely air-gapped model deployments."
  }
];
