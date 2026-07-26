"use client";

/**
 * TopBar — platform app shell header.
 *
 * All dropdown/panel overlays render OUTSIDE the <header> element so they
 * are never clipped by its fixed height. They use fixed positioning anchored
 * to top-14 (= 56 px, the header height).
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  BarChart2,
  Bell,
  BookOpen,
  Bot,
  Building2,
  Check,
  ChevronDown,
  Command,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Search,
  Send,
  Settings,
  Shield,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Panel = "workspace" | "palette" | "assistant" | "notifications" | "user" | null;

// ─── Data ──────────────────────────────────────────────────────────────────────

const PLATFORM_LINKS = [
  { label: "Platform overview",  href: "/platform",            icon: LayoutDashboard, group: "Navigate" },
  { label: "HiveAgents™",        href: "/platform/agents",     icon: Bot,             group: "Navigate" },
  { label: "HiveAutomation™",    href: "/platform/automation", icon: Zap,             group: "Navigate" },
  { label: "HiveForge™",         href: "/platform/forge",      icon: Command,         group: "Navigate" },
  { label: "HiveKnowledge™",     href: "/platform/knowledge",  icon: BookOpen,        group: "Navigate" },
  { label: "HiveAnalytics™",     href: "/platform/analytics",  icon: BarChart2,       group: "Navigate" },
  { label: "HiveGovern™",        href: "/platform/govern",     icon: Shield,          group: "Navigate" },
  { label: "CerebroArchive™",    href: "/platform/archive",    icon: BookOpen,        group: "Navigate" },
  { label: "Dashboard",          href: "/dashboard",           icon: LayoutDashboard, group: "Navigate" },
  { label: "Profile settings",   href: "/dashboard",           icon: User,            group: "Actions"  },
  { label: "Documentation",      href: "/platform",            icon: ExternalLink,    group: "Actions"  },
  { label: "Contact support",    href: "/contact",             icon: ExternalLink,    group: "Actions"  },
];

const WORKSPACES = [
  { id: "prod", name: "CerebroHive Production", role: "Owner" },
  { id: "dev",  name: "Dev Sandbox",            role: "Admin" },
  { id: "demo", name: "Demo Workspace",          role: "Viewer" },
];

type Notification = {
  id: string;
  title: string;
  body: string;
  ts: string;
  read: boolean;
  type: "info" | "success" | "warning";
};

const SEED_NOTIFICATIONS: Notification[] = [
  { id: "1", title: "HiveSwarm run completed",  body: "Goal 'Build REST API' finished in 3 waves — 4 tasks.", ts: "2m ago",  read: false, type: "success" },
  { id: "2", title: "Agent registered",          body: "OrchestratorAgent v0.1.0 joined the swarm.",            ts: "14m ago", read: false, type: "info"    },
  { id: "3", title: "Evaluation threshold",      body: "CriticAgent quality score dropped below 0.70.",          ts: "1h ago",  read: true,  type: "warning" },
  { id: "4", title: "HiveForge sandbox run",     body: "Financial Analyst template executed successfully.",       ts: "3h ago",  read: true,  type: "success" },
];

const STARTER_QUESTIONS = [
  "What agents are currently active?",
  "Show me the latest HiveSwarm run status",
  "How do I submit a new swarm goal?",
];

// ─── Shared backdrop ────────────────────────────────────────────────────────────

function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40"
      onClick={onClick}
      aria-hidden
    />
  );
}

// ─── Workspace dropdown ─────────────────────────────────────────────────────────
// Anchored: fixed top-14 left-4

function WorkspaceDropdown({ onClose }: { onClose: () => void }) {
  const [active, setActive] = useState("prod");
  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="fixed top-14 left-4 w-72 rounded-xl border border-white/10 bg-[#0A0D14] shadow-2xl z-50 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Workspaces</p>
        </div>
        {WORKSPACES.map((ws) => (
          <button
            key={ws.id}
            onClick={() => setActive(ws.id)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Building2 size={14} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{ws.name}</p>
                <p className="text-xs text-slate-500">{ws.role}</p>
              </div>
            </div>
            {active === ws.id && <Check size={14} className="text-emerald-400 shrink-0" />}
          </button>
        ))}
        <div className="border-t border-white/10 px-4 py-3 space-y-1">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-1">
            <Settings size={14} /> Workspace settings
          </Link>
          <Link href="/platform" onClick={onClose} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-1">
            <LayoutDashboard size={14} /> Platform overview
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── Command palette ─────────────────────────────────────────────────────────────
// Centered fixed modal

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = PLATFORM_LINKS.filter(
    (l) => !query || l.label.toLowerCase().includes(query.toLowerCase()) || l.group.toLowerCase().includes(query.toLowerCase())
  );
  const groups = filtered.reduce<Record<string, typeof PLATFORM_LINKS>>((acc, l) => {
    acc[l.group] = acc[l.group] ?? [];
    acc[l.group].push(l);
    return acc;
  }, {});

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && filtered[cursor]) { router.push(filtered[cursor].href); onClose(); }
    if (e.key === "Escape") onClose();
  };

  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="fixed inset-x-0 top-24 mx-auto max-w-xl px-4 z-50">
        <div className="rounded-2xl border border-white/10 bg-[#0A0D14] shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <Search size={16} className="text-slate-500 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
              onKeyDown={onKey}
              placeholder="Search platform, navigate, or run a command…"
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
            />
            <kbd className="px-1.5 py-0.5 rounded border border-white/10 text-[10px] text-slate-500 font-mono">ESC</kbd>
          </div>
          <div className="max-h-80 overflow-y-auto py-2">
            {filtered.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No results for &ldquo;{query}&rdquo;</p>
            )}
            {Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-600">{group}</p>
                {items.map((item) => {
                  const idx = filtered.indexOf(item);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      onClick={onClose}
                      onMouseEnter={() => setCursor(idx)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        idx === cursor ? "bg-emerald-500/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon size={14} className={idx === cursor ? "text-emerald-400" : "text-slate-500"} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 px-4 py-2 flex items-center gap-4 text-[10px] text-slate-600">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
            <span><kbd className="font-mono">ESC</kbd> close</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Notifications panel ────────────────────────────────────────────────────────
// Anchored: fixed top-14 right-14 (right of avatar, left of edge)

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const [notes, setNotes] = useState<Notification[]>(SEED_NOTIFICATIONS);
  const unread = notes.filter((n) => !n.read).length;
  const dotColor = { info: "bg-blue-400", success: "bg-emerald-400", warning: "bg-yellow-400" } as const;

  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="fixed top-14 right-14 w-80 rounded-xl border border-white/10 bg-[#0A0D14] shadow-2xl z-50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white">Notifications</p>
            {unread > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">{unread}</span>
            )}
          </div>
          <button
            onClick={() => setNotes((n) => n.map((x) => ({ ...x, read: true })))}
            className="text-[10px] text-slate-500 hover:text-white transition-colors"
          >
            Mark all read
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
          {notes.map((n) => (
            <button
              key={n.id}
              onClick={() => setNotes((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${n.read ? "opacity-50" : ""}`}
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColor[n.type]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{n.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-slate-600 mt-1">{n.ts}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="border-t border-white/10 px-4 py-2.5">
          <Link href="/dashboard" onClick={onClose} className="text-xs text-slate-400 hover:text-white transition-colors">
            View all notifications →
          </Link>
        </div>
      </div>
    </>
  );
}

// ─── User menu ──────────────────────────────────────────────────────────────────
// Anchored: fixed top-14 right-2

function UserMenu({ onClose }: { onClose: () => void }) {
  const { user, logout } = useAuth();
  const name  = user?.given_name ?? user?.name ?? "User";
  const email = user?.email ?? "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="fixed top-14 right-2 w-60 rounded-xl border border-white/10 bg-[#0A0D14] shadow-2xl z-50 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{name}</p>
              {email && <p className="text-xs text-slate-500 truncate">{email}</p>}
            </div>
          </div>
        </div>
        <div className="py-1">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
            <User size={14} /> Profile
          </Link>
          <Link href="/platform" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
            <Settings size={14} /> Settings
          </Link>
          <Link href="/platform/govern" onClick={onClose} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
            <Shield size={14} /> Governance
          </Link>
        </div>
        <div className="border-t border-white/10 py-1">
          <button
            onClick={() => { logout(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Hive Assistant panel ───────────────────────────────────────────────────────

type Message = { role: "user" | "assistant"; text: string };

function generateReply(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("agent")) return "You currently have 4 agents registered: Orchestrator (Planning), Critic (Critique), Coder (Coding), and Researcher (Research). All are healthy.";
  if (t.includes("run") || t.includes("status")) return "The latest HiveSwarm run completed 3 waves — 4 tasks total. All tasks passed with quality scores above 0.80.";
  if (t.includes("goal") || t.includes("submit")) return "POST /api/v1/swarm/goal\n{ \"goal\": \"your objective\" }\n\nOr: python scripts/demo_swarm.py --goal \"...\"";
  return `I understand you're asking about "${text.slice(0, 60)}…". I can help with agents, runs, and platform navigation.`;
}

function HiveAssistantPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I'm the Hive Assistant. Ask me anything about the platform, agents, or swarm runs." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    setMessages((m) => [...m, { role: "assistant", text: generateReply(text) }]);
    setBusy(false);
  };

  return (
    <>
      <Backdrop onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm border-l border-white/10 bg-[#0A0D14] shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Sparkles size={14} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Hive Assistant</p>
              <p className="text-[10px] text-slate-500">Powered by HiveSwarm</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === "user"
                  ? "bg-emerald-500/20 text-white rounded-br-sm"
                  : "bg-white/5 text-slate-200 rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="bg-white/5 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="px-4 pb-3 space-y-1.5 shrink-0">
            {STARTER_QUESTIONS.map((q) => (
              <button key={q} onClick={() => send(q)}
                className="w-full text-left text-xs text-slate-400 border border-white/10 rounded-xl px-3 py-2 hover:bg-white/5 hover:text-white transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="px-4 py-3 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder="Ask anything…"
              disabled={busy}
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none"
            />
            <button onClick={() => send(input)} disabled={busy || !input.trim()}
              className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-40 transition-colors">
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── TopBar ─────────────────────────────────────────────────────────────────────

export default function TopBar() {
  const [open, setOpen] = useState<Panel>(null);
  const [notifCount, setNotifCount] = useState(
    SEED_NOTIFICATIONS.filter((n) => !n.read).length
  );
  const pathname = usePathname();
  const { user } = useAuth();

  const toggle = useCallback((panel: Panel) => {
    setOpen((prev) => (prev === panel ? null : panel));
  }, []);

  const close = useCallback(() => setOpen(null), []);

  // Ctrl/Cmd+K
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => (prev === "palette" ? null : "palette"));
      }
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Close on navigation
  useEffect(() => { setOpen(null); }, [pathname]);

  const initial = (user?.given_name ?? user?.name ?? "U").charAt(0).toUpperCase();

  return (
    <>
      {/* ── Fixed header bar ───────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#0A0D14]/95 backdrop-blur-sm border-b border-white/10 z-40 flex items-center px-4 gap-3">

        {/* 1. Workspace switcher */}
        <button
          onClick={() => toggle("workspace")}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/8 transition-colors shrink-0"
        >
          <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center">
            <Sparkles size={11} className="text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-white">CerebroHive</span>
          <ChevronDown
            size={14}
            className={`text-slate-500 transition-transform ${open === "workspace" ? "rotate-180" : ""}`}
          />
        </button>

        {/* 2. Command palette trigger */}
        <button
          onClick={() => toggle("palette")}
          className="flex-1 flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 hover:bg-white/8 hover:border-white/15 transition-colors text-left max-w-md"
        >
          <Search size={14} className="text-slate-500 shrink-0" />
          <span className="text-sm text-slate-500 flex-1">Search, command, or jump to…</span>
          <span className="hidden sm:flex items-center gap-0.5 shrink-0">
            <kbd className="px-1.5 py-0.5 rounded border border-white/10 text-[10px] text-slate-600 font-mono">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 rounded border border-white/10 text-[10px] text-slate-600 font-mono">K</kbd>
          </span>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto shrink-0">

          {/* 3. Hive Assistant */}
          <button
            onClick={() => toggle("assistant")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              open === "assistant"
                ? "bg-emerald-400 text-[#05070A]"
                : "bg-emerald-500 hover:bg-emerald-400 text-[#05070A]"
            }`}
          >
            <Sparkles size={13} />
            <span className="hidden sm:inline">Hive Assistant</span>
          </button>

          {/* 4. Notifications */}
          <button
            onClick={() => toggle("notifications")}
            className={`relative p-2 rounded-lg transition-colors ${
              open === "notifications"
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-white hover:bg-white/8"
            }`}
            aria-label="Notifications"
          >
            <Bell size={17} />
            {notifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0A0D14]" />
            )}
          </button>

          {/* 5. User avatar */}
          <button
            onClick={() => toggle("user")}
            className={`w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center justify-center transition-all ${
              open === "user"
                ? "ring-2 ring-emerald-400"
                : "hover:ring-2 hover:ring-emerald-500/40"
            }`}
            aria-label="User menu"
          >
            {initial}
          </button>
        </div>
      </header>

      {/* ── Overlays — rendered OUTSIDE header so they're never clipped ── */}
      {open === "workspace"     && <WorkspaceDropdown   onClose={close} />}
      {open === "palette"       && <CommandPalette      onClose={close} />}
      {open === "assistant"     && <HiveAssistantPanel  onClose={close} />}
      {open === "notifications" && <NotificationsPanel  onClose={close} />}
      {open === "user"          && <UserMenu            onClose={close} />}

      {/* Spacer so page content clears the fixed header */}
      <div className="h-14 shrink-0" />
    </>
  );
}
