import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getClientIdentifier,
  RATE_LIMIT_CONFIGS,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

/**
 * =============================================================================
 * ANALYTICS SUMMARY API ROUTE
 * =============================================================================
 *
 * WHY SERVER-SIDE DATA AGGREGATION?
 * ---------------------------------
 * We perform data aggregation on the server (API route) rather than the client
 * for several important reasons:
 *
 * 1. REDUCED PAYLOAD SIZE
 *    - Instead of sending hundreds/thousands of raw posts to the client,
 *      we send only aggregated totals, averages, and trends
 *    - A user with 1000 posts would receive ~50KB raw vs ~2KB aggregated
 *    - Critical for mobile users with limited bandwidth
 *
 * 2. SECURITY & DATA PRIVACY
 *    - Sensitive metrics stay on the server; client only sees summaries
 *    - RLS (Row Level Security) is enforced at the database level
 *    - Aggregation logic cannot be reverse-engineered from client code
 *
 * 3. CONSISTENT CALCULATIONS
 *    - Single source of truth for business logic (trend calculations, etc.)
 *    - No risk of client/server calculation drift
 *    - Easier to update formulas without client deployments
 *
 * 4. PERFORMANCE
 *    - Server has more compute power than typical mobile devices
 *    - Aggregation happens close to the database (low latency)
 *    - Client devices don't waste battery on heavy computations
 *
 * 5. CACHEABILITY
 *    - Aggregated responses can be cached at CDN/edge level
 *    - Same summary can serve multiple requests without re-computation
 *
 * WHY NOT DATABASE-LEVEL AGGREGATION (e.g., SQL SUM/AVG)?
 * -------------------------------------------------------
 * For this scale, JavaScript aggregation is sufficient and more flexible:
 * - Supabase JS client doesn't support complex aggregations natively
 * - Would require raw SQL or database functions (RPC)
 * - Current approach is readable and maintainable
 * - For 10K+ rows, we'd move aggregation to PostgreSQL functions
 *
 * TRADE-OFFS
 * ----------
 * - More server CPU usage (acceptable for this scale)
 * - Multiple DB round-trips (mitigated with Promise.all parallel fetching)
 * - Memory usage scales with data size (pagination would help for huge datasets)
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

type DateRangeOption = "7d" | "30d" | "month";

type DateRange = {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
};

type Post = {
  id: string;
  caption: string | null;
  platform: string;
  thumbnail_url: string | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  reach: number | null;
  impressions: number | null;
  engagement_rate: number | null;
  posted_at: string;
};

type DailyMetric = {
  date: string;
  engagement: number | null;
  reach: number | null;
};

type AggregatedTotals = {
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagement: number;
  reach: number;
  impressions: number;
};

type AggregatedAverages = {
  likesPerPost: number;
  commentsPerPost: number;
  sharesPerPost: number;
  engagementPerPost: number;
  reachPerPost: number;
  engagementRate: number;
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate date range boundaries based on the selected option.
 * Returns both current and previous period for trend comparison.
 */
function calculateDateRange(option: DateRangeOption): DateRange {
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );

  let currentStart: Date;
  let currentEnd: Date;
  let previousStart: Date;
  let previousEnd: Date;

  switch (option) {
    case "7d": {
      currentEnd = today;
      currentStart = new Date(today);
      currentStart.setDate(currentStart.getDate() - 6);
      currentStart.setHours(0, 0, 0, 0);

      // Previous period: 7 days before current start
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

      // Previous period: entire previous month
      previousStart = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
        0,
        0,
        0,
        0,
      );
      previousEnd = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59,
        999,
      );
      break;
    }
    default: {
      // Default to 7 days (defensive fallback)
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

  return { currentStart, currentEnd, previousStart, previousEnd };
}

/**
 * Aggregate post data into totals.
 *
 * WHY SERVER-SIDE: This reduces payload from N posts to 8 numbers.
 * For 100 posts averaging 500 bytes each = 50KB → reduced to ~200 bytes.
 */
function aggregateTotals(posts: Post[]): AggregatedTotals {
  return posts.reduce(
    (acc, post) => ({
      posts: acc.posts + 1,
      likes: acc.likes + (post.likes || 0),
      comments: acc.comments + (post.comments || 0),
      shares: acc.shares + (post.shares || 0),
      saves: acc.saves + (post.saves || 0),
      engagement:
        acc.engagement +
        (post.likes || 0) +
        (post.comments || 0) +
        (post.shares || 0),
      reach: acc.reach + (post.reach || 0),
      impressions: acc.impressions + (post.impressions || 0),
    }),
    {
      posts: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      engagement: 0,
      reach: 0,
      impressions: 0,
    },
  );
}

/**
 * Calculate averages from totals.
 *
 * WHY SERVER-SIDE: Ensures consistent rounding and prevents
 * division-by-zero errors that might occur with different client implementations.
 */
