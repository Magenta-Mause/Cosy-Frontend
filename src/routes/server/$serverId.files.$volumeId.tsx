import { FileBrowserDialog } from "@components/display/GameServer/FileBrowser/FileBrowserDialog/FileBrowserDialog";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/server/$serverId/files/$volumeId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId, volumeId } = Route.useParams();

  return (
    <div className="flex justify-center items-center h-screen">
      <FileBrowserDialog serverUuid={serverId} volumeUuid={volumeId} />
    </div>
  );
}
