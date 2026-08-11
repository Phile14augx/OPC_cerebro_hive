import { CompanyBrainScreen } from "@/features/company-operating-system/screens/CompanyBrainScreen";

export default async function CompanyBrainPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  return <CompanyBrainScreen mode={mode === "demo" ? "demo" : "live"} />;
}
