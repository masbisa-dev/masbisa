// Backend base URL - falls back to local Django dev server
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// Typed HTTP error so callers can branch on status (e.g. 401 vs 403)
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Safely parse JSON; DJ often returns 204 No Content on logout
async function parseBody<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};

// Read csrftoken from document.cookie (set by GET /api/auth/csrf)
function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Call once on app load so Django sets the csrftoken cookie before any POST
export async function bootstrapCsrf(): Promise<void> {
  await fetch(`${baseURL}/api/auth/csrf`, { credentials: "include" });
}

// Build CSRF header for mutating methods; bootstrap if cookie is missing
async function csrfHeaders(method: string): Promise<Record<string, string>> {
  const mutating = !["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase());
  if (!mutating) {
    return {};
  }

  let token = getCsrfToken();
  if (!token) {
    await bootstrapCsrf();
    token = getCsrfToken();
  }

  return token ? { "X-CSRFToken": token } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? "GET";
  const hasBody = init?.body != null;

  const res = await fetch(`${baseURL}${path}`, {
    // Required for Django session cookies to be sent cross-origin
    credentials: "include",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(await csrfHeaders(method)),
      ...init?.headers,
    },
    ...init,
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await parseBody<{ detail?: string }>(res);
      if (body?.detail) {
        message = body.detail;
      }
    } catch {
      // Response body wasn't JSON - keep default statusText
    }
    throw new ApiError(res.status, message);
  }
  return parseBody<T>(res);
}
