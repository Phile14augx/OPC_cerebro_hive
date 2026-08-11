import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-24 text-center">
      <p className="font-mono text-7xl font-bold text-primary-accent opacity-30 mb-6">404</p>
      <h1 className="font-space text-3xl font-bold text-text-primary mb-3">
        Page Not Found
      </h1>
      <p className="text-text-secondary mb-10 max-w-md mx-auto">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-accent text-background font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Back to Home <ArrowRight size={14} />
        </Link>
        <Link
          href="/platform"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text-primary font-bold text-sm hover:border-primary-accent transition-colors"
        >
          Browse Platform <ArrowRight size={14} />
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-text-primary font-bold text-sm hover:border-primary-accent transition-colors"
        >
          Contact Us <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}
