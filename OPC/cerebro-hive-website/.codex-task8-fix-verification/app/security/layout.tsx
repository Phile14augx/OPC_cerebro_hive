import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Security | CerebroHive",
  description: "Enterprise AI cyber security suite with zero-trust, AI threat detection, and compliance automation.",
};

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Security Hero Banner */}
      <div className="bg-gradient-to-r from-red-500/10 via-purple-500/5 to-transparent border-b border-border">
        <div className="container-wide py-8">
          <div className="flex items-center gap-3 text-red-400">
            <Shield size={20} />
            <span className="font-bold text-sm">CerebroCyber Security Center</span>
          </div>
        </div>
      </div>
      
      {children}
    </div>
  );
}