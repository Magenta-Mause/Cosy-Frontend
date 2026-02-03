import GameServerDetailPageLayout from "@components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageLayout.tsx";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";

export const Route = createFileRoute("/server/$serverId")({
  component: GameServerDetailPage,
});

function GameServerDetailPage() {
  const navigate = Route.useNavigate();
  const { serverId } = Route.useParams();
  const gameServer = useGameServer(serverId ?? "");

  useEffect(() => {
    if (!serverId || !gameServer) {
      navigate({ to: "/server/not-found" });
    }
  }, [serverId, gameServer, navigate]);

  if (!serverId || !gameServer) {
    return null;
  }

  return (
    <GameServerDetailPageLayout gameServer={gameServer}>
      <Outlet />
    </GameServerDetailPageLayout>
  );
}
