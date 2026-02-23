import LogDisplay from "@components/display/LogDisplay/LogDisplay.tsx";
import MetricGraph from "@components/display/MetricDisplay/MetricGraph";
import { COL_SPAN_MAP } from "@components/display/MetricDisplay/metricLayout";
import { Button } from "@components/ui/button";
import { Card } from "@components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  GameServerAccessGroupDtoPermissionsItem,
  GameServerDtoStatus,
  MetricLayoutSize,
  type PrivateDashboardLayout,
  type PublicDashboardLayout,
} from "@/api/generated/model";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";
import useGameServerMetrics from "@/hooks/useGameServerMetrics/useGameServerMetrics";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions";
import useTranslationPrefix from "@/hooks/useTranslationPrefix/useTranslationPrefix";
import { DashboardElementTypes } from "@/types/dashboardTypes";
import { LayoutSize } from "@/types/layoutSize.ts";
import type { MetricsType } from "@/types/metricsTyp";

export const Route = createFileRoute("/server/$serverId/")({
  component: GameServerDetailPageDashboardPage,
});

type DashboardLayout = PublicDashboardLayout | PrivateDashboardLayout;

function GameServerDetailPageDashboardPage() {
  const { serverId } = Route.useParams();
  const { logs } = useGameServerLogs(serverId ?? "");
  const { metrics } = useGameServerMetrics(serverId ?? "");
  const { gameServer } = useGameServer(serverId ?? "");
  const { hasPermission } = useGameServerPermissions(serverId ?? "");
  const canSeePrivateDashboard = hasPermission(
    GameServerAccessGroupDtoPermissionsItem.READ_SERVER_PRIVATE_DASHBOARD,
  );
  const [isViewingPrivate, setIsViewingPrivate] = useState(true);
  const { t } = useTranslationPrefix("dashboard");
  const dashboardLayout = useMemo(() => {
    if (!gameServer) return [];
    return canSeePrivateDashboard && isViewingPrivate
      ? gameServer.private_dashboard_layouts
      : gameServer.public_dashboard.public_dashboard_layouts ?? [];
  }, [gameServer, isViewingPrivate, canSeePrivateDashboard]);
  const { canSeeMetric, canSeeLogs } = useMemo(() => {
    let metric = false;
    let logs = false;

    dashboardLayout?.forEach((dashboard) => {
      if ("public_dashboard_types" in dashboard && gameServer?.public_dashboard.public_dashboard_enabled) {
        if (dashboard.public_dashboard_types === DashboardElementTypes.METRIC) {
          metric = true;
        }
        if (dashboard.public_dashboard_types === DashboardElementTypes.LOGS) {
          logs = true;
        }
      }
    });

    return { canSeeMetric: metric, canSeeLogs: logs };
  }, [dashboardLayout, gameServer?.public_dashboard.public_dashboard_enabled]);

  const toggleView = () => setIsViewingPrivate((prev) => !prev);

  if (!gameServer) {
    return null;
  }

  const getType = (dashboardLayout: DashboardLayout) => {
    if (!dashboardLayout) return null;

    if ("private_dashboard_types" in dashboardLayout) {
      return dashboardLayout.private_dashboard_types as DashboardElementTypes;
    }

    if ("public_dashboard_types" in dashboardLayout && gameServer.public_dashboard.public_dashboard_layouts) {
      return dashboardLayout.public_dashboard_types as DashboardElementTypes;
    }

    return null;
  };

  const isServerRunning = gameServer.status === GameServerDtoStatus.RUNNING;
  const canReadMetrics = hasPermission(GameServerAccessGroupDtoPermissionsItem.READ_SERVER_METRICS) || canSeeMetric;
  const canReadLogs = hasPermission(GameServerAccessGroupDtoPermissionsItem.READ_SERVER_LOGS) || canSeeLogs;
  const canSendCommands = hasPermission(GameServerAccessGroupDtoPermissionsItem.SEND_COMMANDS);

  return (
    <>
      {canSeePrivateDashboard && (
        <div className="flex flex-row-reverse mb-3">
          <Button onClick={toggleView}>{t(`${isViewingPrivate}`)}</Button>
        </div>
      )}
      <div className="grid grid-cols-6 gap-2">
        {dashboardLayout?.map((dashboard) => {
          const dashboardType = getType(dashboard);
          const sizeClass = COL_SPAN_MAP[dashboard.size ?? MetricLayoutSize.MEDIUM];

          switch (dashboardType) {
            case DashboardElementTypes.METRIC:
              return (
                <MetricGraph
                  key={dashboard.uuid}
                  timeUnit="hour"
                  type={dashboard.metric_type as MetricsType}
                  metrics={metrics}
                  className={sizeClass}
                  canReadMetrics={canReadMetrics}
                />
              );

            case DashboardElementTypes.LOGS:
              return (
                <div key={dashboard.uuid} className={`h-95  ${sizeClass}`}>
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

            case DashboardElementTypes.FREETEXT:
              return (
                <div key={dashboard.uuid} className={`h-95  ${sizeClass}`}>
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
    </>
  );
}
