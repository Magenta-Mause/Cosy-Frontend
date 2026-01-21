import LogDisplay from "@components/display/LogDisplay/LogDisplay.tsx";
import MetricDisplay from "@components/display/MetricDisplay/MetricDisplay";
import MetricGraph from "@components/display/MetricDisplay/MetricGraph";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";
import useGameServerMetrics from "@/hooks/useGameServerMetrics/useGameServerMetrics";

export const Route = createFileRoute("/server/$serverId/")({
  component: GameServerDetailPageDashboardPage,
});

function GameServerDetailPageDashboardPage() {
  const { t } = useTranslation();
  const { serverId } = Route.useParams();
  const gameServer = useGameServer(serverId ?? "");
  const { logs } = useGameServerLogs(serverId ?? "");
  const { metrics } = useGameServerMetrics(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>{t("serverPage.notFound")}</div>;
  }

  return (
    <div className="container mx-auto flex flex-col gap-4 h-[30vh]">
      <div className="flex flex-row gap-2 grow">
        <MetricGraph className="w-[50%]" unit={"hour"} type={"cpu_percent"} metrics={metrics} />
        <LogDisplay logMessages={logs} className="grow" />
      </div>
    </div>
  );
}
