import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  getClientIdentifier,
  RATE_LIMIT_CONFIGS,
  rateLimit,
  rateLimitHeaders,
} from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

// Configure edge runtime for low latency
export const runtime = "edge";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Type definitions for query parameters
type DateRangeOption = "7d" | "30d" | "month";

type ValidationResult =
  | { valid: true; dateRange: DateRangeOption }
  | { valid: false; error: string; status: number };

/**
 * Validate query parameters
 */
function validateQueryParams(searchParams: URLSearchParams): ValidationResult {
  const range = searchParams.get("range");

  // Validate range parameter
  if (range && !["7d", "30d", "month"].includes(range)) {
    return {
      valid: false,
      error: "Invalid range parameter. Must be one of: 7d, 30d, month",
      status: 400,
    };
  }

  return {
    valid: true,
    dateRange: (range as DateRangeOption) || "7d",
  };
}

/**
 * Calculate date range boundaries based on the selected option
 */
function calculateDateRange(option: DateRangeOption): {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
} {
  const now = new Date();
  const today = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );

  let currentStart: Date;
  let currentEnd: Date;
  let previousStart: Date;
  let previousEnd: Date;

  switch (option) {
    case "7d": {
      currentEnd = today;
      currentStart = new Date(today);
      currentStart.setUTCDate(currentStart.getUTCDate() - 6);
      currentStart.setUTCHours(0, 0, 0, 0);

      previousEnd = new Date(currentStart);
      previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
      previousEnd.setUTCHours(23, 59, 59, 999);
      previousStart = new Date(previousEnd);
      previousStart.setUTCDate(previousStart.getUTCDate() - 6);
      previousStart.setUTCHours(0, 0, 0, 0);
      break;
    }
    case "30d": {
      currentEnd = today;
      currentStart = new Date(today);
      currentStart.setUTCDate(currentStart.getUTCDate() - 29);
      currentStart.setUTCHours(0, 0, 0, 0);

      previousEnd = new Date(currentStart);
      previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
      previousEnd.setUTCHours(23, 59, 59, 999);
      previousStart = new Date(previousEnd);
      previousStart.setUTCDate(previousStart.getUTCDate() - 29);
      previousStart.setUTCHours(0, 0, 0, 0);
      break;
    }
    case "month": {
      currentStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
      );
      currentEnd = today;

      previousStart = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0),
      );
      previousEnd = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999),
      );
      break;
    }
  }

  return { currentStart, currentEnd, previousStart, previousEnd };
}

/**
 * GET /api/metrics/daily
 *
 * Edge-optimized endpoint for fetching daily metrics data.
 *
 * Query Parameters:
 * - range: "7d" | "30d" | "month" (default: "7d")
 *
 * Returns daily engagement and reach metrics for charting.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Check rate limit
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

  // Create Supabase client using SSR helper (handles cookies automatically)
  const supabase = await createClient();

  // Validate authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Valid authentication required",
      },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": "Bearer",
        },
      },
    );
  }

  // Validate query parameters
  const validation = validateQueryParams(request.nextUrl.searchParams);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status },
    );
  }

  const { dateRange } = validation;
  const { currentStart, currentEnd, previousStart, previousEnd } =
    calculateDateRange(dateRange);

  // Fetch current period metrics
  const { data: currentMetrics, error: currentError } = await supabase
    .from("daily_metrics")
    .select("date, engagement, reach")
    .eq("user_id", user.id)
    .gte("date", currentStart.toISOString().split("T")[0])
    .lte("date", currentEnd.toISOString().split("T")[0])
    .order("date", { ascending: true });

  if (currentError) {
    return NextResponse.json(
      {
        error: "Failed to fetch metrics",
        details: currentError.message,
      },
      { status: 500 },
    );
  }

  // Fetch previous period metrics for comparison
  const { data: previousMetrics, error: previousError } = await supabase
    .from("daily_metrics")
    .select("date, engagement, reach")
    .eq("user_id", user.id)
    .gte("date", previousStart.toISOString().split("T")[0])
    .lte("date", previousEnd.toISOString().split("T")[0]);

  if (previousError) {
    return NextResponse.json(
      {
        error: "Failed to fetch comparison metrics",
        details: previousError.message,
      },
      { status: 500 },
    );
  }

  // Calculate totals for trend comparison
  const currentTotalEngagement = currentMetrics.reduce(
    (sum, m) => sum + (m.engagement || 0),
    0,
  );
  const currentTotalReach = currentMetrics.reduce(
    (sum, m) => sum + (m.reach || 0),
    0,
  );
  const previousTotalEngagement = previousMetrics.reduce(
    (sum, m) => sum + (m.engagement || 0),
    0,
  );
  const previousTotalReach = previousMetrics.reduce(
    (sum, m) => sum + (m.reach || 0),
    0,
  );

  // Calculate percentage changes
  const engagementChange =
    previousTotalEngagement > 0
      ? ((currentTotalEngagement - previousTotalEngagement) /
          previousTotalEngagement) *
        100
      : currentTotalEngagement > 0
        ? 100
        : 0;

  const reachChange =
    previousTotalReach > 0
      ? ((currentTotalReach - previousTotalReach) / previousTotalReach) * 100
      : currentTotalReach > 0
        ? 100
        : 0;

  // Calculate response time for monitoring
  const responseTime = Date.now() - startTime;

  // Return response with cache headers optimized for edge
  return NextResponse.json(
    {
      data: currentMetrics.map((m) => ({
        date: m.date,
        engagement: m.engagement,
        reach: m.reach,
      })),
      previousData: previousMetrics.map((m) => ({
        date: m.date,
        engagement: m.engagement,
        reach: m.reach,
      })),
      summary: {
        totalEngagement: currentTotalEngagement,
        totalReach: currentTotalReach,
        engagementChange: Math.round(engagementChange * 10) / 10,
        reachChange: Math.round(reachChange * 10) / 10,
        dataPoints: currentMetrics.length,
      },
      meta: {
        dateRange,
        period: {
          start: currentStart.toISOString().split("T")[0],
          end: currentEnd.toISOString().split("T")[0],
        },
        comparisonPeriod: {
          start: previousStart.toISOString().split("T")[0],
          end: previousEnd.toISOString().split("T")[0],
        },
        responseTimeMs: responseTime,
        runtime: "edge",
      },
    },
    {
      status: 200,
      headers: {
        // Cache for 60 seconds at the edge, allow stale for 5 minutes
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        // Add timing header for monitoring
        "Server-Timing": `db;dur=${responseTime}`,
        // Indicate edge runtime
        "X-Runtime": "edge",
        // Rate limit headers
        ...rateLimitHeaders(rateLimitResult),
      },
    },
  );
}

/**
 * Return 405 Method Not Allowed for non-GET requests
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "This endpoint only supports GET requests",
      allowedMethods: ["GET"],
    },
    {
      status: 405,
      headers: {
        Allow: "GET",
      },
    },
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "This endpoint only supports GET requests",
      allowedMethods: ["GET"],
    },
    {
      status: 405,
      headers: {
        Allow: "GET",
      },
    },
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "This endpoint only supports GET requests",
      allowedMethods: ["GET"],
    },
    {
      status: 405,
      headers: {
        Allow: "GET",
      },
    },
  );
}

export async function PATCH() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "This endpoint only supports GET requests",
      allowedMethods: ["GET"],
    },
    {
      status: 405,
      headers: {
        Allow: "GET",
      },
    },
  );
}
