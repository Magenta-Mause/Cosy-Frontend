import {createFileRoute} from '@tanstack/react-router'
import LogDisplay from "@components/display/LogDisplay/LogDisplay.tsx";
import useGameServer from "@/hooks/useGameServer/useGameServer.tsx";
import useGameServerLogs from "@/hooks/useGameServerLogs/useGameServerLogs.tsx";

export const Route = createFileRoute('/server/$serverId')({
  component: GameServerDetailPage,
})

function GameServerDetailPage() {
  const {serverId} = Route.useParams()
  const gameServer = useGameServer(serverId ?? "");
  const gameServerLogs = useGameServerLogs(serverId ?? "");

  if (!serverId || !gameServer) {
    return <div>404 - Game Server not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div>{gameServer.server_name}</div>
      <div>
        <LogDisplay logMessages={gameServerLogs}/>
      </div>
    </div>
  )
}
