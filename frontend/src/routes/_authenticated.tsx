import { useRouterAuth } from "@/router/use-router-auth";
import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";

// Pathless layout — guards child routes; unauthenticated users go to /login
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    // Capture pathname before any redirect — useRouterState would read /login mid-navigation
    const path = location.pathname;
    return {
      redirectAfterLogin: path !== "/" ? path : undefined,
    };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, status } = useRouterAuth();
  const { redirectAfterLogin } = Route.useRouteContext();

  if (status === "loading") {
    return <div>Checking session…</div>;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        search={{ redirect: redirectAfterLogin }}
        replace
      />
    );
  }

  return <Outlet />;
}
