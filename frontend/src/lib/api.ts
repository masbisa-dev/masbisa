// Backend base URL - falls back to local Django dev server
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// Field-level errors from DRF serializers , e.g. {email: ["Email is required"]}
export type ApiFieldErrors = Record<string, string[]>;

// Typed HTTP error so callers can branch on status (e.g. 401 vs 403)
export class ApiError extends Error {
  status: number;
  // Populated when the server returns per-field validation errors
  fieldErrors?: ApiFieldErrors

  constructor(status: number, message: string, fieldErrors?: ApiFieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors
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

// Turn DRF/dj-rest-auth error bodies into a banner message + optional field map
export function parseApiError(body: unknown): {
  message: string,
  fieldErrors?: ApiFieldErrors;
} {
  if (body == null ){
    return {message: "Request failed"}
  }

  // {detail: "..."} - common for 401/403/404
  if (typeof body === "object" && "detail" in body) {
    const detail = (body as {detail: unknown }).detail;
    if (typeof detail === "string") {
      return {message: detail};
    }
    if (Array.isArray(detail) && typeof detail[0] === "string") {
      return {message: detail[0]}
    }
  }

  // ["Incorrect email or password."] - non-field ValidationError from DRF
  if (Array.isArray(body) && typeof body[0] === 'string') {
    return {message: body[0]}
  }

  // {email: ["..."], password: ["..."]} - field ValidationError from DRF
  if (typeof body === "object" && !Array.isArray(body)) {
    const fieldErrors: ApiFieldErrors = {};
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      if (Array.isArray(value) && typeof value[0] === "string") {
        fieldErrors[key] = value as string[];
      }
    }
    if (Object.keys(fieldErrors).length > 0) {
      // Banner shows the first field error; fieldErrors available for per-input UI later
      const first = Object.values(fieldErrors)[0]?.[0];
      return {
        message: first ?? "Validation failed",
        fieldErrors,
      }
    }
  }

  return {message: "Request failed"}
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
    let fieldErrors: ApiFieldErrors | undefined;
    try {
      const body = await parseBody<unknown>(res);
      const parsed = parseApiError(body);
      message = parsed.message;
      fieldErrors = parsed.fieldErrors;
    } catch {
      // Response body wasn't JSON - keep default statusText
    }
    throw new ApiError(res.status, message, fieldErrors);
  }
  return parseBody<T>(res);
}
