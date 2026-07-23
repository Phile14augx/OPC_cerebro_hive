"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle, Sparkles, Play, CheckCircle2, Loader2,
  Mic, Globe, Users, BookOpen, Settings, Zap, Bot,
  ChevronRight, Plus, ArrowRight, Activity,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { StatCard } from "../../components/ui/StatCard";
import { useSearchParams, useRouter } from "next/navigation";
import { useForgeProject } from "@/lib/forge/hooks";

const channels = [
  { name: "Website Chat",   icon: Globe,         active: true  },
  { name: "WhatsApp",       icon: MessageCircle, active: true  },
  { name: "Slack",          icon: MessageCircle, active: false },
  { name: "Teams",          icon: MessageCircle, active: false },
  { name: "Discord",        icon: MessageCircle, active: false },
  { name: "Telegram",       icon: MessageCircle, active: false },
  { name: "Voice / Call",   icon: Mic,           active: false },
  { name: "Email",          icon: MessageCircle, active: false },
];

const bots = [
  { name: "Patient Support Bot",   channel: "Website + WhatsApp", sessions: 1248, satisfaction: "94%", status: "running" },
  { name: "Appointment Assistant", channel: "Website",            sessions: 892,  satisfaction: "91%", status: "running" },
  { name: "Pharmacy Helpdesk",     channel: "WhatsApp",           sessions: 344,  satisfaction: "88%", status: "idle" },
];

const botFeatures = [
  "Knowledge Base Integration", "RAG Pipeline", "Conversation Memory",
  "Human Escalation", "Multi-language Support", "Sentiment Analysis",
  "Tool Calling (Book Appointment)", "Analytics Dashboard",
];

export default function CerebroBotsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") ?? "";
  const { project } = useForgeProject(projectId);
  const [building, setBuilding] = useState(false);

  return (
    <div className="space-y-10">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle size={20} className="text-red-400" />
          <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-xs">CerebroBots</Badge>
          <Badge variant="secondary" className="text-xs">Phase 9</Badge>
          {project && <Badge variant="secondary" className="text-xs">{project.name}</Badge>}
        </div>
        <h1 className="text-3xl font-space font-bold text-text-primary">CerebroBots™</h1>
        <p className="text-text-secondary mt-1">
          AI builds conversational bots for any channel — website, WhatsApp, Slack, Teams, voice, and more.
          Includes RAG, memory, tool calling, and human handoff.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Active Bots"   value="3"     change="2 channels each"  icon={Bot}      trend="up" />
        <StatCard label="Sessions/Day"  value="2.4K"  change="+18% this week"   icon={Activity} trend="up" />
        <StatCard label="Satisfaction"    value="92%"   change="vs 78% human avg" icon={Zap}      trend="up" />
        <StatCard label="Escalations"   value="4.2%"  change="Low handoff rate" icon={Users}    trend="up" />
      </div>

      {/* Active Bots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Active Bots</h2>
          <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white font-bold h-8 text-xs">
            <Plus size={14} /> New Bot
          </Button>
        </div>
        <div className="space-y-3">
          {bots.map((bot, i) => (
            <Card key={i} className="p-5 hover:border-red-500/20 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <Bot size={18} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-primary text-sm">{bot.name}</h3>
                    <p className="text-xs text-text-muted">{bot.channel} · {bot.sessions} sessions</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-400">{bot.satisfaction}</p>
                    <p className="text-[10px] text-text-muted">satisfaction</p>
                  </div>
                  <Badge variant={bot.status === "running" ? "success" : "secondary"}>
                    {bot.status === "running" && <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1" />}
                    {bot.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                    Configure <ArrowRight size={10} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Channel Selector */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Deploy Channels</h2>
          <div className="grid grid-cols-2 gap-3">
            {channels.map((ch, i) => (
              <Card key={i} className={`p-3 flex items-center gap-3 cursor-pointer hover:border-red-500/20 transition-colors ${ch.active ? "border-red-500/20 bg-red-500/5" : ""}`}>
                <ch.icon size={16} className={ch.active ? "text-red-400" : "text-text-muted"} />
                <span className="text-sm font-medium text-text-primary">{ch.name}</span>
                {ch.active && <CheckCircle2 size={12} className="text-red-400 ml-auto shrink-0" />}
              </Card>
            ))}
          </div>
        </div>

        {/* Bot Features */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Built-in Capabilities</h2>
          <Card className="p-5 space-y-3">
            {botFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={14} className="text-red-400 shrink-0" />
                <span className="text-text-secondary">{f}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => { setBuilding(true); setTimeout(() => setBuilding(false), 3000); }}
          disabled={building}
          className="gap-2 bg-red-600 hover:bg-red-700 text-white font-bold"
        >
          {building ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {building ? "Building Bot..." : "Generate New Bot"}
        </Button>
        <Button variant="secondary" className="gap-2"><BookOpen size={14} /> Knowledge Base</Button>
        <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white font-bold" onClick={() => router.push(`/app/forge/testing?projectId=${projectId}`)}>
          <ChevronRight size={16} /> Proceed to Testing
        </Button>
      </div>
    </div>
  );
}
