import AccessManagementSettingsSection from "@components/display/GameServer/GameServerSettings/sections/AccessManagementSettingsSection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/server/$serverId/settings/access-management")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AccessManagementSettingsSection />;
}
