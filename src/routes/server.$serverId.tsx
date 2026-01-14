import LogDisplay from "@components/display/LogDisplay/LogDisplay.tsx";
import { Button } from "@components/ui/button.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { stopService } from "@/api/generated/backend-api.ts";
import { GameServerDtoStatus } from "@/api/generated/model";
import { startServiceSse } from "@/api/sse.ts";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";

export const Route = createFileRoute("/server/$serverId")({
  component: GameServerDetailPage,
});

function GameServerDetailPage() {
  const { t } = useTranslation();
  const { serverId } = Route.useParams();
  const gameServer = useGameServer(serverId ?? "");
  const { logs } = useGameServerLogs(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>{t("serverPage.notFound")}</div>;
  }

  return (
    <div className="container mx-auto py-20 flex flex-col gap-4">
      <div className="flex flex-row gap-2 items-center justify-between">
        <p>{gameServer.server_name}</p>
        <div className={"gap-5 flex flex-row"}>
          {gameServer.status === GameServerDtoStatus.RUNNING && (
            <Button
              onClick={() => {
                stopService(gameServer.uuid);
              }}
            >
              {t("serverPage.stop")}
            </Button>
          )}
          {(gameServer.status === GameServerDtoStatus.STOPPED ||
            gameServer.status === GameServerDtoStatus.FAILED) && (
            <Button
              onClick={() => {
                startServiceSse(gameServer.uuid);
              }}
            >
              {t("serverPage.start")}
            </Button>
          )}
          {gameServer.status === GameServerDtoStatus.PULLING_IMAGE && (
            <Button disabled>Pulling Image...</Button>
          )}
        </div>
      </div>
      <div>
        <LogDisplay logMessages={logs} />
      </div>
    </div>
  );
}
