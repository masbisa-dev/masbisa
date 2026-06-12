import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "./-index";

export const Route = createFileRoute("/_authenticated/")({
  component: HomePage,
});
