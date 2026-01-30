import PrivateDashboardSettingsSection from "@components/display/GameServer/GameServerSettings/sections/PrivateDashboardSettingsSection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/server/$serverId/settings/private-dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return <PrivateDashboardSettingsSection />;
}
