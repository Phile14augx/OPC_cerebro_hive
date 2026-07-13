import { Industry } from "./types";

export const education: Industry = {
  name: "Education",
  slug: "education",
  color: "#4F46E5", // Indigo
  engineConfig: {
    heroTheme: "education",
    backgroundAnimation: "transaction-network",
    primaryColor: "#4F46E5", // Indigo
    secondaryColor: "#22C55E", // Green
    accentColor: "#06B6D4" // Cyan
  },
  hero: {
    title: "AI for Personalized Learning",
    subtitle: "EDTECH INTELLIGENCE",
    description: "Transform education with adaptive learning pathways, automated administration, and intelligent tutoring.",
    primaryCta: "Explore EdTech AI",
    secondaryCta: "View Architecture",
  },
  overview: {
    maturityScore: 65,
    currentChallengesSummary: "One-size-fits-all learning and high administrative burden.",
    opportunitySummary: "Hyper-personalized tutoring and automated grading.",
    statistics: [
      { metric: "2x", label: "Learning Speed" },
      { metric: "50%", label: "Less Admin Work" },
      { metric: "90%", label: "Student Retention" }
    ]
  },
  segments: ["K-12", "Higher Ed", "Corporate Training", "EdTech SaaS", "Special Education"],
  challenges: [
    {
      title: "Personalized Learning",
      pain: "Standardized curriculum failing to meet individual student needs.",
      cost: "Low student engagement and poor outcomes",
      businessImpact: "Trust Erosion",
      priority: "Critical",
      category: "Customer",
      problems: ["Learning Gaps", "Boredom", "Lack of Accessibility", "One-size-fits-all"],
      solutions: ["AI Tutor Agent", "Adaptive Pathways", "Knowledge Graphs", "Real-Time Feedback"],
      outcomes: ["↑ Student Engagement", "↑ Test Scores", "↓ Dropout Rates"],
      techStack: ["OpenAI", "Neo4j", "Pinecone", "React"],
      aiAgent: "Student Agent",
      readiness: { implementation: "10 Weeks", complexity: "Medium", roi: "High" }
    },
    {
      title: "Administrative Burden",
      pain: "Educators overwhelmed with grading and paperwork.",
      cost: "High teacher burnout and turnover",
      businessImpact: "Operational Friction",
      priority: "High",
      category: "Operations",
      problems: ["Manual Grading", "Lesson Planning", "Email Overload", "Scheduling"],
      solutions: ["Teacher Copilot", "Automated Grading", "Generative Syllabi", "Smart Scheduling"],
      outcomes: ["↓ Admin Time", "↑ Face-to-Face Time", "↓ Teacher Burnout"],
      techStack: ["LangChain", "Anthropic", "PostgreSQL", "Next.js"],
      aiAgent: "Teacher Agent",
      readiness: { implementation: "8 Weeks", complexity: "Low", roi: "Very High" }
    },
    {
      title: "Student Success Tracking",
      pain: "Reactive interventions happening too late to save failing students.",
      cost: "High dropout rates and lost tuition",
      businessImpact: "Revenue Leakage",
      priority: "High",
      category: "Risk",
      problems: ["Delayed Reporting", "Data Silos", "Missed Warning Signs", "Poor Advising"],
      solutions: ["Predictive Analytics", "Early Warning System", "AI Advisors", "Sentiment Analysis"],
      outcomes: ["↑ Retention", "↑ Graduation Rates", "↑ Institutional ROI"],
      techStack: ["Databricks", "AWS", "TensorFlow", "Spark"],
      aiAgent: "Administration Agent",
      readiness: { implementation: "14 Weeks", complexity: "Medium", roi: "High" }
    }
  ],
  opportunityMatrix: [
    { name: "Research Assistant", description: "AI accelerating academic research synthesis.", roi: "High" }
  ],
  architecture: {
    nodes: [
      { id: "student", position: { x: 0, y: 150 }, data: { label: "Student", type: "client" } },
      { id: "lms", position: { x: 200, y: 150 }, data: { label: "LMS Gateway", type: "gateway", status: "Healthy" } },
      { id: "ai", position: { x: 400, y: 150 }, data: { label: "EdTech AI", type: "ai", status: "Active" } },
      { id: "kg", position: { x: 600, y: 150 }, data: { label: "Knowledge Graph", type: "database" } }
    ],
    edges: []
  },
  agents: [
    { name: "Student Agent", description: "Personalizes learning paths.", capabilities: ["Tutoring"] },
    { name: "Teacher Agent", description: "Automates grading and admin.", capabilities: ["Grading"] }
  ],
  erpIntegration: ["Student Information System (SIS)", "Finance"],
  techStack: [{ layer: "AI", technologies: ["LLMs", "Vector DBs"] }],
  outcomes: [],
  caseStudy: { client: "Global University", title: "AI Tutors", timeline: "6 Months", architecture: "EdTech AI", outcome: "Success", metric: "30%" },
  roadmap: [],
  compliance: [{ badge: "FERPA", description: "Family Educational Rights and Privacy Act" }],
  relatedProducts: [],
  relatedSolutions: [],
  resources: []
};
