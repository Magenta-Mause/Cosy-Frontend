import {createFileRoute, Outlet} from "@tanstack/react-router";
import {useTranslation} from "react-i18next";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import ServerDetailPageLayout from "@components/display/GameServer/ServerDetailPageLayout/ServerDetailPageLayout.tsx";

export const Route = createFileRoute("/server/$serverId")({
  component: GameServerDetailPage,
});


function GameServerDetailPage() {
  const {t} = useTranslation();
  const {serverId} = Route.useParams();
  const gameServer = useGameServer(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>{t("serverPage.notFound")}</div>;
  }

  return <ServerDetailPageLayout gameServer={gameServer}><Outlet/></ServerDetailPageLayout>;
}


