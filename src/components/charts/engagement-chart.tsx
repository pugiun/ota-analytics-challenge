"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { AreaChart, BarChart3, LineChart, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import type { DateRangeOption } from "@/components/charts/date-range-selector";
import { getDateRange } from "@/components/charts/date-range-selector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDailyMetrics } from "@/hooks/use-daily-metrics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
);

type ChartType = "line" | "area";

type EngagementChartProps = {
  dateRange?: DateRangeOption;
};

export function EngagementChart({ dateRange = "7d" }: EngagementChartProps) {
  const [chartType, setChartType] = useState<ChartType>("line");
  const { data: response, isLoading, error } = useDailyMetrics(dateRange);
  const dateRangeInfo = getDateRange(dateRange);

  const chartData = {
    labels:
      response?.data.map((d) =>
        new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      ) ?? [],
    datasets: [
      {
        label: "Current Period",
        data: response?.data.map((d) => d.engagement) ?? [],
        borderColor: "rgb(99, 102, 241)",
        backgroundColor:
          chartType === "area"
            ? "rgba(99, 102, 241, 0.2)"
            : "rgba(99, 102, 241, 1)",
        fill: chartType === "area",
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: "Previous Period",
        data: response?.previousData.map((d) => d.engagement) ?? [],
        borderColor: "rgb(156, 163, 175)",
        backgroundColor:
          chartType === "area"
            ? "rgba(156, 163, 175, 0.1)"
            : "rgba(156, 163, 175, 1)",
        fill: chartType === "area",
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 5,
        borderDash: [5, 5],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        align: "end" as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: TooltipItem<"line">) => {
            const value = context.parsed.y ?? 0;
            return `${context.dataset.label}: ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: (value: number | string) => {
            if (typeof value === "number") {
              return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
            }
            return value;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement Over Time</CardTitle>
          <CardDescription>{dateRangeInfo.label}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-destructive">
            Error loading engagement data: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  const engagementChange = response?.summary.engagementChange ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            Engagement Over Time
            {!isLoading && engagementChange !== 0 && (
              <span
                className={`flex items-center text-sm font-medium ${engagementChange > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {engagementChange > 0 ? (
                  <TrendingUp className="size-4 mr-1" />
                ) : (
                  <TrendingDown className="size-4 mr-1" />
                )}
                {engagementChange > 0 ? "+" : ""}
                {engagementChange}%
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {dateRangeInfo.label} {dateRangeInfo.comparisonLabel}
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-1">
          <Button
            variant={chartType === "line" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setChartType("line")}
            className="h-8 px-3"
          >
            <LineChart className="mr-1 size-4" />
            Line
          </Button>
          <Button
            variant={chartType === "area" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setChartType("area")}
            className="h-8 px-3"
          >
            <AreaChart className="mr-1 size-4" />
            Area
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] space-y-4">
            <Skeleton className="h-full w-full" />
          </div>
        ) : !response?.data.length ? (
          <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
            <BarChart3 className="size-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm">There's no engagement data for this period yet.</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <Line data={chartData} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
