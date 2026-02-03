import GameServerDetailPageLayout from "@components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageLayout.tsx";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";

export const Route = createFileRoute("/server/$serverId")({
  component: GameServerDetailPage,
});

function GameServerDetailPage() {
  const navigate = Route.useNavigate();
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
