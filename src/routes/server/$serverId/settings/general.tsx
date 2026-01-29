import GeneralSettingsSection from "@components/display/GameServer/GameServerSettings/sections/GeneralSettingsSection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/server/$serverId/settings/general")({
  component: RouteComponent,
});

function RouteComponent() {
  return <GeneralSettingsSection />
}
