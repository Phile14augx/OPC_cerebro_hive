import type { Metadata } from "next";
import OsConsole from "./OsConsole";

export const metadata: Metadata = {
  title: "Enterprise AI OS — Live Console | CerebroHive",
  description:
    "Operate the live CerebroHive Enterprise AI OS: AgentOS runtime, Cerebro X gateway, Knowledge Fabric, Guard, Mesh, and the Core Consulting Capabilities — running in production.",
};

export default function PlatformOsPage() {
  return <OsConsole />;
}
