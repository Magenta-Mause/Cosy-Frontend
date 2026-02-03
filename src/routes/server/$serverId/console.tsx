import LogDisplay from "@components/display/LogDisplay/LogDisplay.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { GameServerDtoStatus } from "@/api/generated/model";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";

export const Route = createFileRoute("/server/$serverId/console")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { serverId } = Route.useParams();
  const gameServer = useGameServer(serverId ?? "");
  const { logs } = useGameServerLogs(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>{t("serverPage.notFound")}</div>;
  }

  const isServerRunning = gameServer.status === GameServerDtoStatus.RUNNING;

  return (
    <div className="container mx-auto flex flex-col gap-4 grow h-full">
      <LogDisplay 
        logMessages={logs} 
        showCommandInput={true} 
        gameServerUuid={serverId}
        isServerRunning={isServerRunning}
      />
    </div>
  );
}
