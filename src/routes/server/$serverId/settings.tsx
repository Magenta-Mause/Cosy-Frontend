import GameServerSettingsLayout from "@components/display/GameServer/GameServerSettings/GameServerSettingsLayout";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import useGameServer from "@/hooks/useGameServer/useGameServer";

export const Route = createFileRoute("/server/$serverId/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { serverId } = Route.useParams();
  const gameServer = useGameServer(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>{t("serverPage.notFound")}</div>;
  }

  return (
    <GameServerSettingsLayout initialSettings={{ serverName: gameServer.server_name }}>
      <Outlet />
    </GameServerSettingsLayout>
  );
}
