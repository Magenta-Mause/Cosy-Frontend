import { GameServerDetailContext } from "@components/display/GameServer/GameServerDetailPageLayout/GameServerDetailPageLayout";
import { useContext } from "react";

const useActiveGameServer = () => {
  const { gameServer } = useContext(GameServerDetailContext);

  return { gameServer };
};

export default useActiveGameServer;
