import GameServerDetailPageLayout from "@components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageLayout.tsx";
import { GameServerNotFoundPage } from "@components/display/GameServer/GameServerNotFoundPage/GameServerNotFoundPage";
import { AuthContext } from "@components/technical/Providers/AuthProvider/AuthProvider";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useContext } from "react";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import { canAccessServer } from "@/utils/routeGuards";

export const Route = createFileRoute("/server/$serverId")({
  component: GameServerDetailPage,
});

function GameServerDetailPage() {
  const { serverId } = Route.useParams();
  const { gameServer, initialized } = useGameServer(serverId ?? "");
  const auth = useContext(AuthContext);

  if (initialized && !gameServer) {
    return <GameServerNotFoundPage />;
  }

  if (!gameServer) {
    return null;
  }

  const hasAccess = canAccessServer(
    {
      authorized: auth.authorized,
      role: auth.role,
      username: auth.username,
    },
    gameServer.owner?.username,
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
