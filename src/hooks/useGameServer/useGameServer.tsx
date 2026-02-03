import { useMemo } from "react";
import { useTypedSelector } from "@/stores/rootReducer.ts";

const useGameServer = (serverUuid: string) => {
  const gameServers = useTypedSelector((state) => state.gameServerSliceReducer.data);
  const gameServersInitialized = useTypedSelector(
    (state) => state.gameServerSliceReducer.initialized,
  );

  return useMemo(() => {
    if (gameServersInitialized === false) {
      return { server: undefined, notFound: false };
    }

    const gameServer = gameServers.find((server) => server.uuid === serverUuid);

    return {
      gameServer,
      notFound: !gameServer,
    };
  }, [gameServersInitialized, gameServers, serverUuid]);
};

export default useGameServer;
