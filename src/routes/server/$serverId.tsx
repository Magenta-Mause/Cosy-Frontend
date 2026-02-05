import GameServerDetailPageLayout from "@components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageLayout.tsx";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import { canAccessServer } from "@/utils/routeGuards";

export const Route = createFileRoute("/server/$serverId")({
  component: GameServerDetailPage,
});

function GameServerDetailPage() {
  const { t } = useTranslation();
  const { serverId } = Route.useParams();
  const gameServer = useGameServer(serverId ?? "");
  const auth = useContext(AuthContext);
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (gameServer) {
      const hasAccess = canAccessServer(
        {
          authorized: auth.authorized,
          role: auth.role,
          username: auth.username,
        },
        gameServer.owner?.username
      );

      if (!hasAccess) {
        navigate({ to: "/" });
      }
    }
  }, [gameServer, auth.authorized, auth.role, auth.username, navigate]);

  if (!serverId || !gameServer) {
    return <div>{t("serverPage.notFound")}</div>;
  }

  const hasAccess = canAccessServer(
    {
      authorized: auth.authorized,
      role: auth.role,
      username: auth.username,
    },
    gameServer.owner?.username
  );

  if (!hasAccess) {
    return null;
  }

  return (
    <GameServerDetailPageLayout gameServer={gameServer}>
      <Outlet />
    </GameServerDetailPageLayout>
  );
}
