import LogDisplay from "@components/display/LogDisplay/LogDisplay.tsx";
import {createFileRoute} from "@tanstack/react-router";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";
import {Button} from "@components/ui/button.tsx";
import {startServiceSse} from "@/api/sse.ts";
import {stopService} from "@/api/generated/backend-api.ts";

export const Route = createFileRoute("/server/$serverId")({
  component: GameServerDetailPage,
});

function GameServerDetailPage() {
  const {serverId} = Route.useParams();
  const gameServer = useGameServer(serverId ?? "");
  const gameServerLogs = useGameServerLogs(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>404 - Game Server not found</div>;
  }

  return (
    <div className="container mx-auto py-20 flex flex-col gap-4">
      <div className="flex flex-row gap-2 items-center justify-between">
        <p>
          {gameServer.server_name}
        </p>
        <div className={"gap-5 flex flex-row"}>
          <Button onClick={() => {
            startServiceSse(gameServer.uuid)
          }}>
            Start
          </Button>
          <Button onClick={() => {
            stopService(gameServer.uuid)
          }}>
            Stop
          </Button>
        </div>
      </div>
      <div>
        <LogDisplay logMessages={gameServerLogs}/>
      </div>
    </div>
  );
}
