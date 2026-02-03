import GameServerSettingsLayout from "@components/display/GameServer/GameServerSettings/GameServerSettingsLayout";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import useGameServer from "@/hooks/useGameServer/useGameServer";
import { useEffect } from "react";

export const Route = createFileRoute("/server/$serverId/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const { gameServer, notFound } = useGameServer(serverId ?? "");
  const navigate = useNavigate();

  useEffect(() => {
    if (notFound) {
      navigate({ to: "/server/not-found" });
    }
  }, [notFound, navigate]);

  if (notFound || !gameServer) {
    return null;
  }

  return (
    <GameServerSettingsLayout initialSettings={{ serverName: gameServer.server_name }}>
      <Outlet />
    </GameServerSettingsLayout>
  );
}
