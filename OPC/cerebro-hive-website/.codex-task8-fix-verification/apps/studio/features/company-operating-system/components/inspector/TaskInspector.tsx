import type { EntityDetail } from "@cerebro/shared-types";
export function TaskInspector({ detail }: { detail: EntityDetail }) { return <section aria-label="Task detail"><h3 className="font-plex font-semibold">Current workload</h3><p className="font-inter text-sm">{String(detail.node.summary.workload ?? detail.node.summary.progress ?? "No workload reported")}</p></section>; }
