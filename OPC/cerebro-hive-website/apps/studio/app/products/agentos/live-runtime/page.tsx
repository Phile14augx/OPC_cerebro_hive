import { redirect } from "next/navigation";

// The AgentOS live runtime page has been deprecated.
// All product pages are now rendered via the configuration-driven ProductRenderer.
export default function AgentOSLiveRuntimeRedirect() {
  redirect("/products/cerebro-studio");
}
