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
  resources: [],

  seo: {
    title: "Education AI Solutions | AI for Universities, Schools & EdTech | CerebroHive",
    description: "CerebroHive deploys AI for education — personalized learning AI, student success prediction, administrative automation, learning management AI, and AI-powered research tools for universities and schools.",
    keywords: ["education AI solutions", "AI for universities", "personalized learning AI", "student success AI", "EdTech AI", "AI learning management", "higher education AI", "K-12 AI solutions", "AI tutoring systems"],
  },

  faqs: [
    { question: "How is AI being used in education?", answer: "Education AI applications span: personalized learning (AI adapts content difficulty, pacing, and format to each student's learning profile); student success prediction (AI identifies at-risk students early for proactive intervention); administrative automation (AI automates enrollment processing, advising scheduling, financial aid verification, and records management); research assistance (AI-powered literature search, data analysis tools for researchers); faculty support (AI helps with assessment design, grading assistance for large classes, curriculum mapping); and campus operations (AI-powered facilities management, energy optimization, campus security)." },
    { question: "What is AI-powered personalized learning?", answer: "Personalized learning AI adapts educational content and pacing to each learner: diagnostic assessment (AI determines each student's knowledge state and learning gaps); adaptive content selection (AI chooses the next learning resource based on demonstrated mastery and learning style); spaced repetition optimization (AI schedules practice reviews at optimal intervals for retention); real-time feedback (AI provides immediate, specific feedback on practice problems and writing); and learning analytics (AI identifies struggling students and generates instructor alerts for intervention). CerebroHive integrates personalized learning AI with LMS platforms (Canvas, Blackboard, Moodle)." },
    { question: "How does AI help predict and prevent student dropout?", answer: "Student success AI monitors signals that predict dropout or academic difficulty: attendance patterns, LMS engagement (logins, assignment completion rates, time spent on resources), grade trajectories, financial aid status changes, and comparison to historical dropout profiles. When risk scores exceed thresholds, AI triggers automated outreach (advisor notifications, proactive student communications, resource suggestions). Early intervention programs powered by AI typically show 15–25% improvement in retention rates for at-risk student populations." },
    { question: "What are the ethical concerns with AI in education?", answer: "Key ethical concerns in education AI: privacy of student data (FERPA in the US, GDPR in Europe require careful data governance); fairness (AI systems must not disadvantage students based on race, disability, language, or socioeconomic status); surveillance concerns (monitoring tools must be designed with appropriate consent and scope limitations); algorithmic transparency (students should understand when AI influences their educational experience); and academic integrity (detecting AI-generated work while maintaining appropriate nuance — not all AI-assisted work is misconduct). CerebroHive designs education AI with these concerns addressed in the architecture." },
    { question: "How does AI support faculty with assessment and grading?", answer: "AI supports faculty by: automated scoring of objective assessments (multiple choice, fill-in-the-blank, short structured answers); writing feedback at scale (AI provides formative feedback on essays for large classes where individual instructor feedback is impractical — human grade remains authoritative); rubric-aligned evaluation (AI maps student work to rubric criteria, flagging strong and weak areas for instructor review); plagiarism and AI detection (identifying suspected misconduct for instructor investigation); and assessment design assistance (AI suggests question formats, distractors, and difficulty calibration)." },
    { question: "How do universities use AI for research support?", answer: "University research AI applications: literature synthesis (RAG-powered search across academic databases, generating summaries of relevant papers); grant writing assistance (AI helps draft sections of grant proposals, check compliance with funding opportunity requirements); research data analysis (AI assists with statistical analysis, data visualization, and anomaly detection in research datasets); collaboration discovery (AI identifies potential research collaborators based on publication history and research interest alignment); and technology transfer (AI assists with patent claims drafting and prior art search for university IP)." },
    { question: "Can AI tutoring replace human teachers or tutors?", answer: "AI tutoring augments rather than replaces human educators. AI tutors excel at: on-demand availability (24/7 practice and question-answering without wait time); infinite patience (repeating explanations in multiple ways without frustration); consistent quality (every student gets the same quality of instruction for factual and procedural content); and data collection (building detailed models of individual student knowledge state). Human educators provide: motivational relationships, complex reasoning mentorship, creative and critical thinking development, and the social-emotional learning that AI cannot replicate. The most effective education AI programs use AI to handle structured practice and freeing teachers for higher-order pedagogical work." },
    { question: "What AI tools exist for academic libraries and research institutions?", answer: "Academic library AI applications: semantic search across collections (finding relevant materials by meaning, not just keyword); automated cataloging and metadata enrichment (AI categorizes and tags new acquisitions); citation analysis (AI identifies relationships between papers and research impact); reference assistance (AI-powered research consultation that helps patrons find relevant materials); digital preservation (AI monitors digitized collection quality and identifies deterioration); and collection development (AI analyzes usage patterns and research trends to inform acquisitions decisions)." },
    { question: "How does AI improve EdTech product development for companies?", answer: "EdTech AI product development: adaptive learning engine design (building the AI infrastructure that personalizes content delivery at scale); learning analytics platform (capturing and analyzing learner behavior data to surface insights for instructors and platform operators); natural language processing for education (question generation, answer evaluation, concept extraction from educational content); and AI-powered content authoring tools (helping course creators develop better content faster). CerebroHive builds AI infrastructure for EdTech companies launching or scaling AI-powered learning products." },
    { question: "What compliance requirements apply to education AI?", answer: "Education AI must comply with: FERPA (US Family Educational Rights and Privacy Act — restricting use of student education records and requiring parental/student consent for sharing); COPPA (Children's Online Privacy Protection Act — additional restrictions for students under 13); IDEA (Individuals with Disabilities Education Act — AI tools used in special education must support, not undermine, disability accommodations); state student privacy laws (many US states have additional requirements beyond FERPA); and institutional AI use policies (most universities are developing formal AI governance frameworks that cover vendor AI tools as well as institutionally developed AI)." },
  ],
};
