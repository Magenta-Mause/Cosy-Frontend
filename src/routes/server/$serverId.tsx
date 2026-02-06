import GameServerDetailPageLayout from "@components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageLayout.tsx";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { Button } from "@components/ui/button";

export const Route = createFileRoute("/server/$serverId")({
  component: GameServerDetailPage,
});

function GameServerDetailPage() {
  const { serverId } = Route.useParams();
  const { gameServer, initialized } = useGameServer(serverId ?? "");
  const navigate = Route.useNavigate();
  const { t } = useTranslationPrefix("serverPage");

  if (initialized && !gameServer) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
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
  }

  if (!gameServer) {
    return null;
  }

  return (
    <GameServerDetailPageLayout gameServer={gameServer}>
      <Outlet />
    </GameServerDetailPageLayout>
  );
}
