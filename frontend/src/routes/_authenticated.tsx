import { createFileRoute } from "@tanstack/react-router";
import AuthenticatedLayout from "./-authenticated";

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
