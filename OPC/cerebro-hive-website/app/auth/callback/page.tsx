"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

// This page is the Keycloak redirect_uri.
// The AuthProvider (mounted in layout) handles the actual code exchange.
// This component just waits for auth to settle, then redirects.

export default function AuthCallbackPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.replace(isAuthenticated ? "/dashboard" : "/");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-primary-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-text-secondary text-sm font-mono">Signing you in…</p>
      </div>
    </div>
  );
}
