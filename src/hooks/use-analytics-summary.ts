"use client";

import { useQuery } from "@tanstack/react-query";
import type { DateRangeOption } from "@/components/charts/date-range-selector";

export type AnalyticsSummary = {
  totals: {
    posts: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    engagement: number;
    reach: number;
    impressions: number;
  };
  averages: {
    likesPerPost: number;
    commentsPerPost: number;
    sharesPerPost: number;
    engagementPerPost: number;
    reachPerPost: number;
    engagementRate: number;
  };
  trends: {
    engagement: {
      current: number;
      previous: number;
      percentChange: number;
    };
    reach: {
      current: number;
      previous: number;
      percentChange: number;
    };
    posts: {
      current: number;
      previous: number;
      percentChange: number;
    };
  };
  dailyEngagement: Array<{
    date: string;
    engagement: number;
    reach: number;
  }>;
  topPost: {
    id: string;
    caption: string | null;
    platform: string;
    thumbnail_url: string | null;
    engagement: number;
    likes: number;
    comments: number;
    shares: number;
    posted_at: string;
  } | null;
  dateRange: {
    current: {
      start: string;
      end: string;
    };
    previous: {
      start: string;
      end: string;
    };
  };
};

export function useAnalyticsSummary(dateRange: DateRangeOption = "7d") {
  return useQuery({
    queryKey: ["analytics-summary", dateRange],
    queryFn: async (): Promise<AnalyticsSummary> => {
      const response = await fetch(`/api/analytics/summary?range=${dateRange}`);

      if (!response.ok) {
        throw new Error("Failed to fetch analytics summary");
      }

      return response.json();
    },
  });
}
