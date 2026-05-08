const mockFetch = jest.fn();
Object.defineProperty(globalThis, "fetch", { value: mockFetch, writable: true });

const jsonHeaders = { get: (key: string) => key === "content-type" ? "application/json" : null };

import { api } from "../../services/api";

describe("ApiClient", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    api.setToken(null);
    api.setOnUnauthorized(() => {});
  });

  describe("setToken", () => {
    it("sets token for subsequent requests", async () => {
      api.setToken("mytoken");
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: jsonHeaders,
        json: () => Promise.resolve({ data: "ok" }),
      });
      await api.get("/test");
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers["Authorization"]).toBe("Bearer mytoken");
    });

    it("omits Authorization when token is null", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: jsonHeaders,
        json: () => Promise.resolve({}),
      });
      await api.get("/test");
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers["Authorization"]).toBeUndefined();
    });
  });

  describe("request methods", () => {
    it("sends GET request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: jsonHeaders,
        json: () => Promise.resolve({ items: [] }),
      });
      const result = await api.get("/items");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/items"),
        expect.objectContaining({ method: "GET" })
      );
      expect(result).toEqual({ items: [] });
    });

    it("sends POST request with body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: jsonHeaders,
        json: () => Promise.resolve({ id: "1" }),
      });
      await api.post("/items", { name: "test" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/items"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "test" }),
        })
      );
    });

    it("sends PUT request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: jsonHeaders,
        json: () => Promise.resolve({}),
      });
      await api.put("/items/1", { name: "updated" });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/items/1"),
        expect.objectContaining({ method: "PUT" })
      );
    });

    it("sends DELETE request", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: jsonHeaders,
        json: () => Promise.resolve({}),
      });
      await api.delete("/items/1");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/items/1"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("content-type validation", () => {
    it("rejects non-JSON success responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => "text/html" },
        json: () => Promise.resolve({}),
      });
      await expect(api.get("/test")).rejects.toThrow("Unexpected response format");
    });

    it("handles non-JSON error responses gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        headers: { get: () => "text/html" },
        json: () => Promise.resolve({}),
      });
      await expect(api.get("/test")).rejects.toThrow("HTTP 502");
    });
  });

  describe("error handling", () => {
    it("calls onUnauthorized on 401", async () => {
      const handler = jest.fn();
      api.setOnUnauthorized(handler);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        headers: jsonHeaders,
        json: () => Promise.resolve({}),
      });
      await expect(api.get("/protected")).rejects.toThrow("Unauthorized");
      expect(handler).toHaveBeenCalled();
    });

    it("does not retry on 401", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        headers: jsonHeaders,
        json: () => Promise.resolve({}),
      });
      await expect(api.get("/protected")).rejects.toThrow();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("retry logic", () => {
    it("retries on network error up to 3 times", async () => {
      mockFetch
        .mockRejectedValueOnce(new Error("Network fail"))
        .mockRejectedValueOnce(new Error("Network fail"))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: jsonHeaders,
          json: () => Promise.resolve({ success: true }),
        });
      const result = await api.get("/flaky");
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ success: true });
    });

    it("throws after exhausting retries", async () => {
      mockFetch.mockRejectedValue(new Error("Network fail"));
      await expect(api.get("/down")).rejects.toThrow("Network fail");
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});
