import GameServerHouseAligner from "@components/display/GameServer/GameServerHouseAligner/GameServerHouseAligner.tsx";
import type { GameServerConfigurationEntity } from "@/api/generated/model";

const GameServerDisplay = (props: {
  gameServerConfigurations: GameServerConfigurationEntity[];
}) => {
  return (
    <div className={"w-full h-full"}>
      <GameServerHouseAligner gameServers={props.gameServerConfigurations} />
    </div>
  );
};

export default GameServerDisplay;
