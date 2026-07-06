"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Users, Award, BookOpen, UserPlus, Trash2, LineChart, CheckCircle2 } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  score: number;
  certified: boolean;
  lastActive: string;
}

const INITIAL_EMPLOYEES: Employee[] = [
  { id: "EMP-101", name: "Sarah Connor", email: "sconnor@apex.com", course: "Building AI Agents with LangChain", progress: 100, score: 92, certified: true, lastActive: "June 14, 2026" },
  { id: "EMP-102", name: "John Connor", email: "jconnor@apex.com", course: "Building AI Agents with LangChain", progress: 85, score: 88, certified: false, lastActive: "June 14, 2026" },
  { id: "EMP-103", name: "Miles Dyson", email: "mdyson@apex.com", course: "LLM Engineering & RAG Architecture", progress: 60, score: 75, certified: false, lastActive: "June 12, 2026" },
  { id: "EMP-104", name: "Peter Silberman", email: "psilberman@apex.com", course: "Introduction to AI & Prompt Design", progress: 100, score: 95, certified: true, lastActive: "June 08, 2026" },
  { id: "EMP-105", name: "Marcus Wright", email: "mwright@apex.com", course: "LLM Engineering & RAG Architecture", progress: 45, score: 70, certified: false, lastActive: "June 13, 2026" }
];

