import { useAuth } from "@/context/-auth-context";

// Subset of auth context for route guards / layouts (no login/logout)
export function useRouterAuth() {
  const auth = useAuth();
  return { user: auth.user, status: auth.status };
}
