// Shape returned by GET /api/auth/user/ (via UserSerializer)
export type User = {
  id: string;
  email: string;
  name?: string;
};

// Tracks bootstrap + session state in AuthProvider
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
