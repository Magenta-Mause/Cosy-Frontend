import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import ProviderCollection from "@components/technical/Providers/ProviderCollection.tsx";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";

const router = createRouter({ routeTree });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProviderCollection>
      <RouterProvider router={router} />
    </ProviderCollection>
  </StrictMode>,
);
