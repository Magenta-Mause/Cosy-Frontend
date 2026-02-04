import { FileBrowserDialog } from "@components/display/GameServer/FileBrowser/FileBrowserDialog/FileBrowserDialog";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import useGameServer from "@/hooks/useGameServer/useGameServer";

export const Route = createFileRoute("/server/$serverId/files/$")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const gameServer = useGameServer(serverId);
  const { t } = useTranslation();
  const { _splat: path } = Route.useParams();

  if (gameServer === undefined)
    return (
      <div className="flex justify-center items-center h-screen">{t("filesPage.loading")}</div>
    );

  return (
    <div className="container mx-auto flex flex-col gap-4 grow h-full">
      <FileBrowserDialog
        serverUuid={serverId}
        volumes={gameServer.volume_mounts}
        path={`/${path}`}
      />
    </div>
  );
}
