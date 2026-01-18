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

describe("/api/metrics/daily", () => {
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
      const request = createMockRequest("/api/metrics/daily");
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });
  });

  describe("GET - Validation", () => {
    it("returns 400 for invalid range parameter", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const { GET } = await import("./route");
      const request = createMockRequest("/api/metrics/daily?range=invalid");
      const response = await GET(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain("Invalid range parameter");
    });
  });

  describe("HTTP Method handlers", () => {
    it("returns 405 for POST requests", async () => {
      const { POST } = await import("./route");
      const response = await POST();
      const body = await response.json();

      expect(response.status).toBe(405);
      expect(body.error).toBe("Method not allowed");
      expect(body.allowedMethods).toContain("GET");
    });

    it("returns 405 for PUT requests", async () => {
      const { PUT } = await import("./route");
      const response = await PUT();
      const body = await response.json();

      expect(response.status).toBe(405);
      expect(body.error).toBe("Method not allowed");
    });

    it("returns 405 for DELETE requests", async () => {
      const { DELETE } = await import("./route");
      const response = await DELETE();
      const body = await response.json();

      expect(response.status).toBe(405);
      expect(body.error).toBe("Method not allowed");
    });

    it("returns 405 for PATCH requests", async () => {
      const { PATCH } = await import("./route");
      const response = await PATCH();
      const body = await response.json();

      expect(response.status).toBe(405);
      expect(body.error).toBe("Method not allowed");
    });
  });
});
