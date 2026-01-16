import LogDisplay from "@components/display/LogDisplay/LogDisplay.tsx";
import {createFileRoute} from "@tanstack/react-router";
import {useTranslation} from "react-i18next";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";

export const Route = createFileRoute("/server/$serverId/")({
  component: GameServerDetailPage,
});

function GameServerDetailPage() {
  const {t} = useTranslation();
  const {serverId} = Route.useParams();
  const gameServer = useGameServer(serverId ?? "");
  const {logs} = useGameServerLogs(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>{t("serverPage.notFound")}</div>;
  }

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div>
        <LogDisplay logMessages={logs}/>
      </div>
    </div>
  );
}
