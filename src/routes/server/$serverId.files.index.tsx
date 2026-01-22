import useGameServer from "@/hooks/useGameServer/useGameServer";
import { FileBrowserDialog } from "@components/display/GameServer/FileBrowser/FileBrowserDialog/FileBrowserDialog";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/server/$serverId/files/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const gameServer = useGameServer(serverId);

  if (gameServer === undefined)
    return <div className="flex justify-center items-center h-screen">Loading Game Server</div>;

  return (
    <div className="container mx-auto flex flex-col gap-4 grow h-full">
      <FileBrowserDialog serverUuid={serverId} volumes={gameServer.volume_mounts} />
    </div>
  );
}
