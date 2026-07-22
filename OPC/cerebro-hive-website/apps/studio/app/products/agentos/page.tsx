import { redirect } from "next/navigation";

// The standalone AgentOS page has been deprecated.
// AgentOS is now rendered via the configuration-driven ProductRenderer at /products/[slug].
export default function AgentOSRedirect() {
  redirect("/products/cerebro-studio");
}
