"use client";

import { useQuery } from "@tanstack/react-query";
import type { DateRangeOption } from "@/components/charts/date-range-selector";

export type DailyMetric = {
  date: string;
  engagement: number;
  reach: number;
};

export type DailyMetricsResponse = {
  data: DailyMetric[];
  previousData: DailyMetric[];
  summary: {
    totalEngagement: number;
    totalReach: number;
    engagementChange: number;
    reachChange: number;
    dataPoints: number;
  };
  meta: {
    dateRange: DateRangeOption;
    period: {
      start: string;
      end: string;
    };
    comparisonPeriod: {
      start: string;
      end: string;
    };
    responseTimeMs: number;
    runtime: string;
  };
};

export function useDailyMetrics(dateRange: DateRangeOption = "7d") {
  return useQuery({
    queryKey: ["daily-metrics", dateRange],
    queryFn: async (): Promise<DailyMetricsResponse> => {
      const response = await fetch(`/api/metrics/daily?range=${dateRange}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch daily metrics");
      }

      return response.json();
    },
  });
}
