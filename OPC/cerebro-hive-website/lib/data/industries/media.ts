import { Industry } from "./types";

export const media: Industry = {
  name: "Media & Entertainment",
  slug: "media",
  color: "#EC4899", // Pink
  engineConfig: {
    heroTheme: "media",
    backgroundAnimation: "transaction-network",
    primaryColor: "#EC4899", // Pink
    secondaryColor: "#A855F7", // Purple
    accentColor: "#06B6D4" // Cyan
  },
  hero: {
    title: "AI-Powered Content Intelligence",
    subtitle: "MEDIA AI",
    description: "Personalize content discovery, optimize audience engagement, and automate moderation with generative AI.",
    primaryCta: "Explore Media AI",
    secondaryCta: "View Architecture",
  },
  overview: {
    maturityScore: 78,
    currentChallengesSummary: "Content discovery issues and manual moderation.",
    opportunitySummary: "Hyper-personalized recommendations and generative content creation.",
    statistics: [
      { metric: "35%", label: "Engagement Lift" },
      { metric: "60%", label: "Faster Moderation" },
      { metric: "99%", label: "Uptime" }
    ]
  },
  segments: ["Streaming Services", "Publishing", "Gaming", "Sports", "Music", "Broadcasting"],
  challenges: [
    {
      title: "Content Discovery",
      pain: "Audiences struggling to find relevant content in massive libraries.",
      cost: "High subscriber churn",
      businessImpact: "Revenue Leakage",
      priority: "Critical",
      category: "Customer",
      problems: ["Generic Recommendations", "Cold Start Problem", "Metadata Gaps", "High Churn"],
      solutions: ["Recommendation Agent", "Vector Search", "Knowledge Graphs", "Contextual AI"],
      outcomes: ["↑ Watch Time", "↓ Subscriber Churn", "↑ Content ROI"],
      techStack: ["Pinecone", "Databricks", "TensorFlow", "Neo4j"],
      aiAgent: "Recommendation Agent",
      readiness: { implementation: "12 Weeks", complexity: "Medium", roi: "Very High" }
    },
    {
      title: "Audience Engagement",
      pain: "Losing audience attention to competing platforms.",
      cost: "Decreased ad revenue",
      businessImpact: "Lost Market Share",
      priority: "High",
      category: "Customer",
      problems: ["Static Content", "Delayed Analytics", "Poor Segmentation", "Ineffective Promos"],
      solutions: ["Audience Intelligence AI", "Real-Time Personalization", "Generative Trailers", "Dynamic Ads"],
      outcomes: ["↑ Ad Yield", "↑ Engagement Rates", "↑ Audience Growth"],
      techStack: ["Snowflake", "OpenAI", "Kafka", "React"],
      aiAgent: "Audience Agent",
      readiness: { implementation: "14 Weeks", complexity: "High", roi: "High" }
    },
    {
      title: "Content Moderation",
      pain: "Manual moderation scaling poorly with user-generated content.",
      cost: "High moderation costs and brand safety risks",
      businessImpact: "Brand Reputation",
      priority: "Critical",
      category: "Risk",
      problems: ["Toxic Content", "Copyright Infringement", "Slow Takedowns", "Human Trauma"],
      solutions: ["Moderation AI", "Computer Vision", "NLP Toxicity Detection", "Automated Takedowns"],
      outcomes: ["↑ Brand Safety", "↓ Moderation Costs", "↑ Platform Trust"],
      techStack: ["AWS Rekognition", "Hugging Face", "ElasticSearch", "Python"],
      aiAgent: "Content Agent",
      readiness: { implementation: "8 Weeks", complexity: "Low", roi: "High" }
    }
  ],
  opportunityMatrix: [
    { name: "Creator Tools", description: "Generative AI assisting creators in production.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "user", position: { x: 0, y: 150 }, data: { label: "Subscriber", type: "client" } },
      { id: "api", position: { x: 200, y: 150 }, data: { label: "Streaming Gateway", type: "gateway", status: "Healthy" } },
      { id: "ai", position: { x: 400, y: 150 }, data: { label: "Media AI", type: "ai", status: "Active" } },
      { id: "kg", position: { x: 600, y: 150 }, data: { label: "Content Graph", type: "database" } }
    ],
    edges: []
  },
  agents: [
    { name: "Recommendation Agent", description: "Personalizes the feed.", capabilities: ["Vector Search"] },
    { name: "Content Agent", description: "Tags and moderates media.", capabilities: ["Vision AI", "NLP"] }
  ],
  erpIntegration: ["Royalty Management", "Advertising"],
  techStack: [{ layer: "AI", technologies: ["Vector DBs", "LLMs"] }],
  outcomes: [],
  caseStudy: { client: "Global Streamer", title: "AI Recommendations", timeline: "5 Months", architecture: "Media AI", outcome: "Success", metric: "35%" },
  roadmap: [],
  compliance: [{ badge: "COPPA", description: "Children's Online Privacy Protection Act" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: []
};
