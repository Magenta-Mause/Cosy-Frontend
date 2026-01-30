import MetricsSettingsSection from "@components/display/GameServer/GameServerSettings/sections/MetricsSettingsSection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/server/$serverId/settings/metrics")({
  component: RouteComponent,
});

function RouteComponent() {
  return <MetricsSettingsSection />;
}
