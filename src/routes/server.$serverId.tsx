import LogDisplay from "@components/display/LogDisplay/LogDisplay.tsx";
import { Button } from "@components/ui/button.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { stopService } from "@/api/generated/backend-api.ts";
import { GameServerDtoStatus } from "@/api/generated/model";
import { startServiceSse } from "@/api/sse.ts";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";
import { useTypedSelector } from "@/stores/rootReducer.ts";

export const Route = createFileRoute("/server/$serverId")({
  component: GameServerDetailPage,
});

function GameServerDetailPage() {
  const { t } = useTranslation();
  const { serverId } = Route.useParams();
  const gameServer = useGameServer(serverId ?? "");
  const { logs } = useGameServerLogs(serverId ?? "");
  const pullProgressMap = useTypedSelector((state) => state.gameServerSliceReducer.pullProgress);

  if (!serverId || !gameServer) {
    return <div>{t("serverPage.notFound")}</div>;
  }
  
  const progress = pullProgressMap[gameServer.uuid];

  let buttonProps = null;
  if (gameServer.status === GameServerDtoStatus.RUNNING) {
    buttonProps = {
      onClick: () => stopService(gameServer.uuid),
      children: t("serverPage.stop"),
    };
  } else if (
    gameServer.status === GameServerDtoStatus.STOPPED ||
    gameServer.status === GameServerDtoStatus.FAILED
  ) {
    buttonProps = {
      onClick: () => startServiceSse(gameServer.uuid),
      children: t("serverPage.start"),
    };
  } else if (gameServer.status === GameServerDtoStatus.PULLING_IMAGE) {
    buttonProps = {
      disabled: true,
      children: progress ? (
        <>
          {progress.status}
          {progress.id && ` - Layer ${progress.id}`}
          {progress.current && progress.total
            ? ` (${Math.round(
                (progress.current / progress.total) * 100
              )}%)`
            : ""}
        </>
      ) : (
        "Pulling Image..."
      ),
    };
  }

  return (
    <div className="container mx-auto py-20 flex flex-col gap-4">
      <div className="flex flex-row gap-2 items-center justify-between">
        <p>{gameServer.server_name}</p>
        <div className={"gap-5 flex flex-row items-center"}>
          <p className="text-sm font-medium">Status: {gameServer.status}</p>
          {buttonProps && <Button {...buttonProps} />}
        </div>
      </div>
      <div>
        <LogDisplay logMessages={logs} />
      </div>
    </div>
  );
}
