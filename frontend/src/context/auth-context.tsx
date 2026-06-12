import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, bootstrapCsrf } from "@/lib/api";
import * as authApi from "@/lib/auth";
import type { AuthStatus, User } from "@/types/auth";
import { AuthContext } from "./-auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // On mount: set CSRF cookie, then try to restore session from existing cookie
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await bootstrapCsrf();
        const currentUser = await authApi.getCurrentUser();
        if (!cancelled) {
          setUser(currentUser);
          setStatus("authenticated");
        }
      } catch {
        // 401 or network error - no active session
        if (!cancelled) {
          setUser(null);
          setStatus("unauthenticated");
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await authApi.login(email, password);
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // Session may already be expired — still clear local state unless unexpected error
      if (!(err instanceof ApiError) || err.status !== 401) {
        throw err;
      }
    }
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo(
    () => ({ user, status, login, logout }),
    [user, status, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
