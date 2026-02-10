import GameServerDetailPageLayout from "@components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageLayout.tsx";
import { GameServerNotFoundPage } from "@components/display/GameServer/GameServerNotFoundPage/GameServerNotFoundPage";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import { useCanAccessServer } from "@/utils/routeGuards";

export const Route = createFileRoute("/server/$serverId")({
  component: GameServerDetailPage,
});

function GameServerDetailPage() {
  const { serverId } = Route.useParams();
  const { gameServer, initialized } = useGameServer(serverId ?? "");
  const hasAccess = useCanAccessServer(gameServer?.owner?.username);

  if (initialized && !gameServer) {
    return <GameServerNotFoundPage />;
  }

  if (!gameServer) {
    return null;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <GameServerDetailPageLayout gameServer={gameServer}>
      <Outlet />
    </GameServerDetailPageLayout>
  );
}
