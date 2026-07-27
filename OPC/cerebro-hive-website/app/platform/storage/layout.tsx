import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Storage | Platform",
  description: "Object and file storage built for AI workloads — documents, embeddings, artifacts, and model checkpoints.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
