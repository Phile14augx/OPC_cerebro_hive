"use client";
import { useState, useEffect } from "react";
import { Award, BookOpen, CheckCircle, Play, ExternalLink, Calendar, RefreshCw, X, ShieldCheck } from "lucide-react";
import Link from "next/link";

const allCourses = {
  "ai-foundations": {
    title: "Introduction to AI & Prompt Engineering",
    duration: "8 hours",
    instructor: "Liam Carter",
    color: "#00E5FF",
  },
  "multi-agent-langgraph": {
    title: "Building Multi-Agent Systems with LangGraph",
    duration: "18 hours",
    instructor: "Dr. Sarah Jenkins",
    color: "#7B61FF",
  },
  "rag-systems": {
    title: "Enterprise RAG System Architecture",
    duration: "24 hours",
    instructor: "Mark Zhao",
    color: "#FF8A00",
  },
  "ai-product-management": {
    title: "AI Strategy & Product PM Roadmapping",
    duration: "12 hours",
    instructor: "Elena Rostova",
    color: "#FF2ED1",
  }
};

interface UserCourse {
  id: string;
  title: string;
  duration: string;
  instructor: string;
  color: string;
  progress: number;
  completed: boolean;
}

export default function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState<UserCourse[]>([]);
  const [activeCertificate, setActiveCertificate] = useState<UserCourse | null>(null);

  useEffect(() => {
    async function loadEnrollments() {
      let slugs: string[] = ["ai-foundations"]; // Seed with default course

      // Load from localStorage first for fast UI
      const saved = localStorage.getItem("cerebro_enrolled_courses");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            slugs = parsed;
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        localStorage.setItem("cerebro_enrolled_courses", JSON.stringify(slugs));
      }

      // Also fetch from API to sync cross-device enrollments
      try {
        const storedEmail = localStorage.getItem("cerebro_student_email") || "guest@cerebro-hive.com";
        const res = await fetch(`/api/academy/enroll?email=${encodeURIComponent(storedEmail)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.courseSlugs && data.courseSlugs.length > 0) {
            // Merge API slugs with local slugs (deduplicated)
            const merged = Array.from(new Set([...slugs, ...data.courseSlugs]));
            slugs = merged;
            localStorage.setItem("cerebro_enrolled_courses", JSON.stringify(merged));
          }
        }
      } catch (err) {
        console.error("Failed to fetch enrollments from API:", err);
      }

      // Map course data and mock progress
      const mapped: UserCourse[] = slugs.map((slug) => {
        const courseDetails = allCourses[slug as keyof typeof allCourses];
        if (!courseDetails) return null;
        // Mock progress based on slug
        let progress = 35;
        if (slug === "ai-foundations") progress = 100;
        else if (slug === "multi-agent-langgraph") progress = 65;
        else if (slug === "rag-systems") progress = 15;

        return {
          id: slug,
          ...courseDetails,
          progress,
          completed: progress === 100,
        };
      }).filter(Boolean) as UserCourse[];

      setEnrolledCourses(mapped);
    }
    loadEnrollments();
  }, []);

  const handleReset = () => {
    localStorage.removeItem("cerebro_enrolled_courses");
    window.location.reload();
  };

  return (
    <>
      <section style={{ paddingTop: "60px", paddingBottom: "50px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(123,97,255,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div className="container-wide" style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <div className="section-label" style={{ display: "inline-flex", marginBottom: "20px" }}>
                Student Dashboard
              </div>
              <h1 style={{ fontSize: "clamp(2.3rem, 5vw, 3.2rem)", marginBottom: "16px" }}>
                Welcome Back, <span className="gradient-text-blue-violet">Student</span>
              </h1>
              <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "1rem", color: "var(--text-muted)", maxWidth: "520px" }}>
                Track your active courses, download verified completion certificates, and continue building production AI agents.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="btn-ghost"
              style={{ fontSize: "0.75rem", padding: "8px 16px", display: "inline-flex", alignItems: "center", gap: "6px", opacity: 0.6 }}
            >
              <RefreshCw size={12} /> Reset Enrollment State
            </button>
          </div>
        </div>
      </section>

      {/* Overview Stats */}
      <section style={{ paddingBottom: "40px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
            {[
              { label: "Active Courses", value: enrolledCourses.filter((c) => !c.completed).length, icon: Play, color: "#00E5FF" },
              { label: "Completed Courses", value: enrolledCourses.filter((c) => c.completed).length, icon: CheckCircle, color: "#7B61FF" },
              { label: "Learning Streak", value: "12 Days", icon: Calendar, color: "#FF8A00" },
              { label: "Certifications", value: enrolledCourses.filter((c) => c.completed).length, icon: Award, color: "#FF2ED1" }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="card-glass" style={{ padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "10px", background: `${stat.color}14`, border: `1px solid ${stat.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={20} color={stat.color} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>{stat.value}</div>
                    <div style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Courses List */}
      <section className="section-pad" style={{ paddingTop: "0px" }}>
        <div className="container-wide">
          <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "32px", alignItems: "start" }}>
            {/* Left: Active/Completed Courses */}
            <div>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "24px" }}>
                Your Courses
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="card-glass" style={{ padding: "28px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
                      <div>
                        <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {course.title}
                        </h3>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          Instructor: <strong>{course.instructor}</strong> • {course.duration}
                        </div>
                      </div>

                      {course.completed ? (
                        <button
                          onClick={() => setActiveCertificate(course)}
                          className="btn-primary"
                          style={{
                            fontSize: "0.75rem", padding: "8px 18px",
                            background: "linear-gradient(135deg, var(--neural-blue), var(--violet))"
                          }}
                        >
                          <Award size={14} /> View Certificate
                        </button>
                      ) : (
                        <a
                          href="/academy/courses"
                          className="btn-ghost"
                          style={{ fontSize: "0.75rem", padding: "8px 18px", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
                        >
                          <Play size={12} /> Resume Course
                        </a>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                        <span>Course Progress</span>
                        <span>{course.progress}% Complete</span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${course.progress}%`, height: "100%", background: `linear-gradient(90deg, ${course.color}, var(--violet))`, borderRadius: "4px" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Recommended Learning Tracks */}
            <div>
              <h2 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 700, marginBottom: "24px" }}>
                Recommended Tracks
              </h2>

              <div className="card-glass" style={{ padding: "32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <BookOpen size={18} color="var(--neural-blue)" />
                  <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.95rem", fontWeight: 700, color: "var(--neural-blue)" }}>
                    AI Engineer Learning Path
                  </h3>
                </div>
                <p style={{ fontFamily: "Exo 2, sans-serif", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                  Follow our structured track to master end-to-end AI engineering. Recommended for students seeking professional certification.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                  {[
                    "Introduction to AI & Prompt Engineering (100% Complete)",
                    "Enterprise RAG System Architecture (15% Complete)",
                    "Building Multi-Agent Systems with LangGraph (Not Started)"
                  ].map((step, index) => (
                    <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: index === 0 ? "rgba(0,229,255,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${index === 0 ? "var(--neural-blue)" : "rgba(255,255,255,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, color: "var(--neural-blue)", flexShrink: 0 }}>
                        {index + 1}
                      </div>
                      <span style={{ color: index === 0 ? "var(--text-primary)" : "var(--text-muted)" }}>{step}</span>
                    </div>
                  ))}
                </div>

                <Link href="/academy/learning-paths" className="btn-primary" style={{ width: "100%", justifyContent: "center", display: "inline-flex", gap: "6px", fontSize: "0.8rem" }}>
                  View All Paths <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certificate Modal */}
      {activeCertificate && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10000,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(8, 11, 20, 0.85)", backdropFilter: "blur(8px)",
          padding: "20px",
        }}>
          <div className="card-glass" style={{
            maxWidth: "600px", width: "100%", padding: "48px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.7), 0 0 40px rgba(0, 229, 255, 0.2)",
            border: "2px solid rgba(0, 229, 255, 0.35)",
            position: "relative",
            background: "radial-gradient(circle at 50% 50%, rgba(13,18,33,0.95) 0%, rgba(8,11,20,0.95) 100%)",
            borderRadius: "24px",
            animation: "fadeIn 0.25s ease-out",
          }}>
            <button
              onClick={() => setActiveCertificate(null)}
              style={{
                position: "absolute", top: "24px", right: "24px",
                background: "transparent", border: "none", color: "var(--text-muted)",
                cursor: "pointer", padding: "4px",
              }}
            >
              <X size={22} />
            </button>

            {/* Certificate Border decoration */}
            <div style={{ border: "1px solid rgba(0, 229, 255, 0.15)", borderRadius: "12px", padding: "36px", textAlign: "center" }}>
              <ShieldCheck size={44} color="var(--neural-blue)" style={{ margin: "0 auto 16px" }} />
              
              <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "16px" }}>
                Certificate of Graduation
              </div>

              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif" }}>
                This is to certify that the student has successfully completed the course
              </div>

              <h3 style={{ fontFamily: "Orbitron, sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "var(--neural-blue)", margin: "18px 0", lineHeight: 1.3 }}>
                {activeCertificate.title}
              </h3>

              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "Exo 2, sans-serif", marginBottom: "28px" }}>
                Under the instruction of <strong>{activeCertificate.instructor}</strong> • CerebroHive Academy
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px" }}>
                {/* Signatures */}
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "0.95rem", color: "var(--text-primary)", fontStyle: "italic" }}>Liam Carter</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Dean of Academy</div>
                </div>

                {/* QR Code Verification Mock */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "8px 12px", borderRadius: "8px" }}>
                  <div style={{ fontSize: "24px", opacity: 0.6 }}>🔲</div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: "0.55rem", fontWeight: 700, color: "var(--neural-blue)" }}>VERIFIED CERTIFICATE</div>
                    <div style={{ fontSize: "0.5rem", color: "var(--text-muted)", marginTop: "2px" }}>ID: CH-{(activeCertificate.id + "12345").toUpperCase().slice(0, 10)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