export default function EnterpriseDashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCourse, setInviteCourse] = useState("Building AI Agents with LangChain");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const totalSeats = 20;
  const activeSeats = employees.length;
  const remainingSeats = totalSeats - activeSeats;

  // Fetch from database on mount
  useEffect(() => {
    async function loadEmployees() {
      try {
        const res = await fetch("/api/enterprise/employees");
        if (res.ok) {
          const data = await res.json();
          if (data.employees) setEmployees(data.employees);
        }
      } catch (err) {
        console.error("Failed to fetch employees from API:", err);
      }
    }
    loadEmployees();
  }, []);

  // Calculate Average Metrics
  const avgProgress = employees.length > 0 ? Math.round(employees.reduce((acc, curr) => acc + curr.progress, 0) / employees.length) : 0;
  const avgScore = employees.length > 0 ? Math.round(employees.reduce((acc, curr) => acc + curr.score, 0) / employees.length) : 0;
  const certifiedCount = employees.filter((emp) => emp.certified).length;

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || remainingSeats <= 0) return;

    try {
      const res = await fetch("/api/enterprise/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inviteName, email: inviteEmail, course: inviteCourse })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.employee) {
          setEmployees(prev => [...prev, data.employee]);
        }
        setInviteName("");
        setInviteEmail("");
        setInviteSuccess(true);
        setTimeout(() => setInviteSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to submit invite to API:", err);
    }
  };

  const handleRevokeSeat = async (empId: string) => {
    try {
      const res = await fetch(`/api/enterprise/employees?id=${empId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setEmployees(prev => prev.filter((emp) => emp.id !== empId));
      }
    } catch (err) {
      console.error("Failed to revoke employee seat from API:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-[#F5F7FA] pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7B61FF]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Corporate Administration
            </div>
            <h1 className="text-3xl font-bold font-display text-white">
              Apex Software Labs
            </h1>
            <p className="text-sm text-[#8892A4] mt-1 font-body">
              Enterprise training contract: <strong className="text-white">COHORT-APEX-2026</strong>
            </p>
          </div>
          <div className="flex gap-4 bg-white/2 border border-white/5 rounded-xl px-5 py-3 text-sm">
            <div>
              <span className="text-xs text-[#8892A4] block uppercase">Class Room Seats</span>
              <strong className="text-white text-base">{activeSeats} / {totalSeats} Used</strong>
            </div>
            <div className="border-l border-white/5 pl-4">
              <span className="text-xs text-[#8892A4] block uppercase">Verification Status</span>
              <strong className="text-amber-500 text-base flex items-center gap-1">50+ Certified <Award className="w-4 h-4 text-amber-500" /></strong>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="bg-[#0D1325]/60 backdrop-blur-md rounded-xl border border-white/5 p-6 flex items-center gap-4 shadow-md">
            <div className="w-10 h-10 rounded-lg bg-[#00E5FF]/10 flex items-center justify-center text-[#00E5FF] flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#8892A4] block uppercase leading-tight">Active Seats</span>
              <strong className="text-white text-xl font-display mt-0.5 block">{activeSeats} Developers</strong>
            </div>
          </div>

          <div className="bg-[#0D1325]/60 backdrop-blur-md rounded-xl border border-white/5 p-6 flex items-center gap-4 shadow-md">
            <div className="w-10 h-10 rounded-lg bg-[#7B61FF]/10 flex items-center justify-center text-[#7B61FF] flex-shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#8892A4] block uppercase leading-tight">Avg Progress</span>
              <strong className="text-white text-xl font-display mt-0.5 block">{avgProgress}% Complete</strong>
            </div>
          </div>

          <div className="bg-[#0D1325]/60 backdrop-blur-md rounded-xl border border-white/5 p-6 flex items-center gap-4 shadow-md">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#8892A4] block uppercase leading-tight">Certificates Unlocked</span>
              <strong className="text-white text-xl font-display mt-0.5 block">{certifiedCount} Certified</strong>
            </div>
          </div>

          <div className="bg-[#0D1325]/60 backdrop-blur-md rounded-xl border border-white/5 p-6 flex items-center gap-4 shadow-md">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-[#8892A4] block uppercase leading-tight">Avg Test Score</span>
              <strong className="text-white text-xl font-display mt-0.5 block">{avgScore}% Accuracy</strong>
            </div>
          </div>
        </div>

        {/* Dashboard Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left panel: Employee Progress Table */}
          <div className="lg:col-span-2 space-y-8 bg-[#0D1325]/60 backdrop-blur-md rounded-2xl border border-white/5 p-8 sm:p-10 shadow-xl">
            <div>
              <h3 className="text-lg font-bold font-display text-white">Cohort Enrollment & Progress</h3>
              <p className="text-sm text-[#8892A4] mt-0.5">Real-time completion metrics for team training cohorts.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-[#8892A4] font-bold text-xs uppercase tracking-wider">
                    <th className="pb-3 pr-4">Developer</th>
                    <th className="pb-3 pr-4">Active Course</th>
                    <th className="pb-3 pr-4">Progress</th>
                    <th className="pb-3 pr-4">Exam Score</th>
                    <th className="pb-3 text-right">Revoke</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 pr-4">
                        <strong className="text-white block">{emp.name}</strong>
                        <span className="text-xs text-[#8892A4] block mt-0.5">{emp.email}</span>
                      </td>
                      <td className="py-4 pr-4 text-xs text-[#8892A4] max-w-[150px] truncate">{emp.course}</td>
                      <td className="py-4 pr-4 min-w-[100px]">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#7B61FF]" style={{ width: `${emp.progress}%` }} />
                          </div>
                          <span className="text-xs font-bold text-white">{emp.progress}%</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        {emp.certified ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 w-max">
                            <CheckCircle2 className="w-3 h-3" /> {emp.score}%
                          </span>
                        ) : emp.progress === 0 ? (
                          <span className="text-[#8892A4] text-xs">Pending</span>
                        ) : (
                          <span className="text-white font-semibold text-xs">{emp.score}%</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleRevokeSeat(emp.id)}
                          className="text-[#8892A4] hover:text-red-400 transition-all cursor-pointer p-1.5 rounded hover:bg-white/5"
                        >
                          <Trash2 className="w-4 h-4 ml-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right panel: Invite new members & SVG analytics */}
          <div className="space-y-10">
            {/* Invite Panel */}
            <div className="bg-[#0D1325]/60 backdrop-blur-md rounded-2xl border border-white/5 p-8 shadow-xl">
              <h3 className="text-base font-bold font-display text-white mb-6 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#00E5FF]" /> Invite Cohort Seat
              </h3>

              <form onSubmit={handleInviteUser} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8892A4] mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Marcus Dyson"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-[#00E5FF]/40 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/40 animate-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8892A4] mb-2">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="marcus@apex.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-[#00E5FF]/40 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/40 animate-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8892A4] mb-2">Enrolled Course</label>
                  <select
                    value={inviteCourse}
                    onChange={(e) => setInviteCourse(e.target.value)}
                    className="w-full bg-[#080B14] border border-white/5 focus:border-[#00E5FF]/40 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/40 cursor-pointer"
                  >
                    <option value="Building AI Agents with LangChain">Building AI Agents with LangChain</option>
                    <option value="LLM Engineering & RAG Architecture">LLM Engineering & RAG Architecture</option>
                    <option value="Introduction to AI & Prompt Design">Introduction to AI & Prompt Design</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={remainingSeats <= 0}
                  className="w-full mt-6 py-2.5 bg-[#00E5FF] text-black font-bold rounded-lg text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.15)]"
                >
                  Allocate Seat ({remainingSeats} Left)
                </button>
              </form>

              {inviteSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3.5 py-2 rounded-lg mt-3 flex items-center gap-1.5 animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Invitation sent! Cohort Seat allocated.
                </div>
              )}
            </div>

            {/* Custom SVG Learning Chart */}
            <div className="bg-[#0D1325]/60 backdrop-blur-md rounded-2xl border border-white/5 p-8 shadow-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8892A4] block mb-6">Active Weekly Study Hours</span>
              <div className="flex justify-center">
                <svg viewBox="0 0 200 100" className="w-full max-w-[180px] h-auto">
                  {/* Columns bars */}
                  {[
                    { label: "W1", height: 40 },
                    { label: "W2", height: 65 },
                    { label: "W3", height: 50 },
                    { label: "W4", height: 80 }
                  ].map((bar, idx) => {
                    const x = 30 + idx * 45;
                    const y = 80 - bar.height;
                    return (
                      <g key={idx}>
                        <rect
                          x={x}
                          y={y}
                          width="18"
                          height={bar.height}
                          fill="url(#barGrad)"
                          rx="3"
                          className="hover:opacity-85 transition-opacity"
                        />
                        <text x={x + 9} y="94" fill="#8892A4" fontSize="7" textAnchor="middle" className="font-semibold font-display">
                          {bar.label}
                        </text>
                      </g>
                    );
                  })}
                  <line x1="10" y1="80" x2="190" y2="80" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                  <defs>
                    <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00E5FF" />
                      <stop offset="100%" stopColor="#7B61FF" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
