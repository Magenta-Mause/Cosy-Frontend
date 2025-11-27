import { createRootRoute, Outlet } from "@tanstack/react-router";
import React from "react";

const RootLayout = () => (
  <React.Fragment>
    {/* Configure application shell here  */}
    <Outlet />
  </React.Fragment>
);

export const Route = createRootRoute({ component: RootLayout });
