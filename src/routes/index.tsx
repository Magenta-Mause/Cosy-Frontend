import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t } = useTranslation();
  const [counter, setCounter] = useState(0);
  const navigate = useNavigate();

  const increaseCounter = () => {
    setCounter((c) => ++c);
  };

  const redirectUser = () => {
    navigate({
      to: `/redirected/$counter`,
      params: {
        counter,
      },
    });
  };

  return (
    <div
      className="
      h-screen
      w-screen
      flex
      flex-row
      justify-center
      items-center
    "
    >
      {/*
        (maybe) TODO: change Card component
        s.t. side padding is automatically enforced
      */}
      <Card
        className="
            px-5
            w-fit
            flex
            flex-col
            items-center
            "
      >
        <span>
          {t("index.clickCounter")}: {counter}
        </span>
        <div
          className="
          flex
          flex-row
          gap-5
        "
        >
          <Button onClick={increaseCounter}>{t("index.clickBtn")}</Button>
          <Button onClick={redirectUser}>{t("index.dontClickBtn")}</Button>
        </div>
      </Card>
    </div>
  );
}

export default Index;
