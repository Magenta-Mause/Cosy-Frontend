import MetricDisplay from "@components/display/MetricDisplay/MetricDisplay";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import useGameServer from "@/hooks/useGameServer/useGameServer";
import useGameServerMetrics from "@/hooks/useGameServerMetrics/useGameServerMetrics";

export const Route = createFileRoute("/server/$serverId/metrics")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();
  const { serverId } = Route.useParams();
  const gameServer = useGameServer(serverId ?? "");
  const { metrics } = useGameServerMetrics(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>{t("serverPage.notFound")}</div>;
  }
  return <MetricDisplay metrics={metrics} gameServerUuid={serverId} />;
}
