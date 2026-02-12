import LogDisplay from "@components/display/LogDisplay/LogDisplay.tsx";
import MetricGraph from "@components/display/MetricDisplay/MetricGraph";
import { COL_SPAN_MAP } from "@components/display/MetricDisplay/metricLayout";
import { Card } from "@components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import {
  GameServerDtoStatus,
  MetricLayoutSize,
  PrivateDashboardLayoutPrivateDashboardTypes,
} from "@/api/generated/model";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";
import useGameServerMetrics from "@/hooks/useGameServerMetrics/useGameServerMetrics";
import type { MetricsType } from "@/types/metricsTyp";

export const Route = createFileRoute("/server/$serverId/")({
  component: GameServerDetailPageDashboardPage,
});

function GameServerDetailPageDashboardPage() {
  const { serverId } = Route.useParams();
  const { logs } = useGameServerLogs(serverId ?? "");
  const { metrics } = useGameServerMetrics(serverId ?? "");
  const { gameServer } = useGameServer(serverId ?? "");

  if (!gameServer) {
    return null;
  }

  const isServerRunning = gameServer.status === GameServerDtoStatus.RUNNING;

  return (
    <div className="grid grid-cols-6 gap-2">
      {gameServer.private_dashboard_layouts?.map((dashboard) => {
        switch (dashboard.private_dashboard_types) {
          case PrivateDashboardLayoutPrivateDashboardTypes.METRIC:
            return (
              <MetricGraph
                key={dashboard.uuid}
                timeUnit="hour"
                type={dashboard.metric_type as MetricsType}
                metrics={metrics}
              />
            );

          case PrivateDashboardLayoutPrivateDashboardTypes.LOGS:
            return (
              <div
                key={dashboard.uuid}
                className={`h-95  ${COL_SPAN_MAP[dashboard.size ?? MetricLayoutSize.MEDIUM]}`}
              >
                <LogDisplay
                  logMessages={logs}
                  showCommandInput={false}
                  gameServerUuid={serverId}
                  isServerRunning={isServerRunning}
                />
              </div>
            );

          case PrivateDashboardLayoutPrivateDashboardTypes.FREETEXT:
            return (
              <div key={dashboard.uuid} className={`h-50  ${COL_SPAN_MAP[dashboard.size ?? MetricLayoutSize.MEDIUM]}`}>
                <Card className="w-full h-full" key={dashboard.uuid}>
                  <div className="p-4">{dashboard.content}</div>
                </Card>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
