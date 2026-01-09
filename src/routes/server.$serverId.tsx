import {createFileRoute} from '@tanstack/react-router'
import {useQuery} from '@tanstack/react-query'
import {getGameServerById} from '@/api/generated/backend-api.ts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/ui/card.tsx'
import LogDisplay from "@components/display/LogDisplay/LogDisplay.tsx";
import {useTypedSelector} from "@/stores/rootReducer.ts";
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
