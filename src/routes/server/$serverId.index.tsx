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

export const Route = createFileRoute("/server/$serverId/")({
  component: GameServerDetailPage,
});

function GameServerDetailPage() {
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";

export const Route = createFileRoute("/server/$serverId/")({
  component: GameServerDetailPageDashboardPage,
});

function GameServerDetailPageDashboardPage() {
  const { t } = useTranslation();
  const { serverId } = Route.useParams();
  const gameServer = useGameServer(serverId ?? "");
  const { logs } = useGameServerLogs(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>{t("serverPage.notFound")}</div>;
  }

  return (
    <div className="container mx-auto flex flex-col gap-4 h-[30vh]">
      <div className="flex flex-row gap-2 grow">
        <div className="grow bg-gray-500 h-full"></div>
        <LogDisplay logMessages={logs} className="grow" />
      </div>
    </div>
  );
}
