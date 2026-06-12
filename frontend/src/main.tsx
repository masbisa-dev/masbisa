import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
  routeTree,
  // Placeholder context - matches RouterContext in __root.tsx; wire live auth in Phase 5b
  context: {
    auth: {
      user: null,
      status: "loading",
    },
  },
});

// TypeScript: register router type for link/nav helpers
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </StrictMode>,
);
