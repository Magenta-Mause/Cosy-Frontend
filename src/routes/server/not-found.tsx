import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { Button } from "@components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslationPrefix("serverPage");

  return (
    <div className="flex flex-col items-center justify-center h-screen ">
      <div className="flex flex-col items-center gap-4">
        <span className="text-xl">{t("notFound")}</span>
        <Button
          onClick={() => {
            navigate({ to: "/" });
          }}
        >
          {t("notFoundGoBack")}
        </Button>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/server/not-found")({
  component: NotFoundPage,
});
