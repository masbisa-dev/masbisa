import { createRootRouteWithContext } from "@tanstack/react-router";
import type { RouterContext } from "@/router/context";
import { RootLayout } from "./-root-layout";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
