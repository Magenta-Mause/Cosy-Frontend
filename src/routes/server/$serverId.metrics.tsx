import MetricDisplay from "@components/display/MetricDisplay/MetricDisplay";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import useGameServer from "@/hooks/useGameServer/useGameServer";
import useGameServerMetrics from "@/hooks/useGameServerMetrics/useGameServerMetrics";
import { useEffect } from "react";

export const Route = createFileRoute("/server/$serverId/metrics")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const { metrics } = useGameServerMetrics(serverId ?? "");
  const { gameServer, notFound } = useGameServer(serverId ?? "");
  const navigate = useNavigate();

  useEffect(() => {
    if (notFound) {
      navigate({ to: "/server/not-found" });
    }
  }, [notFound, navigate]);

  if (notFound || !gameServer) {
    return null;
  }

  return <MetricDisplay metrics={metrics} gameServerUuid={serverId} />;
}
