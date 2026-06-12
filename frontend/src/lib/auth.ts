import { api } from "@/lib/api";
import type { User } from "@/types/auth";

// POST /api/auth/login/ - sets session cookie; response body is a token key or empty
export async function login(email: string, password: string): Promise<void> {
  await api.post<{ key?: string }>("/api/auth/login/", { email, password });
}

// POST /api/auth/logout/ - invalidates the Django session
export async function logout(): Promise<void> {
  await api.post<void>("/api/auth/logout/", {});
}

// GET /api/auth/user/ - returns current user; throws ApiError 401 if not logged in
export async function getCurrentUser(): Promise<User> {
  return api.get<User>("/api/auth/user/");
}
