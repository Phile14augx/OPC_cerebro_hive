export interface TransformationConfig {
  id: string;
  industry: string;
  challenge: string;
  outcome: string;
  architecture: string[];
  useCases: string[];
}

export const transformations: TransformationConfig[] = [
  {
    id: "healthcare",
    industry: "Healthcare & Life Sciences",
    challenge: "Fragmented patient records, stringent HIPAA compliance, and slow clinical trial analysis.",
    outcome: "Unified patient graphs, predictive diagnostics, and automated compliance auditing.",
    architecture: ["Vector Database", "FHIR Interoperability", "Private LLM Enclave"],
    useCases: [
      "Clinical Documentation Generation",
      "Trial Cohort Matching",
      "Prior Authorization Automation"
    ]
  },
  {
    id: "finance",
    industry: "Banking & Financial Services",
    challenge: "Legacy mainframes, siloed risk data, and increasingly sophisticated fraud patterns.",
    outcome: "Real-time anomaly detection, personalized wealth insights, and intelligent risk modeling.",
    architecture: ["Streaming Analytics", "Knowledge Graph", "Explainable AI (XAI) Module"],
    useCases: [
      "Fraud Detection Pipelines",
      "Automated Credit Scoring",
      "Wealth Management Copilot"
    ]
  },
  {
    id: "manufacturing",
    industry: "Manufacturing & Supply Chain",
    challenge: "Unpredictable supply shocks, reactive maintenance, and opaque inventory tracking.",
    outcome: "Predictive maintenance, supply chain resilience, and digital twin simulations.",
    architecture: ["IoT Edge Deployment", "Time-Series Forecasting", "Digital Twin Engine"],
    useCases: [
      "Predictive Equipment Maintenance",
      "Demand Forecasting",
      "Quality Control Computer Vision"
    ]
  },
  {
    id: "retail",
    industry: "Retail & eCommerce",
    challenge: "Generic customer experiences, stockouts, and inefficient pricing strategies.",
    outcome: "Hyper-personalized journeys, dynamic pricing optimization, and automated inventory balancing.",
    architecture: ["Recommendation Engine", "Real-Time Pricing Model", "Customer Data Platform"],
    useCases: [
      "Conversational Commerce Agents",
      "Visual Search & Discovery",
      "Dynamic Markdown Optimization"
    ]
  }
];
