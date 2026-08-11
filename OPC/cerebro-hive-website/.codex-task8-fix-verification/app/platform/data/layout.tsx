import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Platform | Platform",
  description: "Ingest, transform, and govern enterprise data for AI — pipelines, quality checks, and lineage in one place.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
