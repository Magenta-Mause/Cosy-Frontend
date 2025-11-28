import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/redirected/$counter")({
  component: Redirected,
});

function Redirected() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { counter } = Route.useParams();

  const goBack = () => {
    navigate({
      to: "/",
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
      <Card
        className="
        px-5
      "
      >
        {counter > 0 ? (
          <p className="text-center">
            {t("redirected.warning")}
            <br />
            {t("redirected.consequence", { counter })}
          </p>
        ) : (
          <p className="text-center">
            {t("redirected.warning")}
            <br />
            {t("redirected.noConsequence")}
          </p>
        )}
        <Button onClick={goBack}>{t("redirected.earnMoreClicks")}</Button>
      </Card>
    </div>
  );
}

export default Redirected;
