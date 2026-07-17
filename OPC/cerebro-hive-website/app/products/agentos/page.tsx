import { Metadata } from "next";
import { agentos } from "@/lib/data/products/agentos";
import { AgentOSPage } from "@/components/products/agentos/AgentOSPage";

export const metadata: Metadata = {
  title: `${agentos.name} | CerebroHive`,
  description: agentos.description,
};

export default function AgentOSRoute() {
  return <AgentOSPage />;
}
