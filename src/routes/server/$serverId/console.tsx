import LogDisplay from "@components/display/LogDisplay/LogDisplay.tsx";
import { createFileRoute } from "@tanstack/react-router";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";

export const Route = createFileRoute("/server/$serverId/console")({
  component: RouteComponent,
});

function RouteComponent() {
  const { serverId } = Route.useParams();
  const { logs } = useGameServerLogs(serverId ?? "");
  const { gameServer } = useGameServer(serverId ?? "");

  if (!gameServer) {
    return null;
  }

  return (
    <div className="container mx-auto flex flex-col gap-4 grow h-full">
      <LogDisplay logMessages={logs} />
    </div>
  );
}
