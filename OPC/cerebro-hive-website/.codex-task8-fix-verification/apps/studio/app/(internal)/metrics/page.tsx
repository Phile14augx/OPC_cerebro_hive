import { GitHubMetricsProvider } from "@/lib/metrics/github-provider";
import EngineeringHealthWidget from "@/components/dashboard/widgets/EngineeringHealth";
import SprintProgressWidget from "@/components/dashboard/widgets/SprintProgress";

export default async function MetricsPage() {
  const provider = new GitHubMetricsProvider("CerebroHive", "cerebro-hive-website");

  const [healthMetrics, sprintProgress] = await Promise.all([
    provider.getEngineeringHealth(),
    provider.getCurrentSprintProgress()
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <EngineeringHealthWidget metrics={healthMetrics} />
      <SprintProgressWidget metrics={sprintProgress} />
    </div>
  );
}
