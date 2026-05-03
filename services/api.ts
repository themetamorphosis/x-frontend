const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIX = "/api/v1";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private onUnauthorized: (() => void) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  setOnUnauthorized(handler: () => void) {
    this.onUnauthorized = handler;
  }

  async rawRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
    return this.request<T>(method, path, body);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const fullUrl = `${this.baseUrl}${API_PREFIX}${path}`;
        const response = await fetch(fullUrl, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 401) {
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
          throw new Error("Unauthorized");
        }

        if (!response.ok) {
          const error = await response.json().catch(() => ({ detail: "Request failed" }));
          const errMessage = error.detail || `HTTP ${response.status}`;
          const err = new Error(errMessage);
          if (response.status >= 400 && response.status < 500) {
            (err as any)._noRetry = true;
          }
          throw err;
        }

        return response.json();
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err as Error;

        if (lastError.name === "AbortError") {
          lastError = new Error("Request timed out");
        }

        if (lastError.message === "Unauthorized" || (lastError as any)._noRetry) {
          throw lastError;
        }

        if (attempt < MAX_RETRIES - 1) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error("Request failed after retries");
  }

  get<T>(path: string) {
    return this.request<T>("GET", path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>("POST", path, body);
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>("PUT", path, body);
  }

  delete<T>(path: string) {
    return this.request<T>("DELETE", path);
  }
}

export const api = new ApiClient(API_URL);
