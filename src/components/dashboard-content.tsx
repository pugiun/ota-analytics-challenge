"use client";

import { DateRangeSelector } from "@/components/charts/date-range-selector";
import { EngagementChart } from "@/components/charts/engagement-chart";
import { MetricsCards } from "@/components/charts/metrics-cards";
import { PostsTableContainer } from "@/components/posts/posts-table-container";
import { useDashboardStore } from "@/stores/dashboard-store";

export function DashboardContent() {
  const { dateRange, setDateRange } = useDashboardStore();

  return (
    <>
      <div className="mb-6">
        <DateRangeSelector value={dateRange} onChange={setDateRange} />
      </div>

      <MetricsCards dateRange={dateRange} />

      <div className="mt-8">
        <EngagementChart dateRange={dateRange} />
      </div>

      <div className="mt-8">
        <PostsTableContainer />
      </div>
    </>
  );
}
