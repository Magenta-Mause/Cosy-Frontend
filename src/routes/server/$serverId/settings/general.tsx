import GeneralSettingsSection from "@components/display/GameServer/GameServerSettings/sections/GeneralSettingsSection";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { GameServerAccessGroupDtoPermissionsItem } from "@/api/generated/model";
import useGameServerPermissions from "@/hooks/useGameServerPermissions/useGameServerPermissions";

export const Route = createFileRoute("/server/$serverId/settings/general")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const { hasPermission } = useGameServerPermissions(serverId ?? "");
  const { t } = useTranslation();

  const canAccess = hasPermission(GameServerAccessGroupDtoPermissionsItem.CHANGE_SERVER_CONFIGS);

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">
            {t("settings.noAccessFor", {
              element: t("components.GameServerSettings.tabs.general"),
            })}
          </div>
          <div className="text-muted-foreground">{t("settings.noAccessDescription")}</div>
        </div>
      </div>
    );
  }

  return <GeneralSettingsSection />;
}
