"use client";
import React from 'react';

export function StudioShell({ children, activeWorkspace }: { children: React.ReactNode, activeWorkspace: string }) {
  const navItems = [
    { name: "Dashboard", href: "/studio/dashboard" },
    { name: "Knowledge", href: "/studio/knowledge" },
    { name: "Simulation", href: "/studio/simulation" },
    { name: "Agents", href: "/studio/agents" },
    { name: "Prompts", href: "/studio/prompts" },
    { name: "Capabilities", href: "/studio/capabilities" },
    { name: "Models", href: "/studio/models" },
    { name: "Governance", href: "/studio/governance" },
    { name: "Evaluation", href: "/studio/evaluation" },
    { name: "Runtime", href: "/studio/runtime" },
    { name: "Events", href: "/studio/events" },
    { name: "Workflows", href: "/studio/workflows" },
    { name: "Admin", href: "/studio/admin" },
    { name: "Settings", href: "/studio/settings" },
  ];

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-blue-500/30">
      {/* Top Header */}
      <header className="h-14 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur flex items-center px-6 justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            CH
          </div>
          <h1 className="font-semibold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-400">
            CerebroStudio™
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center px-3 py-1.5 bg-neutral-800 rounded-md border border-neutral-700 text-sm text-neutral-400">
            <span className="mr-2">⌘K</span> Search...
          </div>
          <div className="w-8 h-8 rounded-full border border-neutral-700 bg-neutral-800 flex items-center justify-center text-sm font-medium">
            OP
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 border-r border-neutral-800 bg-neutral-900/30 flex-shrink-0 overflow-y-auto hidden md:block">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = activeWorkspace === item.name;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 border border-transparent"
                  }`}
                >
                  {item.name}
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
          <div className="max-w-7xl mx-auto space-y-6">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-neutral-100 tracking-tight">{activeWorkspace}</h2>
            </header>
            {children}
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <footer className="h-8 border-t border-neutral-800 bg-neutral-900 flex items-center px-4 text-xs font-mono text-neutral-500 justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Runtime: Online</span>
          <span>Latency: 45ms</span>
        </div>
        <div>
          agentos-kernel-v1.0.0
        </div>
      </footer>
    </div>
  );
}
