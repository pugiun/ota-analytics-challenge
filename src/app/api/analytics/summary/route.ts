import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Validate authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Parse date range from query params
  const searchParams = request.nextUrl.searchParams;
  const rangeType = searchParams.get("range") || "7d";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  let currentStart: Date;
  let currentEnd: Date;
  let previousStart: Date;
  let previousEnd: Date;

  switch (rangeType) {
    case "7d": {
      currentEnd = today;
      currentStart = new Date(today);
      currentStart.setDate(currentStart.getDate() - 6);
      currentStart.setHours(0, 0, 0, 0);

      previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 6);
      previousStart.setHours(0, 0, 0, 0);
      break;
    }
    case "30d": {
      currentEnd = today;
      currentStart = new Date(today);
      currentStart.setDate(currentStart.getDate() - 29);
      currentStart.setHours(0, 0, 0, 0);

      previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 29);
      previousStart.setHours(0, 0, 0, 0);
      break;
    }
    case "month": {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      currentEnd = today;

      previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    }
    default: {
      // Default to 7 days
      currentEnd = today;
      currentStart = new Date(today);
      currentStart.setDate(currentStart.getDate() - 6);
      currentStart.setHours(0, 0, 0, 0);

      previousEnd = new Date(currentStart);
      previousEnd.setDate(previousEnd.getDate() - 1);
      previousEnd.setHours(23, 59, 59, 999);
      previousStart = new Date(previousEnd);
      previousStart.setDate(previousStart.getDate() - 6);
      previousStart.setHours(0, 0, 0, 0);
    }
  }

  // Fetch posts for the authenticated user within the current period
  const { data: currentPosts, error: currentPostsError } = await supabase
    .from("posts")
    .select("id, caption, platform, thumbnail_url, likes, comments, shares, saves, reach, impressions, engagement_rate, posted_at")
    .eq("user_id", user.id)
    .gte("posted_at", currentStart.toISOString())
    .lte("posted_at", currentEnd.toISOString())
    .order("posted_at", { ascending: false });

  if (currentPostsError) {
    return NextResponse.json(
      { error: "Failed to fetch posts", details: currentPostsError.message },
      { status: 500 }
    );
  }

  // Fetch posts for the previous period
  const { data: previousPosts, error: previousPostsError } = await supabase
    .from("posts")
    .select("id, likes, comments, shares, saves, reach, impressions, engagement_rate, posted_at")
    .eq("user_id", user.id)
    .gte("posted_at", previousStart.toISOString())
    .lte("posted_at", previousEnd.toISOString());

  if (previousPostsError) {
    return NextResponse.json(
      { error: "Failed to fetch previous posts", details: previousPostsError.message },
      { status: 500 }
    );
  }

  // Fetch daily metrics for the current period
  const { data: currentMetrics, error: currentMetricsError } = await supabase
    .from("daily_metrics")
    .select("date, engagement, reach")
    .eq("user_id", user.id)
    .gte("date", currentStart.toISOString().split("T")[0])
    .lte("date", currentEnd.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (currentMetricsError) {
    return NextResponse.json(
      { error: "Failed to fetch daily metrics", details: currentMetricsError.message },
      { status: 500 }
    );
  }

  // Fetch daily metrics for the previous period
  const { data: previousMetrics, error: previousMetricsError } = await supabase
    .from("daily_metrics")
    .select("date, engagement, reach")
    .eq("user_id", user.id)
    .gte("date", previousStart.toISOString().split("T")[0])
    .lte("date", previousEnd.toISOString().split("T")[0]);

  if (previousMetricsError) {
    return NextResponse.json(
      { error: "Failed to fetch previous metrics", details: previousMetricsError.message },
      { status: 500 }
    );
  }

  // Calculate totals for current period
  const totalPosts = currentPosts.length;
  const totalLikes = currentPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalComments = currentPosts.reduce((sum, p) => sum + (p.comments || 0), 0);
  const totalShares = currentPosts.reduce((sum, p) => sum + (p.shares || 0), 0);
  const totalSaves = currentPosts.reduce((sum, p) => sum + (p.saves || 0), 0);
  const totalEngagement = totalLikes + totalComments + totalShares;
  const totalReach = currentPosts.reduce((sum, p) => sum + (p.reach || 0), 0);
  const totalImpressions = currentPosts.reduce((sum, p) => sum + (p.impressions || 0), 0);

  // Calculate totals for previous period
  const prevTotalLikes = previousPosts.reduce((sum, p) => sum + (p.likes || 0), 0);
  const prevTotalComments = previousPosts.reduce((sum, p) => sum + (p.comments || 0), 0);
  const prevTotalShares = previousPosts.reduce((sum, p) => sum + (p.shares || 0), 0);
  const prevTotalEngagement = prevTotalLikes + prevTotalComments + prevTotalShares;
  const prevTotalReach = previousPosts.reduce((sum, p) => sum + (p.reach || 0), 0);

  // Calculate averages for current period
  const avgLikesPerPost = totalPosts > 0 ? totalLikes / totalPosts : 0;
  const avgCommentsPerPost = totalPosts > 0 ? totalComments / totalPosts : 0;
  const avgSharesPerPost = totalPosts > 0 ? totalShares / totalPosts : 0;
  const avgEngagementPerPost = totalPosts > 0 ? totalEngagement / totalPosts : 0;
  const avgReachPerPost = totalPosts > 0 ? totalReach / totalPosts : 0;

  const engagementRates = currentPosts
    .map((p) => p.engagement_rate)
    .filter((rate): rate is number => rate !== null);
  const avgEngagementRate = engagementRates.length > 0
    ? engagementRates.reduce((sum, r) => sum + r, 0) / engagementRates.length
    : 0;

  // Calculate trends using daily metrics
  const currentEngagement = currentMetrics.reduce((sum, m) => sum + (m.engagement || 0), 0);
  const previousEngagement = previousMetrics.reduce((sum, m) => sum + (m.engagement || 0), 0);
  const currentReach = currentMetrics.reduce((sum, m) => sum + (m.reach || 0), 0);
  const previousReach = previousMetrics.reduce((sum, m) => sum + (m.reach || 0), 0);

  const engagementTrend = previousEngagement > 0
    ? ((currentEngagement - previousEngagement) / previousEngagement) * 100
    : currentEngagement > 0 ? 100 : 0;

  const reachTrend = previousReach > 0
    ? ((currentReach - previousReach) / previousReach) * 100
    : currentReach > 0 ? 100 : 0;

  // Posts trend
  const postsTrend = previousPosts.length > 0
    ? ((currentPosts.length - previousPosts.length) / previousPosts.length) * 100
    : currentPosts.length > 0 ? 100 : 0;

  // Daily engagement for chart
  const dailyEngagement = currentMetrics.map((m) => ({
    date: m.date,
    engagement: m.engagement,
    reach: m.reach,
  }));

  // Find top performing post (highest engagement) in current period
  const topPerformingPost = currentPosts.length > 0
    ? currentPosts.reduce((top, current) => {
        const topEngagement = (top.likes || 0) + (top.comments || 0) + (top.shares || 0);
        const currentEngagementVal = (current.likes || 0) + (current.comments || 0) + (current.shares || 0);
        return currentEngagementVal > topEngagement ? current : top;
      })
    : null;

  const topPost = topPerformingPost
    ? {
        id: topPerformingPost.id,
        caption: topPerformingPost.caption,
        platform: topPerformingPost.platform,
        thumbnail_url: topPerformingPost.thumbnail_url,
        engagement: (topPerformingPost.likes || 0) + (topPerformingPost.comments || 0) + (topPerformingPost.shares || 0),
        likes: topPerformingPost.likes,
        comments: topPerformingPost.comments,
        shares: topPerformingPost.shares,
        posted_at: topPerformingPost.posted_at,
      }
    : null;

  return NextResponse.json({
    totals: {
      posts: totalPosts,
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      saves: totalSaves,
      engagement: totalEngagement,
      reach: totalReach,
      impressions: totalImpressions,
    },
    averages: {
      likesPerPost: Math.round(avgLikesPerPost * 10) / 10,
      commentsPerPost: Math.round(avgCommentsPerPost * 10) / 10,
      sharesPerPost: Math.round(avgSharesPerPost * 10) / 10,
      engagementPerPost: Math.round(avgEngagementPerPost * 10) / 10,
      reachPerPost: Math.round(avgReachPerPost * 10) / 10,
      engagementRate: Math.round(avgEngagementRate * 10) / 10,
    },
    trends: {
      engagement: {
        current: currentEngagement,
        previous: previousEngagement,
        percentChange: Math.round(engagementTrend * 10) / 10,
      },
      reach: {
        current: currentReach,
        previous: previousReach,
        percentChange: Math.round(reachTrend * 10) / 10,
      },
      posts: {
        current: currentPosts.length,
        previous: previousPosts.length,
        percentChange: Math.round(postsTrend * 10) / 10,
      },
    },
    dailyEngagement,
    topPost,
    dateRange: {
      current: {
        start: currentStart.toISOString(),
        end: currentEnd.toISOString(),
      },
      previous: {
        start: previousStart.toISOString(),
        end: previousEnd.toISOString(),
      },
    },
  });
}
