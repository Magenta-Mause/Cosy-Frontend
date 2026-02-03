import RconSettingsSection from "@components/display/GameServer/GameServerSettings/sections/RconSettingsSection/RconSettingsSection.tsx";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/server/$serverId/settings/rcon")({
  component: RouteComponent,
});

function RouteComponent() {
  return <RconSettingsSection />;
}
