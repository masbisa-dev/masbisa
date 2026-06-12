import { createFileRoute } from "@tanstack/react-router";
import { LoginRoute } from "./-login";

// Public login route — optional ?redirect= path to return after sign-in
export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === "string" && search.redirect.startsWith("/")
        ? search.redirect
        : undefined,
  }),
  component: LoginRoute,
});
