import LogDisplay from "@components/display/LogDisplay/LogDisplay.tsx";
import { Button } from "@components/ui/button.tsx";
import { createFileRoute } from "@tanstack/react-router";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { stopService } from "@/api/generated/backend-api.ts";
import { GameServerDtoStatus } from "@/api/generated/model";
import { startServiceSse } from "@/api/sse.ts";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";

export const Route = createFileRoute("/server/$serverId")({
  component: GameServerDetailPage,
});

const statusColors: Record<string, string> = {
  [GameServerDtoStatus.RUNNING]: "bg-green-500",
  [GameServerDtoStatus.STARTING]: "bg-yellow-500 animate-pulse",
  [GameServerDtoStatus.SHUTTING_DOWN]: "bg-orange-500 animate-pulse",
  [GameServerDtoStatus.STOPPED]: "bg-gray-500",
  [GameServerDtoStatus.FAILED]: "bg-red-500",
};

function GameServerDetailPage() {
  const { serverId } = Route.useParams();
  const { t } = useTranslation();
  const gameServer = useGameServer(serverId ?? "");
  const gameServerLogs = useGameServerLogs(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>{t("serverDetailPage.notFound")}</div>;
  }

  const statusKey = `serverStatus.${gameServer.status}` as const;

  return (
    <div className="container mx-auto py-20 flex flex-col gap-4">
      <div className="flex flex-row gap-2 items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xl font-semibold">{gameServer.server_name}</p>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            <div className={clsx("w-2 h-2 rounded-full", statusColors[gameServer.status])} />
            <span className="text-sm">{t(statusKey)}</span>
          </div>
        </div>
        <div className={"gap-5 flex flex-row"}>
          <Button
            onClick={() => {
              startServiceSse(gameServer.uuid);
            }}
            disabled={
              gameServer.status === GameServerDtoStatus.STARTING ||
              gameServer.status === GameServerDtoStatus.RUNNING
            }
          >
            {t("serverDetailPage.start")}
          </Button>
          <Button
            onClick={() => {
              stopService(gameServer.uuid);
            }}
            disabled={
              gameServer.status === GameServerDtoStatus.SHUTTING_DOWN ||
              gameServer.status === GameServerDtoStatus.STOPPED
            }
          >
            {t("serverDetailPage.stop")}
          </Button>
        </div>
      </div>
      <div>
        <LogDisplay logMessages={gameServerLogs} />
      </div>
    </div>
  );
}
