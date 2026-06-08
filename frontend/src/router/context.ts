import type { AuthStatus, User } from "@/types/auth";

// Shape passed to createRouter({ context }) in Phase 5b
export type RouterContext = {
  auth: {
    user: User | null;
    status: AuthStatus;
  };
};
