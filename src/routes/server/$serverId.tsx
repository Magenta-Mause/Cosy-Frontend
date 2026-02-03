import GameServerDetailPageLayout from "@components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageLayout.tsx";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";

export const Route = createFileRoute("/server/$serverId")({
  component: GameServerDetailPage,
});

function GameServerDetailPage() {
  const navigate = useNavigate();
  const { serverId } = Route.useParams();
  const gameServer = useGameServer(serverId ?? "");

  if (!serverId || !gameServer) {
    navigate({ to: "/server/not-found" });
    return null;
  }

  return (
    <GameServerDetailPageLayout gameServer={gameServer}>
      <Outlet />
    </GameServerDetailPageLayout>
  );
}
