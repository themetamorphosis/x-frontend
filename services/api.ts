class RetryableError extends Error {
  noRetry = false;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || (() => {
  if (!__DEV__) {
    throw new Error("EXPO_PUBLIC_API_URL must be set in production");
  }
  return "http://localhost:8000";
})();
const API_PREFIX = "/api/v1";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

/** Callback invoked when a 401 is received. Set by authStore. */
type UnauthorizedHandler = () => void;

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private onUnauthorized: UnauthorizedHandler | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  setOnUnauthorized(handler: UnauthorizedHandler) {
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

        // Handle 401 Unauthorized — trigger logout
        if (response.status === 401) {
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
          throw new Error("Unauthorized");
        }

        // Handle 429 Rate Limit — respect Retry-After header
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const delay = retryAfter
            ? parseInt(retryAfter, 10) * 1000
            : BASE_DELAY_MS * Math.pow(2, attempt);
          if (attempt < MAX_RETRIES - 1) {
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
          throw new Error("Rate limited. Please try again later.");
        }

        if (!response.ok) {
          // Validate content type before parsing
          const contentType = response.headers.get("content-type") || "";
          let errMessage: string;
          if (contentType.includes("application/json")) {
            const error = await response.json().catch(() => ({ detail: "Request failed" }));
            errMessage = error.detail || `HTTP ${response.status}`;
          } else {
            errMessage = `HTTP ${response.status}`;
          }
          const err = new RetryableError(errMessage);
          if (response.status >= 400 && response.status < 500) {
            err.noRetry = true;
          }
          throw err;
        }

        // Validate content type for success responses
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error("Unexpected response format from server");
        }

        return response.json();
      } catch (err) {
        clearTimeout(timeoutId);

        // Handle AbortError (timeout) — don't retry, fail immediately
        if (err instanceof Error && err.name === "AbortError") {
          throw new Error("Request timed out");
        }

        lastError = err as Error;

        // Don't retry on 401 or client errors (4xx)
        if (lastError.message === "Unauthorized" || (lastError instanceof RetryableError && lastError.noRetry)) {
          throw lastError;
        }

        // Retry with exponential backoff
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
