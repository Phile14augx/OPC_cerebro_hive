"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api-client";
import { useState } from "react";
import type { Enrollment, Course } from "@/lib/api-client";

// ── Dashboard layout ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { isAuthenticated, isLoading, user, logout, getToken } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/?login=required");
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch dashboard data
  useEffect(() => {
    if (!isAuthenticated) return;

    const load = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const page = await api.academy.listEnrollments({ token });
        setEnrollments(page.content ?? []);
      } catch {
        // silently fail — user may not have enrollments yet
      } finally {
        setDataLoading(false);
      }
    };

    load();
  }, [isAuthenticated, getToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const activeEnrollments = enrollments.filter(e => e.status === "ACTIVE");
  const completedEnrollments = enrollments.filter(e => e.status === "COMPLETED");

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-space font-bold text-text-primary">
              Welcome back, {user?.given_name ?? user?.name?.split(" ")[0] ?? "there"}
            </h1>
            <p className="text-text-secondary text-sm mt-1">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors border border-border rounded-lg px-4 py-2"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Courses", value: activeEnrollments.length },
            { label: "Completed", value: completedEnrollments.length },
            { label: "Certificates", value: completedEnrollments.length },
            { label: "Org Role", value: user?.org_role ?? "Member" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface border border-border rounded-xl p-5">
              <p className="text-text-secondary text-xs font-mono uppercase tracking-widest">{label}</p>
              <p className="text-2xl font-space font-bold text-text-primary mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* Active Enrollments */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-space font-semibold text-text-primary">In Progress</h2>
            <Link href="/academy/courses" className="text-sm text-primary-accent hover:underline">
              Browse courses →
            </Link>
          </div>

          {dataLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="bg-surface border border-border rounded-xl p-5 animate-pulse h-20" />
              ))}
            </div>
          ) : activeEnrollments.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-8 text-center">
              <p className="text-text-secondary mb-4">You haven't enrolled in any courses yet.</p>
              <Link
                href="/academy/courses"
                className="inline-flex items-center gap-2 bg-primary-accent text-black font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Explore Academy
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeEnrollments.map(e => (
                <div key={e.id} className="bg-surface border border-border rounded-xl p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{e.courseName}</p>
                    <div className="mt-2 bg-background rounded-full h-1.5 w-48">
                      <div
                        className="bg-primary-accent h-1.5 rounded-full transition-all"
                        style={{ width: `${e.progressPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{e.progressPct}% complete</p>
                  </div>
                  <span className="text-xs font-mono text-text-secondary border border-border rounded px-2 py-1 shrink-0">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick links */}
        <section>
          <h2 className="text-lg font-space font-semibold text-text-primary mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: "/platform", label: "Platform Catalog", icon: "⬡" },
              { href: "/academy/learning-paths", label: "Learning Paths", icon: "🎯" },
              { href: "/academy/certificates", label: "My Certificates", icon: "🏆" },
              { href: "/contact", label: "Talk to Sales", icon: "💬" },
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="bg-surface border border-border rounded-xl p-5 hover:border-primary-accent/50 transition-colors group"
              >
                <span className="text-2xl">{icon}</span>
                <p className="text-sm font-medium text-text-primary mt-2 group-hover:text-primary-accent transition-colors">
                  {label}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
