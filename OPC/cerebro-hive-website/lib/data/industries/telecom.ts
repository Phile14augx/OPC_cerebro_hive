import { Industry } from "./types";

export const telecom: Industry = {
  name: "Telecommunications",
  slug: "telecom",
  color: "#A855F7", // Purple
  engineConfig: {
    heroTheme: "telecom",
    backgroundAnimation: "transaction-network",
    primaryColor: "#A855F7", // Purple
    secondaryColor: "#06B6D4", // Cyan
    accentColor: "#3B82F6" // Blue
  },
  hero: {
    title: "AI-Native Connected Networks",
    subtitle: "TELCO INTELLIGENCE",
    description: "Optimize 5G networks, predict faults, and personalize subscriber experiences with AI.",
    primaryCta: "Explore Telco AI",
    secondaryCta: "View Architecture",
  },
  overview: {
    maturityScore: 88,
    currentChallengesSummary: "Network congestion and high customer churn.",
    opportunitySummary: "Self-healing networks and proactive customer care.",
    statistics: [
      { metric: "30%", label: "Less Downtime" },
      { metric: "25%", label: "Churn Reduction" },
      { metric: "40%", label: "OpEx Savings" }
    ]
  },
  segments: ["Wireless", "Broadband", "Satellite", "IoT Connectivity", "Infrastructure"],
  challenges: [
    {
      title: "Network Congestion",
      pain: "Poor resource allocation leading to slow speeds during peak times.",
      cost: "Suboptimal CAPEX spend and angry customers",
      businessImpact: "Customer Churn",
      priority: "Critical",
      category: "Operations",
      problems: ["Peak Spikes", "Inefficient Bandwidth", "Manual Slicing", "Spectrum Waste"],
      solutions: ["Network AI Agent", "Dynamic Slicing", "Predictive Load Balancing", "Traffic Shaping"],
      outcomes: ["↑ Network Speeds", "↓ CAPEX Requirements", "↑ QoE"],
      techStack: ["Kubernetes", "Kafka", "TensorFlow", "Redis"],
      aiAgent: "Network Operations Agent",
      readiness: { implementation: "16 Weeks", complexity: "High", roi: "Very High" }
    },
    {
      title: "Fault Detection",
      pain: "Reactive maintenance causing prolonged outages.",
      cost: "SLA penalties and massive truck roll costs",
      businessImpact: "Operational Friction",
      priority: "Critical",
      category: "Risk",
      problems: ["Silent Failures", "Alarm Storms", "Manual Diagnostics", "Unnecessary Truck Rolls"],
      solutions: ["Fault Agent", "Root Cause Analysis AI", "Self-Healing Networks", "Predictive Maintenance"],
      outcomes: ["↓ Mean Time to Repair (MTTR)", "↓ Truck Rolls", "↑ Network Uptime"],
      techStack: ["Splunk", "ElasticSearch", "Databricks", "Python"],
      aiAgent: "Fault Agent",
      readiness: { implementation: "12 Weeks", complexity: "High", roi: "High" }
    },
    {
      title: "Customer Churn",
      pain: "Inability to predict and prevent subscriber churn.",
      cost: "High customer acquisition costs to replace lost subs",
      businessImpact: "Revenue Leakage",
      priority: "High",
      category: "Customer",
      problems: ["Generic Offers", "Poor Support", "Hidden Dissatisfaction", "Price Sensitivity"],
      solutions: ["Customer Agent", "Churn Prediction", "Next-Best-Action", "Hyper-Personalization"],
      outcomes: ["↓ Churn Rate", "↑ ARPU", "↑ NPS"],
      techStack: ["Neo4j", "OpenAI", "AWS", "Snowflake"],
      aiAgent: "Customer Experience Agent",
      readiness: { implementation: "10 Weeks", complexity: "Medium", roi: "Very High" }
    }
  ],
  opportunityMatrix: [
    { name: "Capacity Planning", description: "AI-driven CAPEX optimization for tower placement.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "tower", position: { x: 0, y: 150 }, data: { label: "5G Infrastructure", type: "client" } },
      { id: "oss", position: { x: 200, y: 150 }, data: { label: "OSS / BSS", type: "system", status: "Healthy" } },
      { id: "ai", position: { x: 400, y: 150 }, data: { label: "Telco AI", type: "ai", status: "Active" } },
      { id: "noc", position: { x: 600, y: 150 }, data: { label: "NOC Dashboard", type: "client" } }
    ],
    edges: []
  },
  agents: [
    { name: "Network Agent", description: "Balances load and slices networks.", capabilities: ["Optimization"] },
    { name: "Customer Agent", description: "Resolves billing and tech issues.", capabilities: ["Support"] }
  ],
  erpIntegration: ["OSS/BSS", "Billing"],
  techStack: [{ layer: "Network", technologies: ["5G Core", "Edge Computing"] }],
  outcomes: [],
  caseStudy: { client: "Tier 1 Telco", title: "Self-Healing Network", timeline: "8 Months", architecture: "Telco AI", outcome: "Success", metric: "40%" },
  roadmap: [],
  compliance: [{ badge: "FCC", description: "Regulatory Compliance" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: [],

  seo: {
    title: "Telecom AI Solutions | Network AI, Churn Prediction & Customer Service AI | CerebroHive",
    description: "CerebroHive deploys AI for telecommunications — network operations AI, churn prediction, AI customer service, fraud detection, 5G network optimization, and telecom operations automation.",
    keywords: ["telecom AI solutions", "telecommunications AI", "network AI optimization", "churn prediction telecom", "telecom fraud detection", "5G AI", "telecom customer service AI", "telecom operations AI", "network operations center AI"],
  },

  faqs: [
    { question: "How is AI transforming telecommunications?", answer: "Telecom AI applications span: network operations (AI predicts and prevents network outages, optimizes capacity, and automates fault resolution); customer experience (AI-powered customer service handles 60–70% of inquiries autonomously, and churn prediction AI identifies at-risk customers for retention intervention); fraud detection (AI detects telecom fraud patterns including SIM swap, call spoofing, and subscription fraud in real time); revenue management (AI optimizes pricing, bundles, and upsell recommendations for individual customer segments); and 5G network slicing (AI dynamically allocates network resources to meet service level requirements for different use cases on shared 5G infrastructure)." },
    { question: "How does AI improve network operations for carriers?", answer: "Network operations AI: predictive maintenance (AI analyzes network telemetry to predict equipment failures before outages — reducing mean time between failure); anomaly detection (AI identifies unusual network behavior patterns that indicate congestion, security threats, or equipment problems faster than rule-based systems); automated remediation (AI triggers automated corrective actions for common network problems without NOC intervention, reducing mean time to repair); capacity planning (AI forecasts traffic growth by geography and use case to optimize network investment decisions); and energy optimization (AI optimizes active equipment for energy efficiency during low-traffic periods)." },
    { question: "How does churn prediction AI work in telecom?", answer: "Telecom churn prediction AI builds models that score every customer's probability of canceling service in the next 30/60/90 days. Signals include: usage pattern changes (declining call, data, or app usage), network experience (complaint history, service interruptions experienced), customer service interactions (contact frequency, complaint topics, resolution satisfaction), contract status (approaching contract end dates), and competitive signals (competitor promotions in the customer's market area). AI scores are used to trigger targeted retention offers — ensuring resources focus on customers who are both likely to churn and likely to respond to retention interventions." },
    { question: "How do telecoms use AI for fraud detection?", answer: "Telecom fraud AI detects: SIM swap fraud (detecting account takeover patterns before fraudulent SIM replacements are completed); international revenue share fraud (AI identifies abnormal call routing patterns to premium rate numbers); subscription fraud (AI flags applications with characteristics matching historical fraud patterns); roaming fraud (detecting abnormal roaming usage that indicates SIM cloning or account compromise); and calling line identification manipulation (detecting spoofed caller IDs used in robocall and scam campaigns). Real-time fraud scoring allows carriers to block fraudulent traffic within seconds of detection." },
    { question: "What is AI-powered network slicing for 5G?", answer: "5G network slicing allows carriers to create virtualized networks on shared physical infrastructure, each with different performance characteristics (bandwidth, latency, reliability). AI manages network slicing by: dynamically allocating resources to each slice based on actual demand; predicting capacity requirements for different applications (e.g., a healthcare slice needs ultra-low latency, an IoT slice needs wide coverage but can tolerate higher latency); auto-scaling slices up and down based on usage patterns; and ensuring SLAs are maintained across slices during congestion events. AI makes network slicing commercially viable by automating the complex resource management." },
    { question: "How does AI improve customer service for telecom companies?", answer: "Telecom AI customer service handles: billing inquiry resolution (AI retrieves account history, explains charges, and applies standard adjustments); technical support tier-1 (AI diagnoses common connectivity issues using network telemetry and guides self-service resolution); outage communication (AI proactively communicates network outage status and estimated restoration times to affected customers); upgrade and upsell (AI identifies when a customer's usage patterns make them a good candidate for a plan upgrade and presents contextually relevant offers); and complaint resolution (AI handles standard complaints within policy, escalating complex cases to human agents with full context)." },
    { question: "How is AI used in telecom revenue assurance?", answer: "Revenue assurance AI identifies and prevents revenue leakage: usage assurance (AI compares network usage records against billing records to detect uncaptured revenue); interconnect billing (AI validates inter-carrier settlement bills for accuracy); fraud leakage (AI identifies traffic that is generating cost but not revenue — unauthorized usage, misconfigured routing); and regulatory reporting (AI validates that regulatory data submissions match network records). Carriers typically recover 1–3% of revenue through AI-powered assurance that identifies leakage patterns human reviewers miss." },
    { question: "What AI use cases exist for enterprise telecom and B2B services?", answer: "Enterprise telecom AI use cases: SD-WAN optimization (AI dynamically routes enterprise traffic across carrier links based on real-time performance and cost); SLA monitoring and remediation (AI monitors enterprise circuit performance and triggers automated remediation when SLAs are at risk); managed security services (AI-powered threat detection for enterprise customers as a managed service); network-as-a-service provisioning (AI automates enterprise network configuration changes on customer request); and enterprise customer success (AI analyzes enterprise account health, usage patterns, and support history to identify upsell and at-risk accounts)." },
    { question: "How do telecom operators use AI for tower and infrastructure management?", answer: "Telecom tower infrastructure AI: site performance optimization (AI analyzes signal coverage, interference patterns, and capacity utilization to recommend antenna configuration adjustments); predictive maintenance for tower equipment (AI analyzes power systems, cooling, and antenna data to predict failures); energy management (tower sites are major energy consumers — AI optimizes generator run time, battery usage, and active equipment energy consumption); site selection (AI models coverage, capacity, and cost tradeoffs for new site placement decisions); and sharing optimization (AI identifies opportunities for passive infrastructure sharing between operators)." },
    { question: "What is the role of AI in RAN (Radio Access Network) optimization?", answer: "RAN optimization AI continuously improves radio network performance: automatic parameter optimization (AI adjusts hundreds of RAN parameters — transmit power, antenna tilt, handover thresholds — to optimize coverage and capacity); interference management (AI coordinates frequency usage across cells to minimize interference); load balancing (AI shifts traffic between frequency bands, sectors, and technologies to prevent congestion); and energy optimization (AI activates and deactivates cells during low-traffic periods while maintaining coverage). RAN AI can improve spectral efficiency by 15–25% without hardware changes." },
  ],
};
