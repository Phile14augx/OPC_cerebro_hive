import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Referral Program — CerebroHive Academy",
  description: "Refer colleagues and earn rewards. Help grow the CerebroHive AI education community.",
};
export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
