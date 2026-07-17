import { redirect } from "next/navigation";

// Solutions have been merged into the Enterprise Services pillar.
export default function SolutionsRedirect() {
  redirect("/services");
}
