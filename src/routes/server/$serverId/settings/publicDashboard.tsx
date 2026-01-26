import PublicDashboardSettingsSection from "@components/display/GameServer/GameServerSettings/sections/PublicDashboardSettingsSection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/server/$serverId/settings/publicDashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PublicDashboardSettingsSection />;
}
