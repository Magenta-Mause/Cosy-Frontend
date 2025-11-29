import { Button } from "@components/ui/button";
import { ButtonGroup } from "@components/ui/button-group";
import { createRootRoute, Outlet } from "@tanstack/react-router";
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
    </React.Fragment>
  );
};

export const Route = createRootRoute({ component: RootLayout });
