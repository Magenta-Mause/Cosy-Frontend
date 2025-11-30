import CreateGameServer from "@components/CreateGameServer/CreateGameServer";
import GameServerConfigurationsDisplay from "@components/display/GameServerConfiguration/GameServerConfigurationsDisplay/GameServerConfigurationsDisplay.tsx";
import { createFileRoute } from "@tanstack/react-router";
import { useTypedSelector } from "@/stores/rootReducer.ts";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const gameServers = useTypedSelector((state) => state.gameServerConfigurationSliceReducer.data);

  return (
    <div
      className="
    h-screen
    w-screen
    flex
    flex-row
    justify-center
    items-center
    "
    >
      <GameServerConfigurationsDisplay gameServerConfigurations={gameServers} />
      <CreateGameServer />
    </div>
  );
}

export default Index;