function calculateAverages(
  totals: AggregatedTotals,
  posts: Post[],
): AggregatedAverages {
  const count = totals.posts;

  // Calculate average engagement rate from individual posts
  // (can't be derived from totals alone)
  const engagementRates = posts
    .map((p) => p.engagement_rate)
    .filter((rate): rate is number => rate !== null);

  const avgEngagementRate =
    engagementRates.length > 0
      ? engagementRates.reduce((sum, r) => sum + r, 0) / engagementRates.length
      : 0;

  // Round to 1 decimal place for cleaner display
  const round = (n: number) => Math.round(n * 10) / 10;

  return {
    likesPerPost: round(count > 0 ? totals.likes / count : 0),
    commentsPerPost: round(count > 0 ? totals.comments / count : 0),
    sharesPerPost: round(count > 0 ? totals.shares / count : 0),
    engagementPerPost: round(count > 0 ? totals.engagement / count : 0),
    reachPerPost: round(count > 0 ? totals.reach / count : 0),
    engagementRate: round(avgEngagementRate),
  };
}

/**
 * Calculate percentage change between two values.
 *
 * WHY SERVER-SIDE: Business logic for trend calculation stays centralized.
 * If we change how trends are computed (e.g., weighted averages), we update once here.
 */
function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

/**
 * Find the top performing post by total engagement.
 *
 * WHY SERVER-SIDE: Instead of sending all posts and sorting on client,
 * we find the winner here and send only that one post's details.
 */
function findTopPost(posts: Post[]) {
  if (posts.length === 0) return null;

  const topPost = posts.reduce((best, current) => {
    const bestEngagement =
      (best.likes || 0) + (best.comments || 0) + (best.shares || 0);
    const currentEngagement =
      (current.likes || 0) + (current.comments || 0) + (current.shares || 0);
    return currentEngagement > bestEngagement ? current : best;
  });

  return {
    id: topPost.id,
    caption: topPost.caption,
    platform: topPost.platform,
    thumbnail_url: topPost.thumbnail_url,
    engagement:
      (topPost.likes || 0) + (topPost.comments || 0) + (topPost.shares || 0),
    likes: topPost.likes,
    comments: topPost.comments,
    shares: topPost.shares,
    posted_at: topPost.posted_at,
  };
}

// =============================================================================
// MAIN ROUTE HANDLER
// =============================================================================

