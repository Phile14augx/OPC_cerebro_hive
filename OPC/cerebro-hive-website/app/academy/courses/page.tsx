"use client";
import { useState, useEffect } from "react";
import { BookOpen, Search, Clock, Award, Star, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const categories = ["All", "AI Foundations", "AI Agents", "LLM Engineering", "AI Product Management"];

const courses = [
  {
    id: "ai-foundations",
    category: "AI Foundations",
    title: "Introduction to AI & Prompt Engineering",
    description: "Master foundational LLM behaviors, system prompts, few-shot prompting, and core generative AI tools for productivity.",
    instructor: "Liam Carter",
    duration: "8 hours",
    level: "Beginner",
    rating: 4.7,
    price: "$149",
    color: "#00E5FF",
  },
  {
    id: "multi-agent-langgraph",
    category: "AI Agents",
    title: "Building Multi-Agent Systems with LangGraph",
    description: "Deep dive into building stateful, cyclical multi-actor systems with memory management, human-in-the-loop triggers, and tools.",
    instructor: "Dr. Sarah Jenkins",
    duration: "18 hours",
    level: "Intermediate",
    rating: 4.9,
    price: "$349",
    color: "#7B61FF",
  },
  {
    id: "rag-systems",
    category: "LLM Engineering",
    title: "Enterprise RAG System Architecture",
    description: "Design production-grade Retrieval-Augmented Generation workflows. Cover PDF parsing, hybrid search, and vector ranking.",
    instructor: "Mark Zhao",
    duration: "24 hours",
    level: "Advanced",
    rating: 4.8,
    price: "$499",
    color: "#FF8A00",
  },
  {
    id: "ai-product-management",
    category: "AI Product Management",
    title: "AI Strategy & Product PM Roadmapping",
    description: "Learn how to assess corporate AI maturity, define ROI benchmarks, structure AI teams, and build board-approved project scopes.",
    instructor: "Elena Rostova",
    duration: "12 hours",
    level: "Intermediate",
    rating: 4.6,
    price: "$299",
    color: "#FF2ED1",
  }
];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [enrolledSlugs, setEnrolledSlugs] = useState<string[]>([]);
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage for immediate UI responsiveness
    const saved = localStorage.getItem("cerebro_enrolled_courses");
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEnrolledSlugs(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleEnroll = async (id: string, title: string) => {
    if (enrolledSlugs.includes(id)) return;
    const updated = [...enrolledSlugs, id];
    setEnrolledSlugs(updated);
    localStorage.setItem("cerebro_enrolled_courses", JSON.stringify(updated));

    // Sync to backend — use stored email or a guest placeholder
    const storedEmail = localStorage.getItem("cerebro_student_email") || "guest@cerebro-hive.com";
    try {
      await fetch("/api/academy/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: storedEmail, courseSlug: id })
      });
    } catch (err) {
      console.error("Failed to sync enrollment to API:", err);
    }

    // Trigger visual toast confirmation
    setShowToast(title);
    setTimeout(() => setShowToast(null), 3000);
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
                          course.description.toLowerCase().includes(search.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === "All" || course.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <>
      <section style={{ paddingTop: "140px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(123,97,255,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
                <BookOpen size={11} /> CerebroHive Academy
              </div>
              <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)", marginBottom: "20px" }}>
                Accelerate Your <span className="gradient-text-blue-violet">AI Skillset</span>
              </h1>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1.1rem", color: "var(--text-muted)", maxWidth: "600px", lineHeight: 1.7 }}>
                Project-based, engineering-led courses to build production AI systems, autonomous agents, and enterprise strategy.
              </p>
            </div>
            
            <Link href="/learn" className="btn-ghost" style={{ borderStyle: "dashed", display: "inline-flex", gap: "8px", alignItems: "center" }}>
              Go to Student Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "16px 20px" }}>
            <div style={{ position: "relative", maxWidth: "340px", width: "100%" }}>
              <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search courses, instructors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "100px", padding: "10px 16px 10px 42px", fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-primary)", outline: "none" }}
              />
            </div>

            <div style={{ display: "flex", gap: "6px", overflowX: "auto", maxWidth: "100%" }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    padding: "8px 16px",
                    background: selectedCat === cat ? "rgba(123,97,255,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selectedCat === cat ? "rgba(123,97,255,0.35)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "100px",
                    fontFamily: "Exo 2, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    color: selectedCat === cat ? "var(--violet)" : "var(--text-muted)",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="section-pad" style={{ paddingTop: "0px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
            {filteredCourses.map((course) => (
              <div key={course.id} className="card-glass" style={{ padding: "32px", display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <span style={{ fontSize: "0.65rem", fontFamily: "Orbitron, sans-serif", color: course.color, textTransform: "uppercase", letterSpacing: "0.05em", padding: "4px 12px", background: `${course.color}14`, border: `1px solid ${course.color}30`, borderRadius: "100px" }}>
                    {course.category}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#FFBA00" }}>
                    <Star size={13} fill="#FFBA00" />
                    <span style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.8rem", fontWeight: 700 }}>
                      {course.rating}
                    </span>
                  </div>
                </div>

                <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px", lineHeight: 1.35 }}>
                  {course.title}
                </h3>

                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px", flex: 1 }}>
                  {course.description}
                </p>

                {/* Meta details */}
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <Clock size={13} /> {course.duration}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <Award size={13} /> {course.level}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Instructor: <strong>{course.instructor}</strong>
                  </div>
                </div>

                {/* Bottom Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                  <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 900, color: "var(--text-primary)" }}>
                    {course.price}
                  </div>

                  {enrolledSlugs.includes(course.id) ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--neural-blue)", fontSize: "0.85rem", fontWeight: 600 }}>
                      <CheckCircle size={16} /> Enrolled
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id, course.title)}
                      className="btn-primary"
                      style={{ fontSize: "0.8rem", padding: "10px 24px" }}
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Enrollment Toast Notification */}
      {showToast && (
        <div style={{
          position: "fixed", bottom: "32px", left: "32px", zIndex: 10000,
          background: "rgba(8,11,20,0.95)", border: "1px solid var(--neural-blue)",
          borderRadius: "12px", padding: "16px 24px", display: "flex", alignItems: "center", gap: "12px",
          boxShadow: "0 10px 30px rgba(0, 229, 255, 0.25)",
          animation: "slideIn 0.3s ease-out",
        }}>
          <CheckCircle size={20} color="var(--neural-blue)" />
          <div>
            <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "var(--neural-blue)" }}>Enrollment Confirmed!</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>Enrolled in &quot;{showToast}&quot;</div>
          </div>
        </div>
      )}
    </>
  );
}
