import { Button } from "@components/ui/button";
import { ButtonGroup } from "@components/ui/button-group";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import React from "react";
import { useTranslation } from "react-i18next";

const RootLayout = () => {
  const { i18n } = useTranslation();

  return (
    <React.Fragment>
      <ButtonGroup className="absolute">
        <Button
          variant={"link"}
          onClick={() => {
            i18n.changeLanguage("en");
          }}
        >
          English
        </Button>
        <Button
          variant={"link"}
          onClick={() => {
            i18n.changeLanguage("de");
          }}
        >
          Deutsch
        </Button>
      </ButtonGroup>
      {/* Configure application shell here  */}
      <Outlet />

      {/* Please don't move me :'< ((if you are building a shell just keep me down here, I won't interfere!)) */}
      <ReactQueryDevtools initialIsOpen={false} />
      <TanStackRouterDevtools initialIsOpen={false} />
    </React.Fragment>
  );
};

export const Route = createRootRoute({ component: RootLayout });