export async function GET(request: NextRequest) {
  // ---------------------------------------------------------------------------
  // RATE LIMITING
  // Applied before any database calls to protect against abuse
  // ---------------------------------------------------------------------------
  const clientId = getClientIdentifier(request);
  const rateLimitResult = rateLimit(clientId, RATE_LIMIT_CONFIGS.standard);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(rateLimitResult),
          "Retry-After": Math.ceil(
            (rateLimitResult.reset - Date.now()) / 1000,
          ).toString(),
        },
      },
    );
  }

  // ---------------------------------------------------------------------------
  // AUTHENTICATION
  // Server-side auth check ensures RLS policies are enforced
  // ---------------------------------------------------------------------------
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ---------------------------------------------------------------------------
  // PARSE & VALIDATE PARAMETERS
  // ---------------------------------------------------------------------------
  const searchParams = request.nextUrl.searchParams;
  const rangeType = (searchParams.get("range") || "7d") as DateRangeOption;

  // Validate range parameter
  if (!["7d", "30d", "month"].includes(rangeType)) {
    return NextResponse.json(
      { error: "Invalid range parameter. Must be: 7d, 30d, or month" },
      { status: 400 },
    );
  }

  const { currentStart, currentEnd, previousStart, previousEnd } =
    calculateDateRange(rangeType);

  // ---------------------------------------------------------------------------
  // PARALLEL DATA FETCHING
  // ---------------------------------------------------------------------------
  // WHY PARALLEL: Fetching 4 queries sequentially would take ~4x longer.
  // Promise.all executes all queries concurrently, reducing total latency.
  //
  // Example: 4 queries × 50ms each = 200ms sequential vs ~50ms parallel
  //
  // TRADE-OFF: Slightly higher peak database load, but acceptable for
  // this use case. For high-traffic scenarios, consider query batching
  // or database-level aggregation functions.
  // ---------------------------------------------------------------------------

  const [
    currentPostsResult,
    previousPostsResult,
    currentMetricsResult,
    previousMetricsResult,
  ] = await Promise.all([
    // Query 1: Current period posts (full details for aggregation + top post)
    supabase
      .from("posts")
      .select(
        "id, caption, platform, thumbnail_url, likes, comments, shares, saves, reach, impressions, engagement_rate, posted_at",
      )
      .eq("user_id", user.id)
      .gte("posted_at", currentStart.toISOString())
      .lte("posted_at", currentEnd.toISOString())
      .order("posted_at", { ascending: false }),

    // Query 2: Previous period posts (only metrics needed for trend comparison)
    // WHY MINIMAL SELECT: Reduces data transfer; we only need numbers for trends
    supabase
      .from("posts")
      .select(
        "id, likes, comments, shares, saves, reach, impressions, engagement_rate, posted_at",
      )
      .eq("user_id", user.id)
      .gte("posted_at", previousStart.toISOString())
      .lte("posted_at", previousEnd.toISOString()),

    // Query 3: Current period daily metrics (for chart data)
    supabase
      .from("daily_metrics")
      .select("date, engagement, reach")
      .eq("user_id", user.id)
      .gte("date", currentStart.toISOString().split("T")[0])
      .lte("date", currentEnd.toISOString().split("T")[0])
      .order("date", { ascending: true }),

    // Query 4: Previous period daily metrics (for trend calculations)
    supabase
      .from("daily_metrics")
      .select("date, engagement, reach")
      .eq("user_id", user.id)
      .gte("date", previousStart.toISOString().split("T")[0])
      .lte("date", previousEnd.toISOString().split("T")[0]),
  ]);

  // ---------------------------------------------------------------------------
  // ERROR HANDLING
  // Fail fast if any query fails; don't return partial data
  // ---------------------------------------------------------------------------
  if (currentPostsResult.error) {
    return NextResponse.json(
      {
        error: "Failed to fetch posts",
        details: currentPostsResult.error.message,
      },
      { status: 500 },
    );
  }
  if (previousPostsResult.error) {
    return NextResponse.json(
      {
        error: "Failed to fetch previous posts",
        details: previousPostsResult.error.message,
      },
      { status: 500 },
    );
  }
  if (currentMetricsResult.error) {
    return NextResponse.json(
      {
        error: "Failed to fetch metrics",
        details: currentMetricsResult.error.message,
      },
      { status: 500 },
    );
  }
  if (previousMetricsResult.error) {
    return NextResponse.json(
      {
        error: "Failed to fetch previous metrics",
        details: previousMetricsResult.error.message,
      },
      { status: 500 },
    );
  }

  const currentPosts = currentPostsResult.data as Post[];
  const previousPosts = previousPostsResult.data as Post[];
  const currentMetrics = currentMetricsResult.data as DailyMetric[];
  const previousMetrics = previousMetricsResult.data as DailyMetric[];

  // ---------------------------------------------------------------------------
  // DATA AGGREGATION (Server-side)
  // ---------------------------------------------------------------------------
  // All aggregation happens here on the server. The client receives only
  // the final computed values, not the raw post data.
  //
  // BENEFITS:
  // - Payload reduced from potentially 100KB+ to ~3KB
  // - Client doesn't need to implement aggregation logic
  // - Consistent results across all clients (web, mobile, etc.)
  // - Aggregation logic can be updated without client deployment
  // ---------------------------------------------------------------------------

  // Aggregate current period
  const currentTotals = aggregateTotals(currentPosts);
  const currentAverages = calculateAverages(currentTotals, currentPosts);

  // Aggregate previous period (for trend comparison only)
  const previousTotals = aggregateTotals(previousPosts);

  // Calculate metrics totals from daily_metrics table
  const currentMetricsTotals = currentMetrics.reduce(
    (acc, m) => ({
      engagement: acc.engagement + (m.engagement || 0),
      reach: acc.reach + (m.reach || 0),
    }),
    { engagement: 0, reach: 0 },
  );

  const previousMetricsTotals = previousMetrics.reduce(
    (acc, m) => ({
      engagement: acc.engagement + (m.engagement || 0),
      reach: acc.reach + (m.reach || 0),
    }),
    { engagement: 0, reach: 0 },
  );

  // ---------------------------------------------------------------------------
  // TREND CALCULATIONS
  // ---------------------------------------------------------------------------
  // Trends are calculated server-side to ensure consistent business logic.
  // The formula: ((current - previous) / previous) * 100
  // ---------------------------------------------------------------------------

  const trends = {
    engagement: {
      current: currentMetricsTotals.engagement,
      previous: previousMetricsTotals.engagement,
      percentChange: calculatePercentChange(
        currentMetricsTotals.engagement,
        previousMetricsTotals.engagement,
      ),
    },
    reach: {
      current: currentMetricsTotals.reach,
      previous: previousMetricsTotals.reach,
      percentChange: calculatePercentChange(
        currentMetricsTotals.reach,
        previousMetricsTotals.reach,
      ),
    },
    posts: {
      current: currentPosts.length,
      previous: previousPosts.length,
      percentChange: calculatePercentChange(
        currentPosts.length,
        previousPosts.length,
      ),
    },
  };

  // ---------------------------------------------------------------------------
  // PREPARE RESPONSE
  // ---------------------------------------------------------------------------
  // The response is a lean, aggregated summary. Raw post data is NOT included
  // (except for the single top post). This keeps the payload small and focused.
  // ---------------------------------------------------------------------------

  return NextResponse.json(
    {
      // Aggregated totals - 8 numbers instead of N posts
      totals: currentTotals,

      // Calculated averages - derived metrics
      averages: currentAverages,

      // Trend comparisons - period-over-period changes
      trends,

      // Chart data - already aggregated daily metrics
      // WHY INCLUDED: Chart needs time-series data; can't be derived from totals
      dailyEngagement: currentMetrics.map((m) => ({
        date: m.date,
        engagement: m.engagement,
        reach: m.reach,
      })),

      // Single top post - avoids sending all posts for client-side sorting
      topPost: findTopPost(currentPosts),

      // Date range metadata - for display purposes
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
    },
    {
      headers: rateLimitHeaders(rateLimitResult),
    },
  );
}
