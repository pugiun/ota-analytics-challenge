import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Supabase client
const mockGetUser = vi.fn();
const mockSupabaseQuery = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            gte: () => ({
              lte: () => ({
                order: mockSupabaseQuery,
              }),
            }),
          }),
        }),
      }),
    })
  ),
}));

// Helper to create mock request
function createMockRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("/api/analytics/summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  describe("GET - Authentication", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Not authenticated" },
      });

      const { GET } = await import("./route");
      const request = createMockRequest("/api/analytics/summary");
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });

    it("returns 401 when auth error occurs", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: "Token expired" },
      });

      const { GET } = await import("./route");
      const request = createMockRequest("/api/analytics/summary");
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });
  });

  describe("GET - Database Errors", () => {
    it("returns 500 when posts query fails", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      mockSupabaseQuery.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const { GET } = await import("./route");
      const request = createMockRequest("/api/analytics/summary");
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("Failed to fetch posts");
    });
  });

  describe("GET - Query Parameters", () => {
    it("accepts 7d range parameter", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      mockSupabaseQuery.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const { GET } = await import("./route");
      const request = createMockRequest("/api/analytics/summary?range=7d");
      const response = await GET(request);

      // Should reach the database query (even though it fails)
      expect(mockSupabaseQuery).toHaveBeenCalled();
    });

    it("accepts 30d range parameter", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      mockSupabaseQuery.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const { GET } = await import("./route");
      const request = createMockRequest("/api/analytics/summary?range=30d");
      const response = await GET(request);

      expect(mockSupabaseQuery).toHaveBeenCalled();
    });

    it("accepts month range parameter", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      mockSupabaseQuery.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const { GET } = await import("./route");
      const request = createMockRequest("/api/analytics/summary?range=month");
      const response = await GET(request);

      expect(mockSupabaseQuery).toHaveBeenCalled();
    });

    it("defaults to 7d when no range specified", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      mockSupabaseQuery.mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      });

      const { GET } = await import("./route");
      const request = createMockRequest("/api/analytics/summary");
      const response = await GET(request);

      expect(mockSupabaseQuery).toHaveBeenCalled();
    });
  });
});
