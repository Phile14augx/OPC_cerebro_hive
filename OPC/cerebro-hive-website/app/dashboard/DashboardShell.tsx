'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Search, BookOpen, Database, MessageSquare,
  Network, CheckSquare, Settings, Menu, X,
  Bell, ChevronDown, Plus, Sparkles,
} from 'lucide-react';
import type { UserProfile } from '@/app/actions/user';

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: Search },
  { label: 'Archive', href: '/dashboard/archive', icon: Database },
  { label: 'Collections', href: '/dashboard/collections', icon: BookOpen },
  { label: 'AI Chat', href: '/dashboard/chat', icon: MessageSquare },
  { label: 'Knowledge Graph', href: '/dashboard/graph', icon: Network },
  { label: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

interface DashboardShellProps {
  children: React.ReactNode;
  user: UserProfile;
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userInitials = initials(user.full_name || user.email);

  return (
    <div className="min-h-screen bg-page text-primary flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border/50
        transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Workspace Header */}
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <div className="flex items-center gap-3 w-full cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles size={16} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">CerebroArchive</p>
              <p className="text-xs text-muted truncate">Research Workspace</p>
            </div>
            <ChevronDown size={16} className="text-muted" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium
                  ${isActive
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-gray-400 hover:text-white hover:bg-surface-hover'}
                `}
              >
                <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-gray-500'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-border/50">
          <button className="flex items-center gap-3 w-full p-2 rounded-md hover:bg-surface-hover transition-colors">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <p className="text-xs text-muted truncate">{user.email}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-surface/50 backdrop-blur-md border-b border-border/50 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-md"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center text-sm text-muted">
              <span>CerebroArchive</span>
              <span className="mx-2">/</span>
              <span className="text-white font-medium">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <Bell size={18} />
            </button>
            <Link
              href="/dashboard/archive"
              className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Upload Document
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-page">
          {children}
        </div>
      </main>
    </div>
  );
}
