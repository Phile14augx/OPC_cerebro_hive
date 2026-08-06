"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CerebroSphereDashboard } from "./cerebrosphere/CerebroSphereDashboard";
import { getCerebroSphereSnapshot } from "./cerebrosphere/snapshot";

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/?login=required");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-accent border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const snapshot = getCerebroSphereSnapshot();

  return <CerebroSphereDashboard snapshot={snapshot} />;
}
