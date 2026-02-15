import WebhooksSettingsSection from "@components/display/GameServer/GameServerSettings/sections/WebhooksSettingsSection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/server/$serverId/settings/webhooks")({
  component: RouteComponent,
});

function RouteComponent() {
  return <WebhooksSettingsSection />;
}
