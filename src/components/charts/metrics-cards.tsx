"use client";

import {
  Heart,
  MessageCircle,
  Minus,
  Share2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { DateRangeOption } from "@/components/charts/date-range-selector";
import { getDateRange } from "@/components/charts/date-range-selector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalyticsSummary } from "@/hooks/use-analytics-summary";
import { formatNumber } from "@/lib/utils";

function TrendIndicator({ value }: { value: number }) {
  if (value > 0) {
    return (
      <span className="flex items-center gap-1 text-sm font-medium text-green-600">
        <TrendingUp className="size-4" />+{value}%
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className="flex items-center gap-1 text-sm font-medium text-red-600">
        <TrendingDown className="size-4" />
        {value}%
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
      <Minus className="size-4" />
      0%
    </span>
  );
}

function truncateCaption(caption: string | null, maxLength = 60): string {
  if (!caption) return "No caption";
  if (caption.length <= maxLength) return caption;
  return `${caption.slice(0, maxLength)}...`;
}

type MetricsCardsProps = {
  dateRange?: DateRangeOption;
};

export function MetricsCards({ dateRange = "7d" }: MetricsCardsProps) {
  const { data, isLoading, error } = useAnalyticsSummary(dateRange);
  const dateRangeInfo = getDateRange(dateRange);

  if (error) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardContent className="flex h-32 items-center justify-center text-destructive">
            Error loading metrics: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <>
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-2 h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Total Engagement Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Engagement
          </CardTitle>
          <CardDescription>Likes + Comments + Shares</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold">
              {formatNumber(data?.totals.engagement ?? 0)}
            </p>
            <TrendIndicator
              value={data?.trends.engagement.percentChange ?? 0}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {dateRangeInfo.comparisonLabel}
          </p>
        </CardContent>
      </Card>

      {/* Average Engagement Rate Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Avg. Engagement Rate
          </CardTitle>
          <CardDescription>Across all posts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold">
              {data?.averages.engagementRate ?? 0}%
            </p>
            <div className="text-sm text-muted-foreground">
              {data?.totals.posts ?? 0} posts
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatNumber(data?.averages.engagementPerPost ?? 0)} avg per post
          </p>
        </CardContent>
      </Card>

      {/* Top Performing Post Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top Performing Post
          </CardTitle>
          <CardDescription>Highest engagement</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.topPost ? (
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                {data.topPost.thumbnail_url ? (
                  <img
                    src={data.topPost.thumbnail_url}
                    alt="Top post"
                    className="size-12 rounded object-cover"
                  />
                ) : (
                  <div className="flex size-12 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                    N/A
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {truncateCaption(data.topPost.caption, 40)}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      data.topPost.platform === "instagram"
                        ? "bg-pink-100 text-pink-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {data.topPost.platform.charAt(0).toUpperCase() +
                      data.topPost.platform.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="size-3.5" />
                  {formatNumber(data.topPost.likes)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="size-3.5" />
                  {formatNumber(data.topPost.comments)}
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="size-3.5" />
                  {formatNumber(data.topPost.shares)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No posts yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
