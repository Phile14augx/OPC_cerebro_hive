import { redirect } from "next/navigation";

// Solutions have been merged into the Enterprise Services pillar.
// All pages now route through /services/[slug] using the Service Experience Framework.
export default function SolutionSlugRedirect() {
  redirect("/services");
}
