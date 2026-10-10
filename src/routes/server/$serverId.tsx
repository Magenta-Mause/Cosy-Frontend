import GameServerDetailPageLayout from "@/components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageLayout.tsx";
import { GameServerNotFoundPage } from "@/components/display/GameServer/GameServerNotFoundPage/GameServerNotFoundPage";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import { validateTimeRangeSearch } from "@/lib/timeRange.ts";

export const Route = createFileRoute("/server/$serverId")({
  // The time range is shared by all server views, so it is declared on the layout route.
  validateSearch: validateTimeRangeSearch,
  component: GameServerDetailPage,
});

function GameServerDetailPage() {
  const { serverId } = Route.useParams();
  const { gameServer, initialized } = useGameServer(serverId ?? "");

  if (initialized && !gameServer) {
    return <GameServerNotFoundPage />;
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
