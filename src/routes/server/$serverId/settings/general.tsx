import GeneralSettingsSection from "@components/display/GameServer/GameServerSettings/sections/GeneralSettingsSection";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/server/$serverId/settings/general")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="container mx-auto flex flex-col gap-4 grow h-full">
      <GeneralSettingsSection />
    </div>
  );
}
