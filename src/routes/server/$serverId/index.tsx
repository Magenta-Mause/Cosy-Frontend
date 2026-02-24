import LogDisplay from "@components/display/LogDisplay/LogDisplay.tsx";
import MetricGraph from "@components/display/MetricDisplay/MetricGraph";
import { COL_SPAN_MAP } from "@components/display/MetricDisplay/metricLayout";
import { Card } from "@components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import {
  GameServerAccessGroupDtoPermissionsItem,
  GameServerDtoStatus,
  MetricLayoutSize,
  PrivateDashboardLayoutPrivateDashboardTypes,
} from "@/api/generated/model";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";
import useGameServerMetrics from "@/hooks/useGameServerMetrics/useGameServerMetrics";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions";
import { LayoutSize } from "@/types/layoutSize.ts";
import type { MetricsType } from "@/types/metricsTyp";

export const Route = createFileRoute("/server/$serverId/")({
  component: GameServerDetailPageDashboardPage,
});

function GameServerDetailPageDashboardPage() {
  const { serverId } = Route.useParams();
  const { logs } = useGameServerLogs(serverId ?? "");
  const { metrics } = useGameServerMetrics(serverId ?? "");
  const { gameServer } = useGameServer(serverId ?? "");
  const { hasPermission } = useGameServerPermissions(serverId ?? "");

  if (!gameServer) {
    return null;
  }

  const isServerRunning = gameServer.status === GameServerDtoStatus.RUNNING;
  const canReadMetrics = hasPermission(GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS);
  const canReadLogs = hasPermission(GameServerAccessGroupDtoPermissionsItem.READ_SERVER_LOGS);
  const canSendCommands = hasPermission(GameServerAccessGroupDtoPermissionsItem.SEND_COMMANDS);

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
                className={`${COL_SPAN_MAP[dashboard.size ?? MetricLayoutSize.MEDIUM]}`}
                canReadMetrics={canReadMetrics}
              />
            );

          case PrivateDashboardLayoutPrivateDashboardTypes.LOGS:
            return (
              <div
                key={dashboard.uuid}
                className={`aspect-16/7 ${COL_SPAN_MAP[dashboard.size ?? MetricLayoutSize.MEDIUM]}`}
              >
                <LogDisplay
                  logMessages={logs}
                  showCommandInput={canSendCommands}
                  gameServerUuid={serverId}
                  isServerRunning={isServerRunning}
                  canReadLogs={canReadLogs}
                  hideTimestamps={dashboard.size === LayoutSize.SMALL ? true : undefined}
                />
              </div>
            );

          case PrivateDashboardLayoutPrivateDashboardTypes.FREETEXT:
            return (
              <div
                key={dashboard.uuid}
                className={`aspect-16/7 ${COL_SPAN_MAP[dashboard.size ?? MetricLayoutSize.MEDIUM]}`}
              >
                <Card className={`w-full h-full overflow-y-auto`} key={dashboard.uuid}>
                  <h2 className="mt-5 ml-5">{dashboard.title}</h2>
                  {dashboard.content?.map((keyValue) => (
                    <div key={dashboard.uuid} className="flex flex-col">
                      <div className="mx-5">
                        <p className="overflow-y-auto text-base font-bold bg-button-primary-default text-button-secondary-default w-fit px-2 rounded-t-md ">
                          {keyValue.key}
                        </p>
                        <p className="overflow-y-auto text-lg w-full border-2 rounded-b-md rounded-r-md px-2 ">
                          {keyValue.value}
                        </p>
                      </div>
                    </div>
                  ))}
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
