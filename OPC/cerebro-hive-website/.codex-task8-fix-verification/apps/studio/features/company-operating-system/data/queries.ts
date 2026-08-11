"use client";

import { useQuery } from "@tanstack/react-query";
import type { DemoMode } from "@cerebro/shared-types";

import { operatingSystemClient } from "./client";

export function useOperatingGraph(mode: DemoMode) {
  return useQuery({
    queryKey: ["company-os", "graph", mode],
    queryFn: () => operatingSystemClient.getGraph(mode),
    staleTime: 15_000,
  });
}
