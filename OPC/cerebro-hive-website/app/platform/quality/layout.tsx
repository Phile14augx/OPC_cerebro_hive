import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Quality | Platform",
  description: "Automated data quality checks, validation rules, and anomaly detection for AI-ready data pipelines.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
