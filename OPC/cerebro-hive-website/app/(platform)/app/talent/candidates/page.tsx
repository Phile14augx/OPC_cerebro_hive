"use client";

import React from "react";
import { Search, Filter, Users, Download, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/ui/Table";
import { cn } from "@/lib/utils";

export default function CandidatesGrid() {
  const candidates = [
    { name: "Sarah Jenkins", email: "sarah.j@example.com", role: "Senior Backend Eng", score: 92, coding: 95, arch: 88, ai: 91, status: "Review" },
    { name: "Michael Chang", email: "m.chang@example.com", role: "AI Solutions Architect", score: 88, coding: 80, arch: 94, ai: 95, status: "Evaluating" },
    { name: "Elena Rodriguez", email: "elena.r@example.com", role: "Frontend Developer", score: 95, coding: 98, arch: 82, ai: 85, status: "Offer" },
    { name: "David Kim", email: "dkim99@example.com", role: "Data Engineer", score: 74, coding: 85, arch: 70, ai: 65, status: "Rejected" },
    { name: "Jessica Lee", email: "j.lee@example.com", role: "DevOps Engineer", score: 89, coding: 82, arch: 91, ai: 85, status: "Review" },
    { name: "Marcus Johnson", email: "marcus.j@example.com", role: "Full Stack Eng", score: 81, coding: 84, arch: 78, ai: 80, status: "Evaluating" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-space font-bold text-text-primary">Candidates</h1>
          <p className="text-text-secondary mt-1">View and analyze all candidate assessment results.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2"><Download size={16} /> Export CSV</Button>
          <Button className="gap-2"><Users size={16} /> Invite Candidates</Button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search candidates by name, email, or role..." 
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary focus:outline-none focus:border-primary-accent transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="gap-2"><Filter size={16} /> Status</Button>
          <Button variant="secondary" className="gap-2"><Filter size={16} /> Role</Button>
          <Button variant="secondary" className="gap-2"><Filter size={16} /> Score &gt; 80</Button>
        </div>
      </div>

      {/* Data Grid */}
      <Card className="overflow-hidden p-0 border border-border shadow-sm">
        <Table>
          <TableHeader className="bg-surface">
            <TableRow>
              <TableHead className="w-[30%] font-bold text-text-muted uppercase text-xs tracking-wider">Candidate</TableHead>
              <TableHead className="font-bold text-text-muted uppercase text-xs tracking-wider">Role Applied</TableHead>
              <TableHead className="font-bold text-text-muted uppercase text-xs tracking-wider text-center">AI Score</TableHead>
              <TableHead className="font-bold text-text-muted uppercase text-xs tracking-wider text-center">Coding</TableHead>
              <TableHead className="font-bold text-text-muted uppercase text-xs tracking-wider text-center">Arch</TableHead>
              <TableHead className="font-bold text-text-muted uppercase text-xs tracking-wider text-center">Prompting</TableHead>
              <TableHead className="font-bold text-text-muted uppercase text-xs tracking-wider text-right">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate, i) => (
              <TableRow key={i} className="group hover:bg-surface/50 transition-colors cursor-pointer">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-surface-elevated border border-border flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold">{candidate.name.charAt(0)}</span>
                    </div>
                    <div>
                      <Link href={`/app/talent/candidates/${candidate.name.toLowerCase().replace(' ', '-')}`} className="font-bold text-text-primary text-sm hover:text-primary-accent transition-colors">
                        {candidate.name}
                      </Link>
                      <p className="text-xs text-text-secondary mt-0.5">{candidate.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-text-primary">{candidate.role}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={cn(
                    "font-bold text-base",
                    candidate.score >= 90 ? "text-green-400" : candidate.score >= 80 ? "text-blue-400" : candidate.score >= 70 ? "text-yellow-400" : "text-red-400"
                  )}>{candidate.score}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm text-text-secondary">{candidate.coding}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm text-text-secondary">{candidate.arch}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-sm text-text-secondary">{candidate.ai}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={
                    candidate.status === 'Offer' ? 'success' : 
                    candidate.status === 'Review' ? 'secondary' : 
                    candidate.status === 'Rejected' ? 'destructive' : 'warning'
                  }>
                    {candidate.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/app/talent/candidates/${candidate.name.toLowerCase().replace(' ', '-')}`} className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:bg-surface-elevated hover:text-primary-accent transition-colors">
                    <ArrowUpRight size={16} />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
