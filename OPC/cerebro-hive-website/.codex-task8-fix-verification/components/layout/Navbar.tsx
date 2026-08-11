"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Sun, Moon, User, LogIn } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const NAV = [
  {
    label: "Platform",
    href: "/platform",
    children: [
      { label: "All 50 Products", href: "/platform" },
      { label: "Tier 0 — Security & Governance", href: "/platform#tier-0" },
      { label: "Tier 1 — Infrastructure", href: "/platform#tier-1" },
      { label: "Tier 2 — Platform & Data", href: "/platform#tier-2" },
      { label: "Tier 3 — AI Runtime", href: "/platform#tier-3" },
      { label: "Tier 4 — Business Apps", href: "/platform#tier-4" },
      { label: "Tier 5 — Ecosystem & Commerce", href: "/platform#tier-5" },
    ],
  },
  {
    label: "Services",
    href: "/services",
    children: [
      { label: "All 50 Services", href: "/services" },
      { label: "Strategy & Advisory", href: "/services/strategy" },
      { label: "Engineering & Implementation", href: "/services/engineering" },
      { label: "AI Operations", href: "/services/operations" },
      { label: "Security & Governance", href: "/services/security" },
      { label: "Industry Solutions", href: "/services/industry" },
    ],
  },
  {
    label: "Solutions",
    href: "/solutions",
  },
  {
    label: "Industries",
    href: "/industries",
  },
  {
    label: "Academy",
    href: "/academy",
  },
  {
    label: "Company",
    href: "/about",
    children: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

function AuthButton() {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <User size={15} />
          <span className="hidden xl:inline">{user?.given_name ?? "Account"}</span>
        </Link>
        <button
          onClick={logout}
          className="text-xs text-text-secondary/60 hover:text-text-secondary transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
    >
      <LogIn size={15} />
      <span className="hidden xl:inline">Sign in</span>
    </button>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <>
      <div className="h-[72px] w-full shrink-0" />
      <nav className="fixed top-0 left-0 right-0 h-[72px] bg-background/95 backdrop-blur-sm border-b border-border z-50">
        <div className="container-wide h-full flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-space font-bold text-xl tracking-tight text-text-primary hover:text-primary-accent transition-colors"
          >
            Cerebro<span className="text-primary-accent">Hive</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {NAV.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setDropdown(item.label)}
                onMouseLeave={() => setDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium transition-colors",
                    pathname?.startsWith(item.href) && item.href !== "/"
                      ? "text-primary-accent"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {item.label}
                  {item.children && <ChevronDown size={14} className={cn("transition-transform", dropdown === item.label && "rotate-180")} />}
                </Link>

                {item.children && dropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 w-60 rounded-xl border border-border bg-surface shadow-lg py-1 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-3">
            <AuthButton />
            <ThemeToggle />
            <Link
              href="/contact"
              className="px-4 py-2 rounded-full bg-primary-accent text-background text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Book Strategy Session
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-text-primary"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border py-4 px-6 space-y-3 z-50">
            {NAV.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-base font-semibold text-text-primary"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4 space-y-1 mt-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className="block py-1.5 text-sm text-text-secondary hover:text-primary-accent"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <ThemeToggle />
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-full bg-primary-accent text-background text-sm font-bold"
              >
                Book Strategy Session
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
