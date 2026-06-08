import { Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/context/auth-context";

export function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
