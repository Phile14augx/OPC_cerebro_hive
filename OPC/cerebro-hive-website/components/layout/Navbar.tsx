import React from "react";
import Link from "next/link";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Logo } from "@/components/ui/Logo";

const navLinks = [
  { name: "Services", href: "/services" },
  { name: "Industries", href: "/industries" },
  { name: "Solutions", href: "/solutions" },
  { name: "Products", href: "/products" },
  { name: "Research", href: "/research" },
  { name: "Company", href: "/company" },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-primary/80 backdrop-blur-xl border-b border-white/5 z-50">
      <div className="container-wide h-full flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-12 flex items-center justify-center text-white group-hover:text-primary-accent transition-colors">
              <Logo className="w-full h-full" />
            </div>
            <span className="font-space font-bold text-xl tracking-tight text-white">
              Cerebro<span className="text-primary-accent">Hive</span>
            </span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="text-sm font-space font-medium text-text-muted hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Link href="/contact" className="text-sm font-space font-medium text-white hover:text-primary-accent transition-colors mr-4">
            Contact Us
          </Link>
          <AnimatedButton variant="primary" size="sm">
            Book Strategy Session
          </AnimatedButton>
        </div>
      </div>
    </nav>
  );
}
