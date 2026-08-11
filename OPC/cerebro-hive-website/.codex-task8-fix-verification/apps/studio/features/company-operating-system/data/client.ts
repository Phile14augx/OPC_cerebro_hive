import type {
  DemoMode,
  EntityDetail,
  OperatingGraphSnapshot,
  OperatingNodeType,
} from "@cerebro/shared-types";

import { platformRequest } from "@/lib/platform/api-client";

export const operatingSystemClient = {
  getGraph(mode: DemoMode = "live") {
    return platformRequest<{ data: OperatingGraphSnapshot }>(
      `/api/operating-system/graph?mode=${mode}`,
      { method: "GET" },
    );
  },

  getEntityDetail(type: OperatingNodeType, id: string) {
    return platformRequest<{ data: EntityDetail }>(
      `/api/operating-system/entities/${type}/${encodeURIComponent(id)}`,
      { method: "GET" },
    );
  },
};
